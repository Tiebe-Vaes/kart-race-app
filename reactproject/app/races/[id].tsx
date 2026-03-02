import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ensureKartingSeedData, getRaceParticipants, getRaces, getTracks, initDatabase } from "../database";
import { Race, RaceParticipant, Track } from "../types";

export default function RaceDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [race, setRace] = useState<Race | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);

  useEffect(() => {
    initDatabase();
    ensureKartingSeedData();

    const allRaces = getRaces();
    const found = allRaces.find((r) => r.id === Number(id));
    setRace(found ?? null);
    setTracks(getTracks());
    setParticipants(getRaceParticipants());
  }, [id]);

  if (!race) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.text}>Race niet gevonden</Text>
      </ScrollView>
    );
  }

  const trackName = tracks.find((t) => t.id === race.trackId)?.name ?? "Onbekend";
  const participantCount = participants.filter((p) => p.raceId === race.id).length;
  const availableSpots = race.maxDrivers - participantCount;

  return (
    <ScrollView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Terug</Text>
      </Pressable>

      <Text style={styles.title}>{race.title}</Text>
      <Text style={styles.subtitle}>{race.dateTime}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Track</Text>
          <Text style={styles.value}>{trackName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{race.type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Prijs</Text>
          <Text style={styles.value}>€{race.entryFee}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Skill niveau</Text>
          <Text style={styles.value}>{race.skillMin} - {race.skillMax}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Drivers</Text>
          <Text style={styles.value}>{participantCount}/{race.maxDrivers}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Vrije plaatsen</Text>
          <Text style={[styles.value, { color: availableSpots > 0 ? "#68d391" : "#fc8181" }]}>
            {availableSpots}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, { color: race.confirmed ? "#68d391" : "#f6ad55" }]}>
            {race.confirmed ? "Bevestigd" : "Open"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f14",
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: "#f6ad55",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#f7fafc",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#a0aec0",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#141a22",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2d3748",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#edf2f7",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#a0aec0",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f7fafc",
  },
  text: {
    color: "#f7fafc",
    fontSize: 24,
    fontWeight: "700",
  },
});