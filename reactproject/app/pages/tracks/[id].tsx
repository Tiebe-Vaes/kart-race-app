import { getRaces } from "@/app/services/raceService";
import { getTrackById } from "@/app/services/trackService";
import { Race, Track } from "@/app/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

const TrackDetail = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter();
    const [track, setTrack] = useState<Track | null>(null);
    const [races, setRaces] = useState<Race[] | null>(null);

    const loadTrackDetails = async () => {
        const data = await getTrackById(id);
        setTrack(data);
        return data;
    }
    const loadRacesPerTrack = async (trackData: Track) => {
        const data = await getRaces();
        const filtered = data.filter(race => race.track != null && race.track.location === trackData.location);
        console.log("Gefilterde races:", filtered.length);
        setRaces(filtered);
    };

   useEffect(() => {
  const load = async () => {
    const trackData = await loadTrackDetails(); 
    if (trackData) {
      await loadRacesPerTrack(trackData); 
    }
  };
  load();
}, []);

    if (!track) {
        return (<View><Text>track not found</Text></View>)
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{track.location}</Text>

            <View style={styles.badgeRow}>
                <View style={[styles.badge, {
                    backgroundColor:
                        track.difficulty === "easy" ? "#238636" :
                            track.difficulty === "medium" ? "#9a6700" : "#da3633"
                }]}>
                    <Text style={styles.badgeText}>{track.difficulty}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: track.available ? "#1a3a2a" : "#3a1a1a" }]}>
                    <Text style={[styles.badgeText, { color: track.available ? "#4caf50" : "#f44336" }]}>
                        {track.available ? "Beschikbaar" : "Bezet"}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Circuit info</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Locatie</Text>
                    <Text style={styles.value}>{track.location}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Lengte</Text>
                    <Text style={styles.value}>{track.length} m</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Capaciteit</Text>
                    <Text style={styles.value}>{track.maxSpots} pers.</Text>
                </View>
            </View>

            {/* ← Aparte sectie voor races */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Races op dit circuit ({races?.length ?? 0})</Text>
                {races?.length === 0 ? (
                    <Text style={styles.empty}>Geen races gepland</Text>
                ) : (
                    races?.map((race, index) => (
                        <Pressable key={index} style={styles.raceRow} onPress={() => router.push(`/races/${race.id}` as any)}>
                            <View>
                                <Text style={styles.raceTitle}>Race #{index + 1}</Text>
                                <Text style={styles.raceSubtitle}>{race.durationInM} min · €{race.entryFee}</Text>
                            </View>
                            <Text style={styles.raceSpots}>{race.participants.length}/{race.spots} pers.</Text>
                        </Pressable>
                    ))
                )}
            </View>
        </ScrollView >
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f1115", padding: 20 },

    title: { color: "#f0f6fc", fontSize: 26, fontWeight: "800", marginBottom: 12, marginTop: 20 },
    badgeRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
    badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
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
    raceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#30363d",
    },
    raceTitle: { color: "#c9d1d9", fontSize: 14, fontWeight: "600" },
    raceSubtitle: { color: "#8b949e", fontSize: 12, marginTop: 2 },
    raceSpots: { color: "#8b949e", fontSize: 13 },
});

export default TrackDetail;