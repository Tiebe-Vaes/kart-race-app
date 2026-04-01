import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getRaceById, updateRace } from "../services/raceService";
import { Race } from "../types";
import { addParticipant } from "../services/raceService";
import { User, FirestoreUser } from "../types";
import { getCurrentUser } from "../services/authUserService";
// import SearchBar from "../components/SearchBar";
import { removeParticipant } from "../services/raceService";
import { Timestamp } from "firebase/firestore";
import { applyRaceResultFromPositions, Finisher } from "../services/ratingService";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";

const RaceDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirestoreUser | null>(null);
  const [joined, setJoined] = useState<boolean>(false);
  const [finishers, setFinishers] = useState<Finisher[]>([]);
  const [submittingScores, setSubmittingScores] = useState(false);
  // const [search, setSearch] = useState("");

  const handleJoinRace = async () => {
    if (!currentUser) {
      Alert.alert("Fout", "Je moet ingelogd zijn om in te schrijven.");
      return;
    }
    try {
      await addParticipant(id, {
        id: currentUser.id,
        name: currentUser.name,
        lastName: currentUser.lastName,
        skill: currentUser.skill,
      });
      setJoined(true);
      await loadRace(currentUser);
      Alert.alert("je bent succesvol ingeschreven");
    } catch (e: any) {
      Alert.alert("fout", e.message);
    }
  };

  const joinRace = () => {
    if (!currentUser) {
      Alert.alert("Fout", "Je moet ingelogd zijn om in te schrijven.");
      return;
    }
    if (race) {
      const raceDate =
        race.date instanceof Timestamp ? race.date.toDate() : new Date(race.date);
      const belowMinimum = race.participants.length < race.minParticipants;
      const isPastStart = raceDate <= new Date();
      if (race.status === "cancelled" || (belowMinimum && isPastStart)) {
        Alert.alert("Geannuleerd", "Race gaat niet door wegens te weinig deelnemers.");
        return;
      }
    }
    if (race!.participants.length >= race!.spots) {
      Alert.alert("Vol", "Deze race zit al vol.");
      return;
    }
    Alert.alert(
      "Inschrijven",
      `Weet je zeker dat je wilt inschrijven? Inschrijvingskosten: €${race?.entryFee}`,
      [
        {
          text: "Annuleren",
          style: "cancel",
        },
        {
          text: "Inschrijven",
          onPress: handleJoinRace,
        },
      ],
    );
  };
  const leaveRace = () => {
    Alert.alert("Uitschrijven", "Weet je zeker dat je wilt uitschrijven?", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Uitschrijven",
        style: "destructive",
        onPress: async () => {
          try {
            await removeParticipant(id, currentUser!.id);
            setJoined(false);
            await loadRace(currentUser);
            Alert.alert("Je bent uitgeschreven.");
          } catch (e: any) {
            Alert.alert("Fout", e.message);
          }
        },
      },
    ]);
  };

  const loadRace = async (user: FirestoreUser | null) => {
    if (!id) {
      setRace(null);
      setJoined(false);
      setLoading(false);
      return;
    }

    const data = await getRaceById(String(id));
    if (!data) {
      setRace(null);
      setJoined(false);
      setLoading(false);
      return;
    }

    setRace(data);
    const isParticipant = data.participants.some((p) => p.id === user?.id);
    setJoined(isParticipant);

    const ordered = data.participants.map((p, idx) => ({ user: p, position: idx + 1, clean: true, incident: false }));
    setFinishers(ordered);
    setLoading(false);
  };

  const loadUser = async () => {
    const data = await getCurrentUser();
    setCurrentUser(data);
    return data as FirestoreUser;
  };

  useEffect(() => {
    const init = async () => {
      const user = await loadUser(); // wacht op user
      await loadRace(user);         // geef user mee
    };
    init();
  }, [id]);
  //race loading or not found
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#58a6ff" size="large" />
      </View>
    );
  }

  if (!race) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.empty}>Race niet gevonden</Text>
        <Pressable style={[styles.signInButton, { marginTop: 12 }]} onPress={() => router.back()}>
          <Text style={styles.signInText}>Ga terug</Text>
        </Pressable>
      </View>
    );
  }

  const raceDate =
    race.date instanceof Timestamp ? race.date.toDate() : new Date(race.date);
  const belowMinimum = race.participants.length < race.minParticipants;
  const isPastStart = raceDate <= new Date();
  const isCancelled = race.status === "cancelled" || (belowMinimum && isPastStart);
  const skillTooLow = currentUser ? currentUser.skill < (race.minSkill || 0) : false;

  const disabled = isCancelled || skillTooLow;

  const handleScoreSubmit = async () => {
    if (!race || finishers.length === 0) return;
    setSubmittingScores(true);
    try {
      const orderedFinishers = finishers.map((f, idx) => ({ ...f, position: idx + 1 }));

      const updates = await applyRaceResultFromPositions(orderedFinishers, {
        isCompetitive: race.isCompetitive,
        durationInM: race.durationInM,
        trackDifficulty: race.track.difficulty,
      });

      await updateRace(race.id, { status: "completed" });
      setRace({ ...race, status: "completed" });

      const summary = updates
        .map((u) => {
          const p = race.participants.find((x) => x.id === u.id);
          const name = p ? `${p.name} ${p.lastName}` : u.id;
          const sign = u.delta > 0 ? "+" : "";
          return `${name}: ${sign}${u.delta.toFixed(1)} → ${u.newSkill.toFixed(1)}`;
        })
        .join("\n");

      Alert.alert("Scores verwerkt", summary || "Skills bijgewerkt.");
    } catch (e: any) {
      Alert.alert("Fout", e?.message ?? "Kon scores niet verwerken");
    } finally {
      setSubmittingScores(false);
    }
  };

  const renderFinisher = ({ item, drag, isActive, getIndex }: RenderItemParams<Finisher>) => {
    const position = (getIndex?.() ?? 0) + 1;
    return (
      <Pressable
        style={[styles.scoreRow, isActive && styles.dragActive]}
        onLongPress={drag}
        delayLongPress={50}
      >
        <View style={styles.dragHandle}><Text style={styles.dragHandleText}>≡</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.participantName}>{position}. {item.user.name} {item.user.lastName}</Text>
          <Text style={styles.participantSkill}>Skill: {item.user.skill.toFixed(1)}</Text>
        </View>
        <Pressable
          style={[styles.togglePillSmall, item.clean && styles.togglePillActive]}
          onPress={() => {
            setFinishers((prev) => prev.map((f) => f.user.id === item.user.id ? { ...f, clean: !f.clean, incident: f.clean } : f));
          }}
        >
          <Text style={[styles.togglePillText, item.clean && styles.togglePillTextActive]}>
            {item.clean ? "Clean" : "Incident"}
          </Text>
        </Pressable>
      </Pressable>
    );
  };
  //else: race found
  const renderHeader = () => (
    <View>
      <Text style={styles.title}>{race.track.location}</Text>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, styles[race.track.difficulty]]}>
          <Text style={styles.badgeText}>{race.track.difficulty}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Race info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Duur</Text>
          <Text style={styles.value}>{race.durationInM} min</Text>

        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Datum</Text>
          <Text style={styles.value}>{race.date instanceof Object
            ? race.date.toDate().toLocaleDateString("nl-BE")
            : race.date}</Text>

        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{race.isCompetitive ? "Competitief" : "Casual"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Min. deelnemers</Text>
          <Text style={styles.value}>{race.minParticipants}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Min. skill</Text>
          <Text style={styles.value}>{race.minSkill?.toFixed(1) ?? "-"}</Text>
        </View>
        
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Circuit info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Lengte</Text>
          <Text style={styles.value}>{race.track.length} m</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Max plaatsen</Text>
          <Text style={styles.value}>{race.track.maxSpots}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Deelnemers ({race.participants.length})
        </Text>
        {race.participants.length === 0 ? (
          <Text style={styles.empty}>Nog geen deelnemers</Text>
        ) : (
          race.participants.map((user, index) => (
            <View key={index} style={styles.participantRow}>
              <Text style={styles.participantName}>
                {user.name} {user.lastName}
              </Text>
              <Text style={styles.participantSkill}>
                skill: {user.skill} ⭐
              </Text>
            </View>
          ))
        )}
      </View>

      {race.participants.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Uitslag invoeren
          </Text>
          <Text style={styles.helper}>Sleep rijders om te ordenen (boven = winnaar). Tik op de chip voor clean/incident per rijder.</Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View>
      {race.participants.length > 0 && (
        <Pressable
          style={[styles.signInButton, styles.scoreButton, submittingScores && styles.blockedButton]}
          onPress={handleScoreSubmit}
          disabled={submittingScores || race.status === "completed"}
        >
          <Text style={styles.signInText}>
            {race.status === "completed" ? "Race afgerond" : submittingScores ? "Verwerken..." : "Verwerk scores"}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={[
          styles.signInButton,
          (isCancelled || skillTooLow) && styles.blockedButton,
          joined && styles.leaveButton,
        ]}
        onPress={joined ? leaveRace : joinRace}
        disabled={disabled}
      >
        <Text style={styles.signInText}>
          {isCancelled
            ? "race geannuleerd"
            : skillTooLow
              ? `min skill ${race.minSkill}`
            : joined
              ? "uitschrijven"
              : "inschrijven"}
        </Text>
      </Pressable>
      {isCancelled && (
        <Text style={styles.cancelledText}>
          Race gaat niet door: onvoldoende deelnemers.
        </Text>
      )}
      {skillTooLow && (
        <Text style={styles.warningText}>
          Je skill ({currentUser?.skill.toFixed(1)}) is lager dan de vereiste {race.minSkill?.toFixed(1)}.
        </Text>
      )}
      {joined && (
        <Pressable
          style={styles.chatButton}
          onPress={() => router.push(`/chatroom/${id}`)}
        >
          <Text style={styles.signInText}>💬 chatroom</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <DraggableFlatList<Finisher>
      style={styles.container}
      contentContainerStyle={styles.content}
      data={race.participants.length > 0 ? finishers : []}
      keyExtractor={(item: Finisher) => item.user.id}
      renderItem={renderFinisher}
      onDragEnd={({ data }: { data: Finisher[] }) => setFinishers(data)}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        race.participants.length > 0 ? undefined : <Text style={styles.empty}>Nog geen uitslag om te ordenen</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1115" },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  loading: { color: "#fff", textAlign: "center", marginTop: 40 },
  centered: { justifyContent: "center", alignItems: "center" },
  title: {
    color: "#f0f6fc",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 0,
    marginBottom: 20,
  },
  chatButton: {
    backgroundColor: "#1f6feb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#388bfd",
  },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  easy: { backgroundColor: "#4caf50" },
  medium: { backgroundColor: "#ff9800" },
  hard: { backgroundColor: "#f44336" },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  section: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  sectionTitle: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  warningText: {
    color: "#f85149",
    marginTop: 8,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { color: "#8b949e", fontSize: 14 },
  value: { color: "#c9d1d9", fontSize: 14, fontWeight: "600" },
  empty: { color: "#555", fontSize: 14, fontStyle: "italic" },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#30363d",
  },
  participantName: { color: "#c9d1d9", fontSize: 14 },
  participantSkill: { color: "#8b949e", fontSize: 14 },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#30363d",
  },
  dragActive: {
    backgroundColor: "#111723",
  },
  dragHandle: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  dragHandleText: {
    color: "#8b949e",
    fontSize: 18,
  },
  scoreInput: {
    width: 80,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: "#fff",
    fontSize: 14,
    textAlign: "right",
  },
  togglePillSmall: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363d",
    backgroundColor: "#161b22",
  },
  togglePillActive: {
    borderColor: "#2ea043",
    backgroundColor: "#0f1f16",
  },
  togglePillText: {
    color: "#8b949e",
    fontSize: 13,
    fontWeight: "700",
  },
  togglePillTextActive: {
    color: "#2ea043",
  },
  signInButton: {
    backgroundColor: "#238636",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#2ea043",
  },
  leaveButton: {
    backgroundColor: "#da3633",
    borderColor: "#f85149",
  },
  blockedButton: {
    backgroundColor: "#b62324",
    borderColor: "#f85149",
  },
  scoreButton: {
    marginTop: 12,
  },
  cancelledText: {
    color: "#f85149",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "700",
  },
  signInText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  helper: { color: "#8b949e", fontSize: 12, marginTop: 6 },
});

export default RaceDetail;
