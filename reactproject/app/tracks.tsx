import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Track } from "./types";
import { getTracks } from "./services/trackService";

export default function TracksScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Circuits</Text>
      
      {tracks.map((track, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.locationText}>{track.location}</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: track.available ? "#238636" : "#da3633" }
            ]}>
              <Text style={styles.statusText}>
                {track.available ? "Beschikbaar" : "Bezet"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Lengte</Text>
              <Text style={styles.value}>{track.length}m</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Niveau</Text>
              <Text style={styles.value}>{track.difficulty}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Capaciteit</Text>
              <Text style={styles.value}>{track.maxSpots} pers.</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1115",
    padding: 20,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    marginTop: 20,
    letterSpacing: -0.5,
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
