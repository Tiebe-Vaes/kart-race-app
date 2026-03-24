import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./services/authUserService";
import { getRacesByParticipant } from "./services/raceService";
import { FirestoreUser, Race } from "./types";
import { useRouter } from "expo-router";
import { logout } from "./services/authUserService"; 

const Profile = () => {
  const [user, setUser] = useState<FirestoreUser | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const userRaces = await getRacesByParticipant(currentUser.id);
          setRaces(userRaces);
        }
      } catch (error) {
        console.error("Fout bij laden profielgegevens:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Niet ingelogd. Log in alstublieft.</Text>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push("/pages/login")}
        >
          <Text style={styles.loginButtonText}>Ga naar inloggen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mijn Profiel</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userInfoCard}>
        <Text style={styles.userName}>
          {user.name} {user.lastName}
        </Text>
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Vaardigheidsniveau:</Text>
            <Text style={styles.skillValue}>{user.skill}/10</Text>
          </View>
        </View>
      </View>

      {/* Registered Races Section */}
      <View style={styles.racesSection}>
        <Text style={styles.sectionTitle}>
          Ingeschreven races ({races.length})
        </Text>

        {races.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Je bent nog niet ingeschreven voor races.
            </Text>
            <Pressable
              style={styles.browseButton}
              onPress={() => router.push("/")}
            >
              <Text style={styles.browseButtonText}>Browse races</Text>
            </Pressable>
          </View>
        ) : (
          races.map((race, index) => (
            <Pressable
              key={index}
              style={styles.raceCard}
              onPress={() => router.push(`/races/${race.id}`)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.raceLocation}>{race.track.location}</Text>
                <View style={styles.raceInfo}>
                  <Text style={styles.raceDetail}>
                    Duration: {race.durationInM} min
                  </Text>
                  <Text style={styles.raceDetail}>
                    Entry fee: €{race.entryFee}
                  </Text>
                </View>
                <View style={styles.participantsInfo}>
                  <Text style={styles.participantCount}>
                    Deelnemers: {race.participants.length}/{race.spots}
                  </Text>
                  <View
                    style={[
                      styles.difficultyBadge,
                      {
                        backgroundColor:
                          race.track.difficulty === "easy"
                            ? "#238636"
                            : race.track.difficulty === "medium"
                              ? "#9a6700"
                              : "#da3633",
                      },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {race.track.difficulty}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.spacer} />
      <Pressable
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
          router.replace("/pages/login");
        }}
      >
        <Text style={styles.logoutButtonText}>Uitloggen</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0e17",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfoCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#1e2a3e",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1e90ff",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: "#da3633",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f85149",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  userDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#999",
  },
  value: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  skillValue: {
    fontSize: 14,
    color: "#1e90ff",
    fontWeight: "600",
  },
  racesSection: {
    paddingHorizontal: 16,
    paddingBottom: 180,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 16,
    textAlign: "center",
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#1e90ff",
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  raceCard: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#1e2a3e",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1e90ff",
  },
  cardContent: {
    gap: 10,
  },
  raceLocation: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  raceInfo: {
    flexDirection: "row",
    gap: 16,
  },
  raceDetail: {
    fontSize: 13,
    color: "#999",
  },
  participantsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantCount: {
    fontSize: 13,
    color: "#999",
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#1e90ff",
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#da3633",
    fontSize: 16,
    marginBottom: 16,
  },
  spacer: {
    height: 20,
  },
});

export default Profile;
