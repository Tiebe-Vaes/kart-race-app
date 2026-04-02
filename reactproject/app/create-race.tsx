import { View, Text, StyleSheet } from "react-native";
import { addRace } from "./services/raceService";
import { Pressable, ScrollView, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { Track } from "./types";
import { getTracks } from "./services/trackService";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "firebase/firestore";

export default function CreateRaceScreen() {
  const router = useRouter();

  const placeholderColor = "#8b949e";

  const [tracks, setTracks] = useState<Track[]>([]);
  const [track, setTrack] = useState<Track | null>(null);
  const [duration, setDuration] = useState("");
  const [startHour, setStartHour] = useState("19");
  const [entryFee, setEntryFee] = useState("");
  const [spots, setSpots] = useState("");
  const [minParticipants, setMinParticipants] = useState("");
  const [minSkill, setMinSkill] = useState("1.0");
  const [isCompetitive, setIsCompetitive] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const spotsNumber = Number(spots) || 4;
  const suggestedMinParticipants = Math.round(spotsNumber * 0.75);

  const loadTracks = async () => {
    const data = await getTracks();
    setTracks(data);
  };

  const createRace = async () => {
    if (track == null) {
      Alert.alert("alle velden moeten ingevuld zijn");
      return;
    }

    const requiredSpots = 4;
    const spotsNr = requiredSpots;
    const minNr = requiredSpots;
    const minSkillNr = Math.max(1, Math.min(10, Number(minSkill) || 1));

    const startDate = new Date(date);
    startDate.setHours(Number(startHour), 0, 0, 0);

    try {
      await addRace({
        track: track!,
        durationInM: Number(duration),
        startHour: `${String(Number(startHour)).padStart(2, "0")}:00`,
        entryFee: Number(entryFee),
        spots: spotsNr,
        minParticipants: minNr,
        minSkill: minSkillNr,
        isMixed: true,
        status: "scheduled",
        isCompetitive,
        date: Timestamp.fromDate(startDate),
        participants: [],
      });
      Alert.alert("Race aangemaakt!");
      router.replace("/");
    } catch (e: any) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Race aanmaken</Text>

      {/* Track selecteren */}
      <Text style={styles.label}>Selecteer een circuit</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={track?.id}
          onValueChange={(itemValue) => {
            const selected = tracks.find((t) => t.id === itemValue) || null;
            setTrack(selected);
          }}
          style={styles.picker}
          dropdownIconColor="#8b949e"
        >
          <Picker.Item label="bv. Kies een circuit" value={null} color={placeholderColor} />
          {tracks.map((t, index) => (
            <Picker.Item
              key={index}
              label={`${t.location} (${t.difficulty})`}
              value={t.id}
              color="#111"
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Planning</Text>
      <View style={styles.inlineRowCompact}>
        <View style={styles.flexItem}>
          <Text style={styles.smallLabel}>Datum</Text>
          <Pressable style={styles.inputCompact} onPress={() => setShowDatePicker(true)}>
            <Text style={{ color: "#fff", fontSize: 14 }}>{date.toLocaleDateString("nl-BE")}</Text>
          </Pressable>
        </View>

        <View style={styles.flexItem}>
          <Text style={styles.smallLabel}>Start</Text>
          <View style={styles.pickerContainerCompact}>
            <Picker
              selectedValue={startHour}
              onValueChange={(value) => setStartHour(String(value))}
              style={styles.pickerCompact}
              dropdownIconColor="#8b949e"
            >
              {Array.from({ length: 13 }, (_, i) => {
                const hour = String(i + 10);
                return <Picker.Item key={hour} label={`${hour.padStart(2, "0")}:00`} value={hour} color="#111" />;
              })}
            </Picker>
          </View>
        </View>

        <View style={styles.flexItem}>
          <Text style={styles.smallLabel}>Duur</Text>
          <TextInput
            style={styles.inputCompact}
            placeholder="60 min"
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
        </View>
      </View>

      {/* Inschrijfgeld */}
      <Text style={styles.label}>Inschrijfgeld (€)</Text>
      <TextInput
        style={styles.input}
        placeholder="bv. 25"
        placeholderTextColor={placeholderColor}
        keyboardType="numeric"
        value={entryFee}
        onChangeText={setEntryFee}
      />

      <View style={styles.inlineRow}>
        <View style={styles.flexItem}>
          <Text style={styles.label}>Aantal plaatsen</Text>
          <TextInput
            style={styles.input}
            placeholder="bv. 10"
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            value={spots}
            onChangeText={setSpots}
          />
        </View>

        <View style={styles.flexItem}>
          <Text style={styles.label}>Min. aantal deelnemers</Text>
          <TextInput
            style={styles.input}
            placeholder={`bv. ${suggestedMinParticipants}`}
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            value={minParticipants}
            onChangeText={setMinParticipants}
          />
        </View>
      </View>

      <Text style={styles.label}>Min. skill (1.0 - 10.0)</Text>
      <TextInput
        style={styles.input}
        placeholder="bv. 3.5"
        placeholderTextColor={placeholderColor}
        keyboardType="numeric"
        value={minSkill}
        onChangeText={setMinSkill}
      />

      <Text style={styles.label}>Wedstrijdtype</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleButton, isCompetitive && styles.toggleActive]}
          onPress={() => setIsCompetitive(true)}
        >
          <Text style={[styles.toggleText, isCompetitive && styles.toggleTextActive]}>Competitief</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, !isCompetitive && styles.toggleActive]}
          onPress={() => setIsCompetitive(false)}
        >
          <Text style={[styles.toggleText, !isCompetitive && styles.toggleTextActive]}>Casual</Text>
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, selected) => {
            setShowDatePicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      <Pressable style={styles.button} onPress={createRace}>
        <Text style={styles.buttonText}>Race aanmaken</Text>
      </Pressable>
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
  label: {
    color: "#8b949e",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  smallLabel: {
    color: "#8b949e",
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    padding: 14,
    color: "#fff",
    fontSize: 15,
  },
  inputCompact: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: "#fff",
    fontSize: 14,
  },

  pickerContainer: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    color: "#f0f6fc",
    backgroundColor: "#161b22",
  },
  pickerContainerCompact: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    overflow: "hidden",
    height: 44,
  },
  pickerCompact: {
    color: "#f0f6fc",
    backgroundColor: "#161b22",
    marginTop: -4,
  },
  button: {
    backgroundColor: "#1f6feb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363d",
    backgroundColor: "#161b22",
    alignItems: "center",
  },
  toggleActive: {
    borderColor: "#388bfd",
    backgroundColor: "#1f6feb22",
  },
  toggleText: {
    color: "#8b949e",
    fontSize: 14,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: "#f0f6fc",
  },
  inlineRow: {
    flexDirection: "row",
    gap: 12,
  },
  inlineRowCompact: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  flexItem: {
    flex: 1,
  },
});
