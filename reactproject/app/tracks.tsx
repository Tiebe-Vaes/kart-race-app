import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, useWindowDimensions } from "react-native";
import { Track } from "./types";
import { getTracks } from "./services/trackService";
import { getRaces } from "./services/raceService";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TracksScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const sliderWidth = Math.max(width - 80, 220);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [priceByTrackLocation, setPriceByTrackLocation] = useState<Record<string, number>>({});
  const [raceDatesByTrackLocation, setRaceDatesByTrackLocation] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [groupSize, setGroupSize] = useState<number>(1);
  const [groupCeiling, setGroupCeiling] = useState<number>(20);
  const [minLength, setMinLength] = useState<number>(0);
  const [lenCeiling, setLenCeiling] = useState<number>(1000);
  const [lenMaxValue, setLenMaxValue] = useState<number>(1000);

  const loadTracks = async () => {
    try {
      const data = await getTracks();
      setTracks(data);

      const capMax = Math.max(...data.map((t) => t.maxSpots), 0);
      const lenMax = Math.max(...data.map((t) => t.length), 0);
      const capTop = capMax || 20;
      const lenTop = lenMax || 1000;
      setGroupCeiling(capTop);
      setLenCeiling(lenTop);
      setLenMaxValue(lenTop);

      const allRaces = await getRaces();
      const byLocation: Record<string, number> = {};
      const datesPerLocation: Record<string, Set<string>> = {};
      allRaces.forEach((race) => {
        if (!race.track?.location) return;
        const loc = race.track.location;
        if (byLocation[loc] == null || race.entryFee < byLocation[loc]) {
          byLocation[loc] = race.entryFee;
        }

        const anyDate = race.date as any;
        const jsDate = anyDate?.toDate ? anyDate.toDate() : new Date(anyDate);
        if (!Number.isNaN(jsDate.getTime())) {
          if (!datesPerLocation[loc]) datesPerLocation[loc] = new Set<string>();
          datesPerLocation[loc].add(jsDate.toDateString());
        }
      });

      const dateMap: Record<string, string[]> = {};
      Object.entries(datesPerLocation).forEach(([loc, dates]) => {
        dateMap[loc] = Array.from(dates);
      });

      setPriceByTrackLocation(byLocation);
      setRaceDatesByTrackLocation(dateMap);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const filteredTracks = tracks
    .filter(
      (track) =>
        track.location.toLowerCase().includes(search.toLowerCase()) ||
        track.difficulty.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((track) => difficulty === "all" || track.difficulty === difficulty)
    .filter((track) => (track.available ? track.maxSpots : 0) >= groupSize)
    .filter((track) => {
      if (!selectedDate) return true;
      const trackDates = raceDatesByTrackLocation[track.location] ?? [];
      return trackDates.includes(selectedDate.toDateString());
    })
    .filter((track) => track.length >= minLength)
    .filter((track) => track.length <= lenMaxValue);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Circuits</Text>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Zoek circuits..."
        placeholderTextColor="#8b949e"
      />

      <View style={styles.filterCard}>
        <Pressable style={styles.filterToggle} onPress={() => setFiltersExpanded((prev) => !prev)}>
          <Text style={styles.filterToggleTitle}>Filters</Text>
          <Text style={styles.filterToggleIcon}>{filtersExpanded ? "▲" : "▼"}</Text>
        </Pressable>

        {filtersExpanded && (
          <>
            <Text style={styles.filterLabel}>Met hoeveel personen ben je?</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderValue}>Personen</Text>
              <Text style={styles.sliderValueRight}>{groupSize}</Text>
            </View>
            <MultiSlider
              values={[groupSize]}
              onValuesChange={(vals) => setGroupSize(Math.max(1, vals[0]))}
              min={1}
              max={groupCeiling}
              step={1}
              sliderLength={sliderWidth}
              selectedStyle={styles.sliderSelected}
              unselectedStyle={styles.sliderUnselected}
              containerStyle={styles.sliderContainer}
              trackStyle={styles.sliderTrack}
              markerStyle={styles.sliderMarker}
              pressedMarkerStyle={styles.sliderMarkerActive}
            />

            <Text style={styles.filterLabel}>Datum</Text>
            <View style={styles.dateRow}>
              <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {selectedDate ? selectedDate.toLocaleDateString("nl-BE") : "Kies datum"}
                </Text>
              </Pressable>
              {selectedDate && (
                <Pressable style={styles.dateReset} onPress={() => setSelectedDate(null)}>
                  <Text style={styles.dateResetText}>Reset</Text>
                </Pressable>
              )}
            </View>

            <Text style={styles.filterLabel}>Moeilijkheidsgraad</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={difficulty}
                onValueChange={(val) => setDifficulty(val as typeof difficulty)}
                dropdownIconColor="#8b949e"
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Alle" value="all" color="#111" />
                <Picker.Item label="Easy" value="easy" color="#111" />
                <Picker.Item label="Medium" value="medium" color="#111" />
                <Picker.Item label="Hard" value="hard" color="#111" />
              </Picker>
            </View>

            <Text style={styles.filterLabel}>Lengte (min / max, m)</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderValue}>Min: {minLength}m</Text>
              <Text style={styles.sliderValueRight}>Max: {lenMaxValue}m</Text>
            </View>
            <MultiSlider
              values={[minLength, lenMaxValue]}
              onValuesChange={(vals) => {
                setMinLength(vals[0]);
                setLenMaxValue(vals[1]);
              }}
              min={0}
              max={lenCeiling}
              step={50}
              sliderLength={sliderWidth}
              selectedStyle={styles.sliderSelected}
              unselectedStyle={styles.sliderUnselected}
              containerStyle={styles.sliderContainer}
              trackStyle={styles.sliderTrack}
              markerStyle={styles.sliderMarker}
              pressedMarkerStyle={styles.sliderMarkerActive}
            />
          </>
        )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
      {filteredTracks.map((track, index) => (
        <Pressable key={index} style={styles.card} onPress={() => {router.push(`/pages/tracks/${track.id}` as any)}}>
          <View style={styles.cardHeader}>
            <Text style={styles.locationText}>{track.location}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {track.available ? 0 : track.maxSpots}/{track.maxSpots}
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
              <Text style={styles.label}>Prijs</Text>
              <Text style={styles.value}>{priceByTrackLocation[track.location] != null ? `Vanaf €${priceByTrackLocation[track.location]}` : "Zie races"}</Text>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 120,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 0,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#161b22",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#30363d",
    color: "#f0f6fc",
    fontSize: 14,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
    borderRadius: 8,
    backgroundColor: "#1f6feb22",
    borderWidth: 1,
    borderColor: "#388bfd",
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
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filterCard: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterToggleTitle: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  filterToggleIcon: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "800",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#161b22",
  },
  dateButtonText: {
    color: "#f0f6fc",
    fontSize: 14,
  },
  dateReset: {
    borderWidth: 1,
    borderColor: "#f85149",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#2d0f0f",
  },
  dateResetText: {
    color: "#f85149",
    fontWeight: "700",
    fontSize: 13,
  },
  filterLabel: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    color: "#f0f6fc",
    backgroundColor: "#161b22",
    height: 50,
    paddingVertical: 6,
    fontSize: 14,
  },
  pickerItem: {
    color: "#111",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sliderValue: {
    color: "#8b949e",
    fontSize: 13,
    width: 80,
    fontWeight: "600",
    marginRight: 8,
  },
  sliderValueRight: {
    color: "#8b949e",
    fontSize: 13,
    textAlign: "right",
    flex: 1,
    fontWeight: "600",
  },
  sliderContainer: {
    alignSelf: "stretch",
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  sliderTrack: {
    height: 6,
  },
  sliderSelected: {
    backgroundColor: "#1f6feb",
  },
  sliderUnselected: {
    backgroundColor: "#30363d",
  },
  sliderMarker: {
    height: 22,
    width: 22,
    borderRadius: 11,
    backgroundColor: "#f0f6fc",
    borderWidth: 2,
    borderColor: "#1f6feb",
  },
  sliderMarkerActive: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: "#1f6feb",
    borderWidth: 2,
    borderColor: "#f0f6fc",
  },
});
