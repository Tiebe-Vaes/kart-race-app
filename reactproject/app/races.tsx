import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ensureKartingSeedData,
  getRaceParticipants,
  getRaces,
  getTracks,
  initDatabase,
} from "./database";
import { Race, RaceParticipant, Track } from "./types";
import { Link, useRouter  } from "expo-router";

type RaceSortOption = "date-asc" | "price-asc" | "price-desc" | "spots-desc";

const RacesPage = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState<RaceSortOption>("date-asc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initDatabase();
    ensureKartingSeedData();

    setTracks(getTracks());
    setRaces(getRaces());
    setParticipants(getRaceParticipants());
  }, []);

  const trackNameById = (trackId: number) => {
    return (
      tracks.find((track) => track.id === trackId)?.name ?? "Unknown track"
    );
  };

  const participantCountByRaceId = (raceId: number) => {
    return participants.filter((participant) => participant.raceId === raceId)
      .length;
  };

  const processedRaces = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const filtered = races.filter((race) => {
      if (!query) {
        return true;
      }

      return (
        race.title.toLowerCase().includes(query) ||
        race.type.toLowerCase().includes(query) ||
        trackNameById(race.trackId).toLowerCase().includes(query)
      );
    });

    return filtered.sort((left, right) => {
      if (sortOption === "price-asc") {
        return left.entryFee - right.entryFee;
      }

      if (sortOption === "price-desc") {
        return right.entryFee - left.entryFee;
      }

      if (sortOption === "spots-desc") {
        const leftSpots =
          left.maxDrivers - participantCountByRaceId(left.id ?? 0);
        const rightSpots =
          right.maxDrivers - participantCountByRaceId(right.id ?? 0);
        return rightSpots - leftSpots;
      }

      return left.dateTime.localeCompare(right.dateTime);
    });
  }, [races, searchText, sortOption, tracks, participants]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Open Races</Text>
      <Text style={styles.subtitle}>Vind races en check vrije plaatsen.</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search races..."
          placeholderTextColor="#718096"
          value={searchText}
          onChangeText={setSearchText}
        />

        <Pressable
          style={styles.iconButton}
          onPress={() => setIsSortOpen((current) => !current)}
        >
          <Ionicons name="swap-vertical" size={18} color="#f7fafc" />
        </Pressable>
      </View>

      {isSortOpen && (
        <View style={styles.dropdownPanel}>
          <Text style={styles.dropdownTitle}>Sorteer op</Text>
          {[
            { key: "date-asc", label: "Datum" },
            { key: "price-asc", label: "Prijs ↑" },
            { key: "price-desc", label: "Prijs ↓" },
            { key: "spots-desc", label: "Vrije plaatsen" },
          ].map((item) => (
            <Pressable
              key={item.key}
              style={styles.dropdownItem}
              onPress={() => {
                setSortOption(item.key as RaceSortOption);
                setIsSortOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  sortOption === item.key && styles.dropdownItemTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {processedRaces.map((race) => {
        const participantCount = participantCountByRaceId(race.id ?? 0);
        const availableSpots = race.maxDrivers - participantCount;

        return (
          <Pressable
          key={race.id}
          style={styles.card}
          onPress={() => router.push(`/races/${race.id}`)}
        >
            <View style={styles.cardHeader}>
              <Text style={styles.raceTitle}>{race.title}</Text>
              <Text style={styles.dateTime}>{race.dateTime}</Text>
            </View>

            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {trackNameById(race.trackId)}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  level {race.skillMin}-{race.skillMax}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {participantCount}/{race.maxDrivers} drivers
                </Text>
              </View>
              <View style={[styles.badge, styles.priceBadge]}>
                <Text style={styles.badgeText}>€{race.entryFee}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {availableSpots} spots vrij
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  race.confirmed ? styles.badgeGreen : styles.badgeOrange,
                ]}
              >
                <Text style={styles.badgeText}>
                  {race.confirmed ? "confirmed" : "open"}
                </Text>
              </View>
            </View>
            </Pressable>
          
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f14",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f7fafc",
  },
  subtitle: {
    fontSize: 14,
    color: "#a0aec0",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2d3748",
    borderRadius: 10,
    backgroundColor: "#141a22",
    color: "#f7fafc",
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f6ad55",
    backgroundColor: "#141a22",
  },
  dropdownPanel: {
    backgroundColor: "#141a22",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2d3748",
    padding: 12,
    gap: 8,
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  dropdownItem: {
    paddingVertical: 6,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#cbd5e0",
  },
  dropdownItemTextActive: {
    color: "#f6ad55",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#141a22",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  raceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f7fafc",
  },
  dateTime: {
    fontSize: 13,
    color: "#a0aec0",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    backgroundColor: "#1f2937",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeGreen: {
    backgroundColor: "#22543d",
  },
  badgeOrange: {
    backgroundColor: "#9c4221",
  },
  priceBadge: {
    backgroundColor: "#744210",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e2e8f0",
  },
});

export default RacesPage;
