import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { seedTracks, seedUsers, seedRaces } from "./seedData";
import { addTrack } from "./services/trackService";
import { addUser } from "./services/userService";
import { addRace, getRaces, deleteRace } from "./services/raceService";
import { Race } from "./types";
import { useRouter } from "expo-router";
import { getTracks, deleteTrack } from "./services/trackService";
import { getUsers, deleteUser } from "./services/userService";
import SearchBar from "./components/SearchBar";
import { TextInput } from "react-native";

const App = () => {
  const router = useRouter();
  const seed = async () => {
    try {
      //eerst data reset

      const bestaandeRaces = await getRaces();
      console.log(`${bestaandeRaces.length} races verwijderen`);
      await Promise.all(
        bestaandeRaces.map((race) => deleteRace(String(race.id))),
      );

      const bestaandeTracks = await getTracks();
      console.log(`${bestaandeTracks.length} tracks verwijderen`);
      await Promise.all(
        bestaandeTracks.map((track) => deleteTrack(String(track.id))),
      );

      const bestaandeUsers = await getUsers();
      console.log(`${bestaandeUsers.length} users verwijderen`);
      await Promise.all(
        bestaandeUsers.map((user) => deleteUser(String(user.id))),
      );

      //data toevoegen
      for (const track of seedTracks) await addTrack(track);
      for (const user of seedUsers) await addUser(user);
      for (const race of seedRaces) await addRace(race);
      loadRaces();
    } catch (er) {
      console.error("Seeding failed");
    }
  };

  const [races, setRaces] = useState<Race[]>([]);

  const loadRaces = async () => {
    const data = await getRaces();
    setRaces(data);
  }

  const [search, setSearch] = useState("");

  //filters
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [available, setAvailable] = useState<boolean>(false);
  const [maxEntryFee, setMaxEntryFee] = useState<string>("");



  useEffect(() => {
    loadRaces();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Races</Text>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Zoek races..."
      />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        {(["all", "easy", "medium", "hard"] as const).map((d) => (
          <Pressable key={d} onPress={() => setDifficulty(d)}
            style={{
              paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
              borderWidth: 1, borderColor: difficulty === d ? "#2ea043" : "#30363d",
              backgroundColor: difficulty === d ? "#238636" : "#161b22"
            }}>
            <Text style={{ color: difficulty === d ? "#fff" : "#8b949e", fontSize: 13, fontWeight: "600" }}>
              {d === "all" ? "Alle" : d}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <Pressable onPress={() => setAvailable(!available)}
          style={{
            paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
            borderWidth: 1, borderColor: available ? "#388bfd" : "#30363d",
            backgroundColor: available ? "#1f6feb" : "#161b22"
          }}>
          <Text style={{ color: available ? "#fff" : "#8b949e", fontSize: 13, fontWeight: "600" }}>
            Beschikbaar
          </Text>
        </Pressable>

        <TextInput placeholder="Max €" placeholderTextColor="#555" value={maxEntryFee}
          onChangeText={setMaxEntryFee} keyboardType="numeric"
          style={{
            flex: 1, backgroundColor: "#161b22", borderRadius: 20,
            paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1,
            borderColor: "#30363d", color: "#f0f6fc", fontSize: 13
          }} />
      </View>

      {races
        .filter((race) => race.track != null)
        .filter(
          (race) =>
            race.track.location.toLowerCase().includes(search.toLowerCase()) ||
            race.track.difficulty.toLowerCase().includes(search.toLowerCase()),
        )
        .filter((race) => difficulty === "all" || race.track.difficulty === difficulty)
        .filter((race) => !available || race.track.available)
        .filter((race) => !maxEntryFee || race.entryFee <= Number(maxEntryFee))
        .map((race, index) => (
          <Pressable
            key={index}
            onPress={() => router.push(`/races/${race.id}` as any)}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.locationText}>{race.track.location}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        race.track.difficulty === "easy"
                          ? "#238636"
                          : race.track.difficulty === "medium"
                            ? "#9a6700"
                            : "#da3633",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{race.track.difficulty}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoColumn}>
                  <Text style={styles.label}>Duur</Text>
                  <Text style={styles.value}>{race.durationInM} min</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.label}>Inschrijfgeld</Text>
                  <Text style={styles.value}>€{race.entryFee}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.label}>Bezetting</Text>
                  <Text style={styles.value}>
                    {race.participants.length} / {race.spots}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      <View>
        <Pressable style={styles.seedButton} onPress={seed}>
          <Text style={styles.seedButtonText}>Seed Database</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1115",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  seedButton: {
    width: 120,
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#22272e3d",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  seedButtonText: {
    color: "#373737",
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  locationText: {
    color: "#f0f6fc",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#30363d",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    flex: 1,
  },
  label: {
    color: "#8b949e",
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: "600",
  },
  value: {
    color: "#c9d1d9",
    fontSize: 15,
    fontWeight: "500",
  },
});

export default App;
