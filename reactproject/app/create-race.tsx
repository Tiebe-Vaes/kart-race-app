import { View, Text, StyleSheet } from "react-native";
import { addRace } from "./services/raceService";
import { Pressable, ScrollView, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { Track } from "./types";
import { getTracks } from "./services/trackService";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function CreateRaceScreen() {
  const router = useRouter();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [track, setTrack] = useState<Track | null>(null);
  const [duration, setDuration] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [spots, setSpots] = useState("");

  const loadTracks = async () => {
    const data = await getTracks();
    setTracks(data);
  };

  const createRace = async () => {
    if (track == null) {
      Alert.alert("alle velden moeten ingevuld zijn");
      return;
    }

    try {
      await addRace({
        track: track!,
        durationInM: Number(duration),
        entryFee: Number(entryFee),
        spots: Number(spots),
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
    <ScrollView style={styles.container}>
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
          <Picker.Item label="Kies een circuit..." value={null} color="#555" />
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
        placeholder="bijv. 60"
        placeholderTextColor="#555"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

      {/* Inschrijfgeld */}
      <Text style={styles.label}>Inschrijfgeld (€)</Text>
      <TextInput
        style={styles.input}
        placeholder="bijv. 25"
        placeholderTextColor="#555"
        keyboardType="numeric"
        value={entryFee}
        onChangeText={setEntryFee}
      />

      {/* Aantal plaatsen */}
      <Text style={styles.label}>Aantal plaatsen</Text>
      <TextInput
        style={styles.input}
        placeholder="bijv. 10"
        placeholderTextColor="#555"
        keyboardType="numeric"
        value={spots}
        onChangeText={setSpots}
      />

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
    padding: 20,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 24,
    marginTop: 20,
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
});
