import { AuthenticatedUser, FirestoreUser, Reservation, Track } from "@/app/types";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getTrackById } from "@/app/services/trackService";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createReservation } from "@/app/services/reservationService";
import { getCurrentUser } from "@/app/services/authUserService";




const ReserveTrack = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [date, setDate] = useState<Date | null>(null);
    const [startHour, setStartHour] = useState("0");
    const [timeInH, setTimeInH] = useState("1");
    const [personCount, setPersonCount] = useState(1);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setuser] = useState<  FirestoreUser | null>(null)


    const loadUser = async() => {
       const data = await getCurrentUser();
       setuser(data);
    }

    const reserve = async () => {

        const reservation: Reservation = { id: "0", track: currentTrack!, authUser: user!, date: date!, hour: timeInH, personCount: personCount }

        await createReservation(reservation)



    }

    useEffect(() => {
        const loadTrack = async () => {
            const track = await getTrackById(id);
            setCurrentTrack(track);
            setLoading(false);
        }
        loadTrack();
    }, [id]);

    if (!currentTrack && !loading) {
        return (
            <Text>track niet gevonden</Text>
        )
    }
    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

            {/* Header */}
            <View style={styles.header}>

                <Text style={styles.headerTitle}>{currentTrack?.location}</Text>
                <View style={styles.divider} />
            </View>

            {/* Datum */}
            <View style={styles.section}>
                <Text style={styles.label}>Datum</Text>
                <Pressable
                    style={({ pressed }) => [styles.inputCard, pressed && styles.inputCardPressed]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={date ? styles.inputText : styles.inputPlaceholder}>
                        {date ? date.toLocaleDateString("nl-BE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Kies een datum"}
                    </Text>
                    <Text style={styles.inputArrow}>›</Text>
                </Pressable>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={date ?? new Date()}
                    mode="date"
                    minimumDate={new Date()}
                    onChange={(event, selected) => {
                        setShowDatePicker(false);
                        if (selected) setDate(selected);
                    }}
                />
            )}

            {/* Startuur */}
            <View style={styles.section}>
                <Text style={styles.label}>Startuur</Text>
                <View style={styles.pickerCard}>
                    <Picker
                        selectedValue={startHour}
                        onValueChange={(value) => setStartHour(value)}
                        style={styles.picker}
                        dropdownIconColor="#1a7ae8"
                    >
                        {Array.from({ length: 24 }, (_, i) => (
                            <Picker.Item
                                key={i}
                                label={`${String(i).padStart(2, "0")}:00`}
                                value={String(i)}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Duur */}
            <View style={styles.section}>
                <Text style={styles.label}>Duur</Text>
                <View style={styles.pickerCard}>
                    <Picker
                        selectedValue={timeInH}
                        onValueChange={(value) => setTimeInH(value)}
                        style={styles.picker}
                        dropdownIconColor="#1a7ae8"
                    >
                        {[1, 2, 3, 4, 5, 6].map((h) => (
                            <Picker.Item
                                key={h}
                                label={`${h} ${h === 1 ? "uur" : "uur"}`}
                                value={String(h)}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Aantal personen */}
            <View style={styles.section}>
                <Text style={styles.label}>👥  Aantal personen</Text>
                <View style={styles.stepperRow}>
                    <Pressable
                        style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                        onPress={() => setPersonCount(Math.max(1, personCount - 1))}
                    >
                        <Text style={styles.stepperBtnText}>−</Text>
                    </Pressable>
                    <Text style={styles.stepperValue}>{personCount}</Text>
                    <Pressable
                        style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                        onPress={() => setPersonCount(personCount + 1)}
                    >
                        <Text style={styles.stepperBtnText}>+</Text>
                    </Pressable>
                </View>
            </View>

            {/* Samenvatting */}
            {date && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Overzicht</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryKey}>Datum</Text>
                        <Text style={styles.summaryVal}>{date.toLocaleDateString("nl-BE")}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryKey}>Van</Text>
                        <Text style={styles.summaryVal}>{String(parseInt(startHour)).padStart(2, "0")}:00</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryKey}>Tot</Text>
                        <Text style={styles.summaryVal}>{String(parseInt(startHour) + parseInt(timeInH)).padStart(2, "0")}:00</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryKey}>Personen</Text>
                        <Text style={styles.summaryVal}>{personCount}</Text>
                    </View>
                </View>
            )}

            {/* Bevestigen */}
            <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, !date && styles.buttonDisabled]}
                disabled={!date}
                onPress={reserve}
            >
                <Text style={styles.buttonText}>Bevestig reservering</Text>
            </Pressable>

        </ScrollView>
    );



}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: "#0f1115",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 120,
    },
    centered: {
        flex: 1,
        backgroundColor: "#0f1115",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#8b949e",
        fontSize: 15,
    },
    errorText: {
        color: "#fff",
        fontSize: 15,
    },
    header: {
        marginTop: 0,
        marginBottom: 16,
    },
    headerTitle: {
        color: "#ffffff",
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: -0.5,
        marginTop: 0,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: "#30363d",
        marginBottom: 8,
    },
    section: {
        marginBottom: 4,
    },
    label: {
        color: "#8b949e",
        fontSize: 11,
        textTransform: "uppercase",
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 16,
    },
    inputCard: {
        backgroundColor: "#161b22",
        borderWidth: 1,
        borderColor: "#30363d",
        borderRadius: 10,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    inputCardPressed: {
        borderColor: "#8b949e",
    },
    inputText: {
        color: "#fff",
        fontSize: 15,
        flex: 1,
    },
    inputPlaceholder: {
        color: "#555",
        fontSize: 15,
        flex: 1,
    },
    inputArrow: {
        color: "#8b949e",
        fontSize: 22,
        marginLeft: 8,
    },
    pickerCard: {
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
    stepperRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#161b22",
        borderWidth: 1,
        borderColor: "#30363d",
        borderRadius: 10,
        overflow: "hidden",
        alignSelf: "flex-start",
    },
    stepperBtn: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    stepperBtnPressed: {
        backgroundColor: "#1f6feb22",
    },
    stepperBtnText: {
        color: "#1f6feb",
        fontSize: 22,
        fontWeight: "300",
    },
    stepperValue: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        minWidth: 48,
        textAlign: "center",
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "#30363d",
        paddingVertical: 12,
    },
    summaryCard: {
        backgroundColor: "#161b22",
        borderWidth: 1,
        borderColor: "#30363d",
        borderRadius: 10,
        padding: 16,
        marginTop: 16,
        marginBottom: 4,
    },
    summaryTitle: {
        color: "#8b949e",
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#30363d",
    },
    summaryKey: {
        color: "#8b949e",
        fontSize: 13,
    },
    summaryVal: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    button: {
        backgroundColor: "#1f6feb",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 32,
        marginBottom: 40,
    },
    buttonPressed: {
        backgroundColor: "#1a5fd4",
    },
    buttonDisabled: {
        backgroundColor: "#161b22",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});


export default ReserveTrack;