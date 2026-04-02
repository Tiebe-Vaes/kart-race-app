import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "expo-router";

import { seedRaces, seedTracks, seedUsers } from "./seedData";
import { getCurrentUser } from "./services/authUserService";
import { addRace, deleteRace, getRaces } from "./services/raceService";
import { addTrack, deleteTrack, getTracks } from "./services/trackService";
import { addUser, deleteUser, getUsers } from "./services/userService";
import { FirestoreUser, Race } from "./types";

const App = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const sliderLength = Math.max(width - 80, 220);

  const [races, setRaces] = useState<Race[]>([]);
  const [currentUser, setCurrentUser] = useState<FirestoreUser | null>(null);

  const [search, setSearch] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const [raceTypeFilter, setRaceTypeFilter] = useState<"all" | "competitive" | "casual">("all");
  const [showHigherSkills, setShowHigherSkills] = useState<boolean>(true);
  const [showCancelledRaces, setShowCancelledRaces] = useState<boolean>(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [priceCeiling, setPriceCeiling] = useState<number>(100);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterHour, setFilterHour] = useState<string>("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sortOption, setSortOption] = useState<"none" | "alpha" | "date" | "free">("none");

  const seed = async () => {
    try {
      const bestaandeRaces = await getRaces();
      await Promise.all(bestaandeRaces.map((race) => deleteRace(String(race.id))));

      const bestaandeTracks = await getTracks();
      await Promise.all(bestaandeTracks.map((track) => deleteTrack(String(track.id))));

      const bestaandeUsers = await getUsers();
      await Promise.all(bestaandeUsers.map((user) => deleteUser(String(user.id))));

      for (const track of seedTracks) await addTrack(track);
      for (const user of seedUsers) await addUser(user);
      for (const race of seedRaces) await addRace(race);
      await loadRaces();
      Alert.alert("Seed klaar", "Database opnieuw gevuld.");
    } catch (er: any) {
      console.error("Seeding failed", er?.message ?? er);
      Alert.alert("Seed mislukt", er?.message ?? "Onbekende fout");
    }
  };

  const loadRaces = async () => {
    const data = await getRaces();
    setRaces(data);

    const feeMax = Math.max(...data.map((r) => r.entryFee), 0);
    const feeTop = feeMax || 100;
    setPriceCeiling(feeTop);
    setPriceRange([0, feeTop]);
  };

  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    loadRaces();
    loadUser();
  }, []);

  const filteredRaces = races
    .filter((race) => race.track != null)
    .filter((race) => (showCancelledRaces ? true : race.status !== "cancelled"))
    .filter((race) => {
      if (raceTypeFilter === "all") return true;
      if (raceTypeFilter === "competitive") return race.isCompetitive;
      return !race.isCompetitive;
    })
    .filter((race) => {
      if (showHigherSkills) return true;
      if (!currentUser) return true;
      return currentUser.skill >= (race.minSkill ?? 0);
    })
    .filter((race) => filterHour === "all" || (race.startHour ?? "19:00") === filterHour)
    .filter((race) =>
      race.track.location.toLowerCase().includes(search.toLowerCase()) ||
      race.track.difficulty.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((race) => race.entryFee >= priceRange[0] && race.entryFee <= priceRange[1])
    .filter((race) => {
      if (!filterDate) return true;
      const raceDate = race.date instanceof Object ? race.date.toDate() : new Date(race.date);
      return raceDate.toDateString() === filterDate.toDateString();
    })
    .sort((a, b) => {
      if (sortOption === "alpha") return a.track.location.localeCompare(b.track.location);
      if (sortOption === "date") {
        const da = a.date instanceof Object ? a.date.toDate() : new Date(a.date);
        const db = b.date instanceof Object ? b.date.toDate() : new Date(b.date);
        return da.getTime() - db.getTime();
      }
      if (sortOption === "free") {
        const freeA = a.spots - a.participants.length;
        const freeB = b.spots - b.participants.length;
        return freeB - freeA;
      }
      return 0;
    });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Races</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Zoek races..."
        placeholderTextColor="#8b949e"
        style={styles.searchInput}
      />

      <View style={styles.compactCard}>
        <Pressable style={styles.filterToggle} onPress={() => setFiltersExpanded((prev) => !prev)}>
          <Text style={styles.filterToggleTitle}>Filters</Text>
          <Text style={styles.filterToggleIcon}>{filtersExpanded ? "▲" : "▼"}</Text>
        </Pressable>

        {filtersExpanded && (
          <>
            <View style={styles.rowBetween}>
              <Text style={styles.smallLabel}>Type</Text>
            </View>
            <View style={styles.segmentedRow}>
              <Pressable
                style={[styles.segmentButton, raceTypeFilter === "all" && styles.segmentButtonActive]}
                onPress={() => setRaceTypeFilter("all")}
              >
                <Text style={[styles.segmentText, raceTypeFilter === "all" && styles.segmentTextActive]}>Alles</Text>
              </Pressable>
              <Pressable
                style={[styles.segmentButton, raceTypeFilter === "competitive" && styles.segmentButtonActive]}
                onPress={() => setRaceTypeFilter("competitive")}
              >
                <Text style={[styles.segmentText, raceTypeFilter === "competitive" && styles.segmentTextActive]}>Competitief</Text>
              </Pressable>
              <Pressable
                style={[styles.segmentButton, raceTypeFilter === "casual" && styles.segmentButtonActive]}
                onPress={() => setRaceTypeFilter("casual")}
              >
                <Text style={[styles.segmentText, raceTypeFilter === "casual" && styles.segmentTextActive]}>Casual</Text>
              </Pressable>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.smallLabel}>Toon ook hogere skills</Text>
              <Switch
                value={showHigherSkills}
                onValueChange={setShowHigherSkills}
                thumbColor="#1f6feb"
                trackColor={{ true: "#388bfd", false: "#30363d" }}
              />
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.smallLabel}>Toon gecancelde races</Text>
              <Switch
                value={showCancelledRaces}
                onValueChange={setShowCancelledRaces}
                thumbColor="#1f6feb"
                trackColor={{ true: "#388bfd", false: "#30363d" }}
              />
            </View>

            <View style={styles.inlineFilterRow}>
              <View style={styles.inlineFilterItem}>
                <Text style={styles.smallLabel}>Datum</Text>
                <View style={styles.rowBetweenCompact}>
                  <Pressable onPress={() => setShowDatePicker(true)} style={styles.chipButtonCompact}>
                    <Text style={styles.chipText}>{filterDate ? filterDate.toLocaleDateString("nl-BE") : "Kies datum"}</Text>
                  </Pressable>
                  {filterDate && (
                    <Pressable onPress={() => setFilterDate(null)} style={styles.chipResetCompact}>
                      <Text style={styles.chipResetText}>Reset</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              <View style={styles.inlineFilterItem}>
                <Text style={styles.smallLabel}>Startuur</Text>
                <View style={styles.pickerDense}>
                  <Picker
                    selectedValue={filterHour}
                    onValueChange={(val) => setFilterHour(String(val))}
                    dropdownIconColor="#8b949e"
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Alle uren" value="all" color="#111" />
                    {Array.from({ length: 13 }, (_, i) => {
                      const hour = `${String(i + 10).padStart(2, "0")}:00`;
                      return <Picker.Item key={hour} label={hour} value={hour} color="#111" />;
                    })}
                  </Picker>
                </View>
              </View>
            </View>

            <Text style={styles.smallLabel}>Prijs (€) bereik</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderValue}>Min: €{priceRange[0]}</Text>
              <Text style={styles.sliderValueRight}>Max: €{priceRange[1]}</Text>
            </View>
            <MultiSlider
              values={priceRange}
              onValuesChange={(vals) => setPriceRange([Math.round(vals[0]), Math.round(vals[1])])}
              min={0}
              max={priceCeiling}
              step={1}
              sliderLength={sliderLength}
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
          value={filterDate || new Date()}
          mode="date"
          onChange={(event, selected) => {
            setShowDatePicker(false);
            if (selected) setFilterDate(selected);
          }}
        />
      )}

      <View style={styles.compactCard}>
        <Text style={styles.filterLabel}>Sorteren</Text>
        <View style={styles.pickerDense}>
          <Picker
            selectedValue={sortOption}
            onValueChange={(val) => setSortOption(val as typeof sortOption)}
            dropdownIconColor="#8b949e"
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Geen" value="none" color="#111" />
            <Picker.Item label="Alfabetisch" value="alpha" color="#111" />
            <Picker.Item label="Datum" value="date" color="#111" />
            <Picker.Item label="Vrije plaatsen" value="free" color="#111" />
          </Picker>
        </View>
      </View>

      {filteredRaces.map((race, index) => {
        const isCancelled = race.status === "cancelled";
        const lowSkill = race.status !== "cancelled" && currentUser ? currentUser.skill < (race.minSkill ?? 0) : false;
        return (
          <Pressable
            key={index}
            onPress={() => router.push(`/races/${race.id}` as any)}
          >
            <View
              style={[
                styles.card,
                isCancelled && styles.cardCancelled,
                lowSkill && styles.cardSkillBlocked,
              ]}
            >
            {isCancelled && (
              <View style={styles.cancelledBanner}>
                <Text style={styles.cancelledBannerText}>AFGELAST</Text>
              </View>
            )}
            <View style={styles.cardHeader}>
              <Text style={styles.locationText}>{race.track.location}</Text>
              <View
                style={[styles.statusBadge, {
                  backgroundColor:
                    race.track.difficulty === "easy"
                      ? "#238636"
                      : race.track.difficulty === "medium"
                        ? "#9a6700"
                        : "#da3633",
                }]}
              >
                <Text style={styles.statusText}>{race.track.difficulty}</Text>
              </View>
              <View style={[styles.statusBadge, race.isCompetitive ? styles.compBadge : styles.casualBadge]}>
                <Text style={styles.statusText}>{race.isCompetitive ? "Comp" : "Casual"}</Text>
              </View>
              {lowSkill && (
                <View style={[styles.statusBadge, styles.skillBadge]}>
                  <Text style={[styles.statusText, styles.skillText]}>Skill &lt; {race.minSkill?.toFixed(1) ?? "?"}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {race.date instanceof Object
                  ? race.date.toDate().toLocaleDateString("nl-BE")
                  : race.date}
              </Text>
              <Text style={styles.metaText}>{race.startHour ?? "19:00"}</Text>
              <Text style={styles.metaText}>€{race.entryFee}</Text>
            </View>

            <View style={styles.occupancyHeader}>
              <Text style={styles.label}>Bezetting</Text>
              <Text style={styles.value}>{race.participants.length} / {race.spots}</Text>
            </View>
            <View style={styles.occupancyBar}>
              <View
                style={[
                  styles.occupancyFill,
                  isCancelled && styles.occupancyFillCancelled,
                  { width: `${Math.min(100, (race.participants.length / Math.max(1, race.spots)) * 100)}%` },
                ]}
              />
            </View>
          </View>
          </Pressable>
        );
      })}

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
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 96,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 0,
    marginBottom: 14,
  },
  filterLabel: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  smallLabel: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  compactCard: {
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
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  segmentButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#161b22",
  },
  segmentButtonActive: {
    backgroundColor: "#1f6feb22",
    borderColor: "#388bfd",
  },
  segmentText: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#f0f6fc",
  },
  rowBetweenCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  inlineFilterRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 2,
  },
  inlineFilterItem: {
    flex: 1,
  },
  pickerDense: {
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
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
  inputCompact: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    color: "#f0f6fc",
    fontSize: 14,
    marginBottom: 10,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sliderValue: {
    color: "#8b949e",
    fontSize: 13,
    width: 100,
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
    marginBottom: 12,
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
  cardWarning: {
    color: "#f85149",
    marginTop: 8,
    fontWeight: "700",
  },
  chipButton: {
    backgroundColor: "#161b22",
    borderColor: "#30363d",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipButtonCompact: {
    flex: 1,
    backgroundColor: "#161b22",
    borderColor: "#30363d",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipText: { color: "#f0f6fc" },
  chipReset: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f85149",
    backgroundColor: "#2d0f0f",
  },
  chipResetCompact: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f85149",
    backgroundColor: "#2d0f0f",
  },
  chipResetText: { color: "#f85149", fontWeight: "700" },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#30363d",
    backgroundColor: "#161b22",
  },
  badge_all: {
    backgroundColor: "#238636",
    borderColor: "#2ea043",
  },
  badge_easy: {
    backgroundColor: "#238636",
    borderColor: "#2ea043",
  },
  badge_medium: {
    backgroundColor: "#9a6700",
    borderColor: "#d29922",
  },
  badge_hard: {
    backgroundColor: "#da3633",
    borderColor: "#f85149",
  },
  badge_available: {
    backgroundColor: "#1f6feb",
    borderColor: "#388bfd",
  },
  badge_reset: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#da3633",
    backgroundColor: "#161b22",
  },
  badge_resetText: {
    color: "#f85149",
    fontSize: 13,
    fontWeight: "600",
  },
  badgeText: {
    color: "#8b949e",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  badgeTextActive: {
    color: "#fff",
  },
  feeInput: {
    flex: 1,
    backgroundColor: "#161b22",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#30363d",
    color: "#f0f6fc",
    fontSize: 13,
  },
  skillBox: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skillLabel: { color: "#8b949e", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  skillValue: { color: "#c9d1d9", fontSize: 16, fontWeight: "700" },
  skillRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rangeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1f6feb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#388bfd",
  },
  rangeButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  rangeValue: { color: "#c9d1d9", fontSize: 16, fontWeight: "700" },
  skillHint: { color: "#8b949e", fontSize: 12 },
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
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  cardCancelled: {
    opacity: 1,
    borderColor: "#f85149",
    backgroundColor: "#2a1215",
  },
  cancelledBanner: {
    alignSelf: "flex-start",
    backgroundColor: "#f85149",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  cancelledBannerText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  cardSkillBlocked: {
    borderColor: "#f85149",
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
    marginLeft: 6,
  },
  compBadge: { backgroundColor: "#1f6feb" },
  casualBadge: { backgroundColor: "#475569" },
  cancelledBadge: {
    backgroundColor: "#4b1118",
    borderWidth: 1,
    borderColor: "#f85149",
  },
  skillBadge: {
    backgroundColor: "#2d0f0f",
    borderWidth: 1,
    borderColor: "#f85149",
  },
  statusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  skillText: {
    color: "#fef2f2",
  },
  cancelledText: {
    color: "#fecaca",
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
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  metaText: {
    color: "#c9d1d9",
    fontSize: 15,
    fontWeight: "600",
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
  occupancyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  occupancyBar: {
    height: 8,
    backgroundColor: "#30363d",
    borderRadius: 6,
    overflow: "hidden",
  },
  occupancyFill: {
    height: "100%",
    backgroundColor: "#1f6feb",
  },
  occupancyFillCancelled: {
    backgroundColor: "#ef4444",
  },
});

export default App;
