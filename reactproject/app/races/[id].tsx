import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";

import { getCurrentUser } from "../services/authUserService";
import { applyRaceResultFromPositions, Finisher } from "../services/ratingService";
import { addParticipant, getRaceById, removeParticipant, updateRace } from "../services/raceService";
import { FirestoreUser, Race } from "../types";

const toDate = (value: unknown): Date => {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

const toSafeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatSkill = (value: unknown): string => toSafeNumber(value, 0).toFixed(1);

const normalizeRaceId = (value: string | string[] | undefined): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
};

const RaceDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const raceId = normalizeRaceId(id);

  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirestoreUser | null>(null);
  const [joined, setJoined] = useState(false);
  const [finishers, setFinishers] = useState<Finisher[]>([]);
  const [submittingScores, setSubmittingScores] = useState(false);

  const loadRaceDetails = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (!raceId) {
        setRace(null);
        setJoined(false);
        setFinishers([]);
        return;
      }

      const data = await getRaceById(raceId);
      if (!data) {
        setRace(null);
        setJoined(false);
        setFinishers([]);
        return;
      }

      const participants = Array.isArray(data.participants) ? data.participants : [];
      const safeRace: Race = { ...data, participants };
      setRace(safeRace);

      const userJoined = !!user && participants.some((participant) => participant.id === user.id);
      setJoined(userJoined);

      setFinishers(
        participants.map((participant, index) => ({
          user: participant,
          position: index + 1,
          clean: true,
          incident: false,
        })),
      );
    } catch (error: any) {
      console.error("Kon race detail niet laden", error);
      Alert.alert("Fout", error?.message ?? "Kon race detail niet laden");
      setRace(null);
      setJoined(false);
      setFinishers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRaceDetails();
  }, [raceId]);

  const handleJoinRace = async () => {
    if (!currentUser || !raceId || !race) {
      Alert.alert("Fout", "Je kan nu niet inschrijven.");
      return;
    }

    try {
      await addParticipant(raceId, {
        id: currentUser.id,
        name: currentUser.name,
        lastName: currentUser.lastName,
        skill: currentUser.skill,
      });

      await loadRaceDetails();
      Alert.alert("Succes", "Je bent succesvol ingeschreven.");
    } catch (error: any) {
      Alert.alert("Fout", error?.message ?? "Kon niet inschrijven");
    }
  };

  const confirmJoinRace = () => {
    if (!currentUser) {
      Alert.alert("Fout", "Je moet ingelogd zijn om in te schrijven.");
      return;
    }

    if (!race) return;

    const raceDate = toDate(race.date);
    const belowMinimum = race.participants.length < race.minParticipants;
    const isPastStart = raceDate <= new Date();
    const isCancelled = race.status === "cancelled" || (belowMinimum && isPastStart);

    if (isCancelled) {
      Alert.alert("Geannuleerd", "Race gaat niet door wegens te weinig deelnemers.");
      return;
    }

    if (race.participants.length >= race.spots) {
      Alert.alert("Vol", "Deze race zit al vol.");
      return;
    }

    if (toSafeNumber(currentUser.skill, 0) < toSafeNumber(race.minSkill, 0)) {
      Alert.alert("Niet toegestaan", `Minimum skill is ${formatSkill(race.minSkill)}`);
      return;
    }

    Alert.alert(
      "Inschrijven",
      `Weet je zeker dat je wilt inschrijven? Inschrijvingskosten: €${race.entryFee}`,
      [
        {
          text: "Annuleren",
          style: "cancel",
        },
        {
          text: "Inschrijven",
          onPress: () => {
            void handleJoinRace();
          },
        },
      ],
    );
  };

  const handleLeaveRace = () => {
    if (!raceId || !currentUser) {
      Alert.alert("Fout", "Je kan nu niet uitschrijven.");
      return;
    }

    Alert.alert("Uitschrijven", "Weet je zeker dat je wilt uitschrijven?", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Uitschrijven",
        style: "destructive",
        onPress: async () => {
          try {
            await removeParticipant(raceId, currentUser.id);
            await loadRaceDetails();
            Alert.alert("Succes", "Je bent uitgeschreven.");
          } catch (error: any) {
            Alert.alert("Fout", error?.message ?? "Kon niet uitschrijven");
          }
        },
      },
    ]);
  };

  const handleScoreSubmit = async () => {
    if (!race || finishers.length === 0) return;

    setSubmittingScores(true);
    try {
      const orderedFinishers = finishers.map((finisher, index) => ({
        ...finisher,
        position: index + 1,
      }));

      const updates = await applyRaceResultFromPositions(orderedFinishers, {
        isCompetitive: race.isCompetitive,
        durationInM: race.durationInM,
        trackDifficulty: race.track.difficulty,
      });

      await updateRace(race.id, { status: "completed" });
      setRace({ ...race, status: "completed" });

      const summary = updates
        .map((update) => {
          const participant = race.participants.find((x) => x.id === update.id);
          const name = participant ? `${participant.name} ${participant.lastName}` : update.id;
          const sign = update.delta > 0 ? "+" : "";
          return `${name}: ${sign}${update.delta.toFixed(1)} -> ${update.newSkill.toFixed(1)}`;
        })
        .join("\n");

      Alert.alert("Scores verwerkt", summary || "Skills bijgewerkt.");
    } catch (error: any) {
      Alert.alert("Fout", error?.message ?? "Kon scores niet verwerken");
    } finally {
      setSubmittingScores(false);
    }
  };

  const moveFinisher = (index: number, direction: "up" | "down") => {
    setFinishers((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const updated = [...prev];
      const current = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = current;
      return updated;
    });
  };

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
        <Pressable style={[styles.actionButton, { marginTop: 12 }]} onPress={() => router.back()}>
          <Text style={styles.actionButtonText}>Ga terug</Text>
        </Pressable>
      </View>
    );
  }

  if (!race.track) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.empty}>Race data is onvolledig (circuit ontbreekt).</Text>
        <Pressable style={[styles.actionButton, { marginTop: 12 }]} onPress={() => router.back()}>
          <Text style={styles.actionButtonText}>Ga terug</Text>
        </Pressable>
      </View>
    );
  }

  const raceDate = toDate(race.date);
  const belowMinimum = race.participants.length < race.minParticipants;
  const isPastStart = raceDate <= new Date();
  const isCancelled = race.status === "cancelled" || (belowMinimum && isPastStart);
  const currentUserSkill = toSafeNumber(currentUser?.skill, 0);
  const raceMinSkill = toSafeNumber(race.minSkill, 0);
  const skillTooLow = currentUser ? currentUserSkill < raceMinSkill : false;
  const joinDisabled = isCancelled || skillTooLow;

  const difficultyStyle =
    race.track.difficulty === "easy"
      ? styles.easy
      : race.track.difficulty === "medium"
        ? styles.medium
        : styles.hard;

  const renderFinisher = (item: Finisher, index: number) => {
    const position = index + 1;

    return (
      <View style={styles.scoreRow}>
        <View style={styles.finisherMain}>
          <Text style={styles.participantName}>{position}. {item.user.name} {item.user.lastName}</Text>
          <Text style={styles.participantSkill}>Skill: {formatSkill(item.user.skill)}</Text>
        </View>

        <View style={styles.reorderControls}>
          <Pressable style={styles.tinyButton} onPress={() => moveFinisher(index, "up")}> 
            <Text style={styles.tinyButtonText}>Omhoog</Text>
          </Pressable>
          <Pressable style={styles.tinyButton} onPress={() => moveFinisher(index, "down")}> 
            <Text style={styles.tinyButtonText}>Omlaag</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.togglePillSmall, item.clean && styles.togglePillActive]}
          onPress={() => {
            setFinishers((prev) =>
              prev.map((finisher) =>
                finisher.user.id === item.user.id
                  ? {
                      ...finisher,
                      clean: !Boolean(finisher.clean),
                      incident: Boolean(finisher.clean),
                    }
                  : finisher,
              ),
            );
          }}
        >
          <Text style={[styles.togglePillText, item.clean && styles.togglePillTextActive]}>
            {item.clean ? "Clean" : "Incident"}
          </Text>
        </Pressable>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <Text style={styles.title}>{race.track.location}</Text>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, difficultyStyle]}>
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
          <Text style={styles.value}>{raceDate.toLocaleDateString("nl-BE")}</Text>
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
          <Text style={styles.value}>{formatSkill(race.minSkill)}</Text>
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
        <Text style={styles.sectionTitle}>Deelnemers ({race.participants.length})</Text>
        {race.participants.length === 0 ? (
          <Text style={styles.empty}>Nog geen deelnemers</Text>
        ) : (
          race.participants.map((participant) => (
            <View key={participant.id} style={styles.participantRow}>
              <Text style={styles.participantName}>{participant.name} {participant.lastName}</Text>
              <Text style={styles.participantSkill}>skill: {participant.skill} star</Text>
            </View>
          ))
        )}
      </View>

      {race.participants.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uitslag invoeren</Text>
          <Text style={styles.helper}>Sleep rijders om te ordenen (boven = winnaar). Tik op de chip voor clean/incident per rijder.</Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View>
      {race.participants.length > 0 && (
        <Pressable
          style={[styles.actionButton, styles.scoreButton, submittingScores && styles.blockedButton]}
          onPress={handleScoreSubmit}
          disabled={submittingScores || race.status === "completed"}
        >
          <Text style={styles.actionButtonText}>
            {race.status === "completed" ? "Race afgerond" : submittingScores ? "Verwerken..." : "Verwerk scores"}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={[
          styles.actionButton,
          (isCancelled || skillTooLow) && styles.blockedButton,
          joined && styles.leaveButton,
        ]}
        onPress={joined ? handleLeaveRace : confirmJoinRace}
        disabled={joinDisabled}
      >
        <Text style={styles.actionButtonText}>
          {isCancelled
            ? "race geannuleerd"
            : skillTooLow
              ? `min skill ${formatSkill(race.minSkill)}`
              : joined
                ? "uitschrijven"
                : "inschrijven"}
        </Text>
      </Pressable>

      {isCancelled && <Text style={styles.cancelledText}>Race gaat niet door: onvoldoende deelnemers.</Text>}
      {skillTooLow && (
        <Text style={styles.warningText}>
          Je skill ({formatSkill(currentUser?.skill)}) is lager dan de vereiste {formatSkill(race.minSkill)}.
        </Text>
      )}

      {joined && (
        <Pressable style={styles.chatButton} onPress={() => router.push(`/chatroom/${race.id}` as any)}>
          <Text style={styles.actionButtonText}>Chatroom</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderHeader()}

      {race.participants.length > 0 ? (
        <View style={styles.section}>
          {finishers.map((item, index) => (
            <View key={item.user.id}>{renderFinisher(item, index)}</View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Nog geen uitslag om te ordenen</Text>
      )}

      {renderFooter()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1115" },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  centered: { justifyContent: "center", alignItems: "center" },

  title: {
    color: "#f0f6fc",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
  },

  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { color: "#8b949e", fontSize: 14 },
  value: { color: "#c9d1d9", fontSize: 14, fontWeight: "600" },

  empty: { color: "#8b949e", fontSize: 14, fontStyle: "italic", textAlign: "center" },
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#30363d",
    gap: 10,
  },
  finisherMain: { flex: 1 },
  reorderControls: {
    gap: 6,
    marginRight: 4,
  },
  tinyButton: {
    borderWidth: 1,
    borderColor: "#30363d",
    backgroundColor: "#161b22",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tinyButtonText: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "700",
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
  togglePillText: { color: "#8b949e", fontSize: 13, fontWeight: "700" },
  togglePillTextActive: { color: "#2ea043" },

  actionButton: {
    backgroundColor: "#238636",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#2ea043",
  },
  actionButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  leaveButton: { backgroundColor: "#da3633", borderColor: "#f85149" },
  blockedButton: { backgroundColor: "#b62324", borderColor: "#f85149" },
  scoreButton: { marginTop: 12 },
  cancelledText: {
    color: "#f85149",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "700",
  },
  warningText: {
    color: "#f85149",
    marginTop: 8,
    textAlign: "center",
  },
  helper: { color: "#8b949e", fontSize: 12, marginTop: 6 },
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
});

export default RaceDetail;
