import { Pressable, ScrollView, Text, View } from "react-native";
import sharedStyles from "./styles";
import LogoutButton from "./components/LogoutButton";
import SearchBar from "./components/SearchBar";
import { useEffect, useState } from "react";
import { seedTracks, seedUsers, seedRaces } from "./seedData";
import { addTrack } from "./services/trackService";
import { addUser } from "./services/userService";
import { addRace, getRaces, deleteRace } from "./services/raceService";
import { Race } from "./types";
import { useRouter } from "expo-router";
import { getTracks, deleteTrack } from "./services/trackService";
import { getUsers, deleteUser } from "./services/userService";

const App = () => {
  const router = useRouter();
  const seed = async () => {
    try {
      //eerst data reset
      const bestaandeRaces = await getRaces();
      for (const race of bestaandeRaces) await deleteRace(String(race.id));

      const bestaandeTracks = await getTracks();
      for (const track of bestaandeTracks) await deleteTrack(String(track.id));

      const bestaandeUsers = await getUsers();
      for (const user of bestaandeUsers) await deleteUser(String(user.id));

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
  const [search, setSearch] = useState("");

  const loadRaces = async () => {
    const data = await getRaces();
    setRaces(data);
  };

  useEffect(() => {
    loadRaces();
  }, []);

  // Filter races based on search
  const filteredRaces = races.filter(
    (race) =>
      race.track.location.toLowerCase().includes(search.toLowerCase()) ||
      race.track.difficulty.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScrollView style={sharedStyles.container}>
      <View style={sharedStyles.header}>
        <Text style={sharedStyles.headerTitle}>Races</Text>
        <LogoutButton />
      </View>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search races..."
      />

      {filteredRaces.map((race, index) => (
        <Pressable
          key={index}
          onPress={() => router.push(`/races/${race.id}` as any)}
        >
          <View style={sharedStyles.card}>
            <View style={sharedStyles.cardHeader}>
              <Text style={sharedStyles.locationText}>
                {race.track.location}
              </Text>
              <View
                style={[
                  sharedStyles.statusBadge,
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
                <Text style={sharedStyles.statusText}>
                  {race.track.difficulty}
                </Text>
              </View>
            </View>

            <View style={sharedStyles.divider} />

            <View style={sharedStyles.infoRow}>
              <View style={sharedStyles.infoColumn}>
                <Text style={sharedStyles.label}>Duur</Text>
                <Text style={sharedStyles.value}>{race.durationInM} min</Text>
              </View>
              <View style={sharedStyles.infoColumn}>
                <Text style={sharedStyles.label}>Inschrijfgeld</Text>
                <Text style={sharedStyles.value}>€{race.entryFee}</Text>
              </View>
              <View style={sharedStyles.infoColumn}>
                <Text style={sharedStyles.label}>Bezetting</Text>
                <Text style={sharedStyles.value}>
                  {race.participants.length} / {race.spots}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      ))}
      <View>
        <Pressable style={sharedStyles.seedButton} onPress={seed}>
          <Text style={sharedStyles.seedButtonText}>Seed Database</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default App;
