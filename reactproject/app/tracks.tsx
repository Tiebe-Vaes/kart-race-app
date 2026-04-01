import { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, useWindowDimensions } from "react-native";
import { Track } from "./types";
import { getTracks } from "./services/trackService";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

export default function TracksScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const sliderWidth = Math.max(width - 80, 220);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [capCeiling, setCapCeiling] = useState<number>(20);
  const [capMaxValue, setCapMaxValue] = useState<number>(20);
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
      setCapCeiling(capTop);
      setCapMaxValue(capTop);
      setLenCeiling(lenTop);
      setLenMaxValue(lenTop);
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
    .filter((track) => (onlyAvailable ? track.available : true))
    .filter((track) => difficulty === "all" || track.difficulty === difficulty)
    .filter((track) => track.maxSpots >= minCapacity)
    .filter((track) => track.maxSpots <= capMaxValue)
    .filter((track) => track.length >= minLength)
    .filter((track) => track.length <= lenMaxValue);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Circuits</Text>
      <SearchBar value={search} onChange={setSearch} placeholder="Zoek circuits..." />

      <View style={styles.filterCard}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Beschikbaar</Text>
          <Switch
            value={onlyAvailable}
            onValueChange={setOnlyAvailable}
            thumbColor="#1f6feb"
            trackColor={{ true: "#388bfd", false: "#30363d" }}
          />
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

        <Text style={styles.filterLabel}>Capaciteit (min / max)</Text>
        <View style={styles.sliderRow}
        >
          <Text style={styles.sliderValue}>Min: {minCapacity}</Text>
          <Text style={styles.sliderValueRight}>Max: {capMaxValue}</Text>
        </View>
        <MultiSlider
          values={[minCapacity, capMaxValue]}
          onValuesChange={(vals) => {
            setMinCapacity(vals[0]);
            setCapMaxValue(vals[1]);
          }}
          min={0}
          max={capCeiling}
          step={1}
          sliderLength={sliderWidth}
          selectedStyle={styles.sliderSelected}
          unselectedStyle={styles.sliderUnselected}
          containerStyle={styles.sliderContainer}
          trackStyle={styles.sliderTrack}
          markerStyle={styles.sliderMarker}
          pressedMarkerStyle={styles.sliderMarkerActive}
        />

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
      </View>
      {filteredTracks.map((track, index) => (
        <Pressable key={index} style={styles.card} onPress={() => {router.push(`/pages/tracks/${track.id}` as any)}}>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 0,
    marginBottom: 20,
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
    padding: 12,
    marginBottom: 16,
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
