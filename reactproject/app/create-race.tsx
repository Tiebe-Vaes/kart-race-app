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
  const [entryFee, setEntryFee] = useState("");
  const [spots, setSpots] = useState("");
  const [minParticipants, setMinParticipants] = useState("");
  const [minSkill, setMinSkill] = useState("1");
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
    const minSkillNr = Math.max(0.5, Math.min(7, Number(minSkill) || 1));

    try {
      await addRace({
        track: track!,
        durationInM: Number(duration),
        entryFee: Number(entryFee),
        spots: spotsNr,
        minParticipants: minNr,
        minSkill: minSkillNr,
        status: "scheduled",
        isCompetitive,
         date: Timestamp.fromDate(date),
        participants: [],
      });
      Alert.alert("Race aangemaakt!");
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
              color="#f0f6fc"
            />
          ))}
        </Picker>
      </View>

      {/* Duur */}
      <Text style={styles.label}>Duur (minuten)</Text>
      <TextInput
        style={styles.input}
        placeholder="bv. 60"
        placeholderTextColor={placeholderColor}
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

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

      <Text style={styles.label}>Min. skill (0.5 - 7)</Text>
      <TextInput
        style={styles.input}
        placeholder="bv. 3"
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

      <Text style={styles.label}>Datum</Text>
      <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: "#fff", fontSize: 15 }}>
          {date.toLocaleDateString("nl-BE")}
        </Text>
      </Pressable>

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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 0,
    marginBottom: 20,
  },
  label: {
    color: "#8b949e",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
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
  button: {
    backgroundColor: "#1f6feb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 40,
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
  flexItem: {
    flex: 1,
  },
});
