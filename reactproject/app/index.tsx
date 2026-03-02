
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { Link } from "expo-router";
import {
  ensureKartingSeedData,
  getRaceParticipants,
  getRaces,
  getTracks,
  initDatabase,
} from "./database";
import { Race, RaceParticipant, Track } from "./types";

const HomeDashboard = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);

  useEffect(() => {
    initDatabase();
    ensureKartingSeedData();

    setTracks(getTracks());
    setRaces(getRaces());
    setParticipants(getRaceParticipants());
  }, []);

  const openRaces = useMemo(
    () => races.filter((race) => !race.confirmed),
    [races],
  );

  const cheapestTrackPrice = useMemo(() => {
    if (!tracks.length) {
      return 0;
    }

    return Math.min(...tracks.map((track) => track.pricePerSession));
  }, [tracks]);

  const participantCountByRaceId = (raceId: number) => {
    return participants.filter((participant) => participant.raceId === raceId)
      .length;
  };

  const getTrackName = (trackId: number) => {
    return (
      tracks.find((track) => track.id === trackId)?.name ?? "Unknown track"
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Karting Home</Text>
      <Text style={styles.subtitle}>
        Snel overzicht van tracks en open races.
      </Text>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{tracks.length}</Text>
          <Text style={styles.kpiLabel}>Tracks</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{races.length}</Text>
          <Text style={styles.kpiLabel}>Races</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{openRaces.length}</Text>
          <Text style={styles.kpiLabel}>Open</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>€{cheapestTrackPrice}</Text>
          <Text style={styles.kpiLabel}>Vanaf prijs</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <Link href="/tracks" asChild>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionTitle}>Bekijk tracks</Text>
            <Text style={styles.actionDesc}>Alle circuits en details</Text>
          </Pressable>
        </Link>

        <Link href="/races" asChild>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionTitle}>Bekijk races</Text>
            <Text style={styles.actionDesc}>Open races en slots</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.sectionTitle}>Volgende races</Text>
      {races.slice(0, 3).map((race) => (
        <View key={race.id} style={styles.card}>
          <Text style={styles.cardTitle}>{race.title}</Text>
          <Text style={styles.cardMeta}>{race.dateTime}</Text>
          <Text style={styles.cardMeta}>{getTrackName(race.trackId)}</Text>
          <Text style={styles.cardMeta}>Prijs: €{race.entryFee}</Text>
          <Text style={styles.badgeText}>
            {participantCountByRaceId(race.id ?? 0)}/{race.maxDrivers} drivers
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f14",
  },
  contentContainer: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#f7fafc",
  },
  subtitle: {
    fontSize: 14,
    color: "#a0aec0",
    marginBottom: 4,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#141a22",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fbd38d",
  },
  kpiLabel: {
    fontSize: 12,
    color: "#a0aec0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#edf2f7",
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#141a22",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f6ad55",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f7fafc",
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: "#a0aec0",
  },
  card: {
    backgroundColor: "#141a22",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f7fafc",
  },
  cardMeta: {
    marginTop: 2,
    fontSize: 13,
    color: "#a0aec0",
  },
  badgeText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#f6ad55",
  },
});

export default HomeDashboard;
>>>>>>> ec39e17d49fa5e2bc7b43e560a4dc4bdd65cc33b
