import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ensureKartingSeedData, getTracks, initDatabase } from "./database";
import { Track } from "./types";

type SortOption =
  | "name-asc"
  | "price-asc"
  | "price-desc"
  | "length-asc"
  | "length-desc";
type LabelCategory = "all" | "base" | "feature";

const getLengthInMeters = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized.endsWith("km")) {
    const kmValue = parseFloat(normalized.replace("km", ""));
    return Number.isNaN(kmValue) ? 0 : kmValue * 1000;
  }

  const meterValue = parseFloat(normalized.replace("m", ""));
  return Number.isNaN(meterValue) ? 0 : meterValue;
};

const sortLabels: Record<SortOption, string> = {
  "name-asc": "Naam",
  "price-asc": "Prijs ↑",
  "price-desc": "Prijs ↓",
  "length-asc": "Lengte ↑",
  "length-desc": "Lengte ↓",
};

const TracksPage = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [labelCategory, setLabelCategory] = useState<LabelCategory>("all");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [maxLength, setMaxLength] = useState(1500);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    initDatabase();
    ensureKartingSeedData();
    setTracks(getTracks());
  }, []);

  const maxTrackLength = useMemo(() => {
    if (!tracks.length) {
      return 1500;
    }

    return Math.max(...tracks.map((track) => getLengthInMeters(track.length)));
  }, [tracks]);

  const categoryLabels = useMemo(() => {
    const baseLabels = ["all", "indoor", "outdoor", "rental"];
    const featureLabels = Array.from(
      new Set(
        tracks.flatMap((track) =>
          track.features.map((feature) => feature.toLowerCase()),
        ),
      ),
    );

    if (labelCategory === "base") {
      return baseLabels;
    }

    if (labelCategory === "feature") {
      return ["all", ...featureLabels];
    }

    return [...baseLabels, ...featureLabels];
  }, [tracks, labelCategory]);

  const processedTracks = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const filtered = tracks.filter((track) => {
      const matchesName = !query || track.name.toLowerCase().includes(query);
      const matchesLabel =
        selectedLabel === "all" ||
        (selectedLabel === "indoor" && track.indoor) ||
        (selectedLabel === "outdoor" && !track.indoor) ||
        (selectedLabel === "rental" && track.rentalKarts) ||
        track.features.some(
          (feature) => feature.toLowerCase() === selectedLabel,
        );

      const lengthMeters = getLengthInMeters(track.length);
      const matchesLength = lengthMeters <= maxLength;

      return matchesName && matchesLabel && matchesLength;
    });

    return filtered.sort((left, right) => {
      if (sortOption === "name-asc") {
        return left.name.localeCompare(right.name);
      }

      if (sortOption === "price-asc") {
        return left.pricePerSession - right.pricePerSession;
      }

      if (sortOption === "price-desc") {
        return right.pricePerSession - left.pricePerSession;
      }

      if (sortOption === "length-asc") {
        return getLengthInMeters(left.length) - getLengthInMeters(right.length);
      }

      return getLengthInMeters(right.length) - getLengthInMeters(left.length);
    });
  }, [tracks, searchText, selectedLabel, maxLength, sortOption]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tracks</Text>
      <Text style={styles.subtitle}>
        Zoek tracks, filter labels en sorteer resultaten.
      </Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Zoek op tracknaam..."
          placeholderTextColor="#718096"
          value={searchText}
          onChangeText={setSearchText}
        />

        <Pressable
          style={styles.iconButton}
          onPress={() => {
            setIsSortOpen((current) => !current);
            setIsFilterOpen(false);
          }}
        >
          <Ionicons name="swap-vertical" size={18} color="#f7fafc" />
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={() => {
            setIsFilterOpen((current) => !current);
            setIsSortOpen(false);
          }}
        >
          <Ionicons name="options" size={18} color="#f7fafc" />
        </Pressable>
      </View>

      {isSortOpen && (
        <View style={styles.dropdownPanel}>
          <Text style={styles.dropdownTitle}>Sorteer op</Text>
          {Object.entries(sortLabels).map(([value, label]) => (
            <Pressable
              key={value}
              style={styles.dropdownItem}
              onPress={() => {
                setSortOption(value as SortOption);
                setIsSortOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  sortOption === value && styles.dropdownItemTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {isFilterOpen && (
        <View style={styles.dropdownPanel}>
          <Text style={styles.dropdownTitle}>Label categorie</Text>
          <View style={styles.chipRow}>
            {[
              { value: "all", label: "Alles" },
              { value: "base", label: "Basis" },
              { value: "feature", label: "Features" },
            ].map((item) => (
              <Pressable
                key={item.value}
                style={[
                  styles.chip,
                  labelCategory === item.value && styles.chipActive,
                ]}
                onPress={() => {
                  setLabelCategory(item.value as LabelCategory);
                  setSelectedLabel("all");
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    labelCategory === item.value && styles.chipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.dropdownTitle}>Label</Text>
          <View style={styles.chipRow}>
            {categoryLabels.map((label) => (
              <Pressable
                key={label}
                style={[
                  styles.chip,
                  selectedLabel === label && styles.chipActive,
                ]}
                onPress={() => setSelectedLabel(label)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedLabel === label && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.dropdownTitle}>
            Max lengte: {Math.round(maxLength)}m
          </Text>
          <Slider
            minimumValue={400}
            maximumValue={Math.max(1500, maxTrackLength)}
            step={50}
            value={maxLength}
            minimumTrackTintColor="#f6ad55"
            maximumTrackTintColor="#4a5568"
            thumbTintColor="#f6ad55"
            onValueChange={setMaxLength}
          />
        </View>
      )}

      {processedTracks.map((track) => (
        <View key={track.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.trackName}>{track.name}</Text>
            <Text style={styles.location}>{track.location}</Text>
          </View>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{track.length}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{track.surface}</Text>
            </View>
            {track.indoor && (
              <View style={[styles.badge, styles.badgeGreen]}>
                <Text style={styles.badgeText}>indoor</Text>
              </View>
            )}
            {track.rentalKarts && (
              <View style={[styles.badge, styles.badgeBlue]}>
                <Text style={styles.badgeText}>rental</Text>
              </View>
            )}
            {track.features.map((feature) => (
              <View key={feature} style={styles.badge}>
                <Text style={styles.badgeText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              €{track.pricePerSession} / {track.priceUnit}
            </Text>
          </View>
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
    gap: 10,
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: "#dd6b20",
    borderColor: "#dd6b20",
  },
  chipText: {
    color: "#cbd5e0",
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#f7fafc",
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
  trackName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f7fafc",
  },
  location: {
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
  badgeBlue: {
    backgroundColor: "#2c5282",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  priceRow: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  priceText: {
    color: "#f6ad55",
    fontWeight: "700",
    fontSize: 13,
  },
});

export default TracksPage;
