import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import sharedStyles from "./styles";
import SearchBar from "./components/SearchBar";
import LogoutButton from "./components/LogoutButton";
import { Track } from "./types";
import { getTracks } from "./services/trackService";

export default function HomeScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState("");

  const loadTracks = async () => {
    try {
      const data = await getTracks();
      setTracks(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  // Filter tracks based on search
  const filteredTracks = tracks.filter(
    (track) =>
      track.location.toLowerCase().includes(search.toLowerCase()) ||
      track.difficulty.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScrollView style={sharedStyles.container}>
      <View style={sharedStyles.header}>
        <Text style={sharedStyles.headerTitle}>Circuits</Text>
        <LogoutButton />
      </View>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search circuits..."
      />

      {filteredTracks.map((track, index) => (
        <View key={index} style={sharedStyles.card}>
          <View style={sharedStyles.cardHeader}>
            <Text style={sharedStyles.locationText}>{track.location}</Text>

            <View
              style={[
                sharedStyles.statusBadge,
                { backgroundColor: track.available ? "#238636" : "#da3633" },
              ]}
            >
              <Text style={sharedStyles.statusText}>
                {track.available ? "Beschikbaar" : "Bezet"}
              </Text>
            </View>
          </View>

          <View style={sharedStyles.divider} />

          <View style={sharedStyles.infoRow}>
            <View style={sharedStyles.infoColumn}>
              <Text style={sharedStyles.label}>Lengte</Text>
              <Text style={sharedStyles.value}>{track.length}m</Text>
            </View>

            <View style={sharedStyles.infoColumn}>
              <Text style={sharedStyles.label}>Niveau</Text>
              <Text style={sharedStyles.value}>{track.difficulty}</Text>
            </View>

            <View style={sharedStyles.infoColumn}>
              <Text style={sharedStyles.label}>Capaciteit</Text>
              <Text style={sharedStyles.value}>{track.maxSpots} pers.</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
