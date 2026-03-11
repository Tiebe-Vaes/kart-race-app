import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getRaceById } from "../services/raceService";
import { Race } from "../types";
import { Button } from "@react-navigation/elements";

const RaceDetail = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [race, setRace] = useState<Race | null>(null);

    const loadRace = async () => {
            const data = await getRaceById(id);
            setRace(data);
        }

    useEffect(() => {
        loadRace();
    }, [id])
    if(!race) 
    {
        return (<Text>races niet gevonden</Text>);
    }

     return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{race.track.location}</Text>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, styles[race.track.difficulty]]}>
          <Text style={styles.badgeText}>{race.track.difficulty}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: race.track.available ? "#1a3a2a" : "#3a1a1a" }]}>
          <Text style={[styles.badgeText, { color: race.track.available ? "#4caf50" : "#f44336" }]}>
            {race.track.available ? "Beschikbaar" : "Niet beschikbaar"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Race info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Duur</Text>
          <Text style={styles.value}>{race.durationInM} min</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Inschrijfgeld</Text>
          <Text style={styles.value}>€{race.entryFee}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Plaatsen</Text>
          <Text style={styles.value}>{race.participants.length} / {race.spots}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Circuit info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Lengte</Text>
          <Text style={styles.value}>{race.track.length} m</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Max plaatsen</Text>
          <Text style={styles.value}>{race.track.maxSpots}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deelnemers ({race.participants.length})</Text>
        {race.participants.length === 0 ? (
          <Text style={styles.empty}>Nog geen deelnemers</Text>
        ) : (
          race.participants.map((user, index) => (
            <View key={index} style={styles.participantRow}>
              <Text style={styles.participantName}>{user.name} {user.lastName}</Text>
              <Text style={styles.participantSkill}>skill: {user.skill} ⭐</Text>
            </View>
          ))
        )}
      </View>
      <Pressable style={styles.signInButton}>
        <Text style={styles.signInText}>inschrijven</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1115", padding: 20 },
  loading: { color: "#fff", textAlign: "center", marginTop: 40 },
  title: { color: "#f0f6fc", fontSize: 26, fontWeight: "800", marginBottom: 12 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  easy: { backgroundColor: "#4caf50" },
  medium: { backgroundColor: "#ff9800" },
  hard: { backgroundColor: "#f44336" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  section: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  sectionTitle: { color: "#8b949e", fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginBottom: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#8b949e", fontSize: 14 },
  value: { color: "#c9d1d9", fontSize: 14, fontWeight: "600" },
  empty: { color: "#555", fontSize: 14, fontStyle: "italic" },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#30363d",
  },
  participantName: { color: "#c9d1d9", fontSize: 14 },
  participantSkill: { color: "#8b949e", fontSize: 14 },
  signInButton: {
  backgroundColor: "#238636",
  padding: 16,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 8,
  marginBottom: 40,
  borderWidth: 1,
  borderColor: "#2ea043",
},
signInText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "700",
},
});


export default RaceDetail;