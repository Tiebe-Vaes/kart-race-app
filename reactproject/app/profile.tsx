import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, logout } from "./services/authUserService";
import { getRacesByParticipant } from "./services/raceService";
import { getReservationsByUser } from "./services/reservationService";
import { FirestoreUser, Race, Reservation } from "./types";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";

const Profile = () => {
  const [user, setUser] = useState<FirestoreUser | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const upcomingCount = useMemo(() => {
    const now = new Date();
    return races.filter((r) => {
      const d = r.date instanceof Timestamp ? r.date.toDate() : new Date(r.date);
      return d >= now;
    }).length;
  }, [races]);

  const upcomingReservations = useMemo(() => {
    const now = new Date();
    return reservations.filter((reservation) => {
      const d = reservation.date instanceof Timestamp
        ? reservation.date.toDate()
        : new Date(reservation.date);
      return d >= now;
    }).length;
  }, [reservations]);

  const raceStatusCounts = useMemo(() => {
    const now = new Date();
    return races.reduce(
      (acc, race) => {
        const raceDate = race.date instanceof Timestamp ? race.date.toDate() : new Date(race.date);
        if (race.status === "completed") {
          acc.completed += 1;
        } else if (race.status === "cancelled") {
          acc.cancelled += 1;
        } else if (raceDate < now) {
          acc.pastPending += 1;
        } else {
          acc.upcoming += 1;
        }
        return acc;
      },
      { upcoming: 0, completed: 0, cancelled: 0, pastPending: 0 },
    );
  }, [races]);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const [userRaces, userReservations] = await Promise.all([
            getRacesByParticipant(currentUser.id),
            getReservationsByUser(currentUser.id),
          ]);
          setRaces(userRaces);
          setReservations(userReservations);
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
        <ActivityIndicator size="large" color="#1f6feb" />
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

  const formatDate = (val: any) => {
    if (val instanceof Timestamp) return val.toDate().toLocaleDateString("nl-BE");
    if (val instanceof Date) return val.toLocaleDateString("nl-BE");
    return String(val);
  };

  const getRaceStatusMeta = (race: Race) => {
    const raceDate = race.date instanceof Timestamp ? race.date.toDate() : new Date(race.date);
    if (race.status === "completed") {
      return { label: "Scores ingegeven", style: styles.stateCompleted };
    }
    if (race.status === "cancelled") {
      return { label: "Geannuleerd", style: styles.stateCancelled };
    }
    if (raceDate < new Date()) {
      return { label: "Voorbij (geen scores)", style: styles.statePast };
    }
    return { label: "Komt nog", style: styles.stateUpcoming };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Mijn profiel</Text>
        <Text style={styles.subtitle}>Overzicht van je account, races en reservaties</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}{user.lastName.charAt(0)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user.name} {user.lastName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.skillBadge]}> 
              <Text style={styles.badgeText}>Skill {user.skill.toFixed(1)}</Text>
            </View>
            <View style={[styles.badge, styles.infoBadge]}>
              <Text style={styles.badgeText}>Races {races.length}</Text>
            </View>
            <View style={[styles.badge, styles.infoBadge]}>
              <Text style={styles.badgeText}>Reservaties {reservations.length}</Text>
            </View>
            <View style={[styles.badge, styles.infoBadge]}>
              <Text style={styles.badgeText}>Komend {upcomingCount}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mijn reservaties</Text>
          <Text style={styles.sectionMeta}> {upcomingReservations} komend</Text>
        </View>

        {reservations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Je hebt nog geen reservaties gemaakt.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/tracks")}> 
              <Text style={styles.primaryButtonText}>Bekijk circuits</Text>
            </Pressable>
          </View>
        ) : (
          reservations.map((reservation) => {
            const reservationDate = reservation.date instanceof Timestamp
              ? reservation.date.toDate()
              : new Date(reservation.date);
            const reservationDone = reservationDate < new Date();

            return (
              <Pressable
                key={reservation.id}
                onPress={() => router.push(`/pages/tracks/${reservation.track.id}`)}
              >
                <View style={styles.reservationCard}>
                  <View style={styles.raceHeader}>
                    <Text style={styles.raceLocation}>{reservation.track.location}</Text>
                    <View style={styles.pillsRow}>
                      {reservationDone && (
                        <View style={[styles.difficultyPill, styles.donePill]}>
                          <Text style={styles.difficultyText}>Afgerond</Text>
                        </View>
                      )}
                      <View style={[styles.difficultyPill, styles.reservationPill]}>
                        <Text style={styles.difficultyText}>{reservation.hour}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{formatDate(reservationDate)}</Text>
                    <Text style={styles.metaText}>{reservation.personCount} pers.</Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ingeschreven races</Text>
          <Text style={styles.sectionMeta}>
          {raceStatusCounts.upcoming} komend · {raceStatusCounts.completed} afgerond
          </Text>
        </View>

        {races.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Je bent nog niet ingeschreven voor races.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/")}>
              <Text style={styles.primaryButtonText}>Bekijk races</Text>
            </Pressable>
          </View>
        ) : (
          races.map((race, index) => {
            const raceDate = race.date instanceof Timestamp ? race.date.toDate() : new Date(race.date);
            const progress = Math.min(1, race.participants.length / Math.max(1, race.spots));
            const statusMeta = getRaceStatusMeta(race);
            const isCancelled = race.status === "cancelled";
            return (
              <Pressable
                key={index}
                onPress={() => router.push(`/races/${race.id}`)}
              >
                <View style={[styles.raceCard, isCancelled && styles.cancelledRaceCard]}>
                  {isCancelled && (
                    <View style={styles.cancelledBanner}>
                      <Text style={styles.cancelledBannerText}>AFGELAST</Text>
                    </View>
                  )}
                  <View style={styles.raceHeader}>
                    <Text style={styles.raceLocation}>{race.track.location}</Text>
                    <View style={styles.pillsRow}>
                      <View
                        style={[styles.difficultyPill, {
                          backgroundColor:
                            race.track.difficulty === "easy"
                              ? "#238636"
                              : race.track.difficulty === "medium"
                                ? "#9a6700"
                                : "#da3633",
                        }]}
                      >
                        <Text style={styles.difficultyText}>{race.track.difficulty}</Text>
                      </View>
                      {!isCancelled && (
                        <View style={[styles.difficultyPill, statusMeta.style]}>
                          <Text style={styles.difficultyText}>{statusMeta.label}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{formatDate(raceDate)}</Text>
                    <Text style={styles.metaText}>€{race.entryFee}</Text>
                  </View>

                  <View style={styles.occupancyHeader}>
                    <Text style={styles.label}>Bezetting</Text>
                    <Text style={styles.value}>{race.participants.length} / {race.spots}</Text>
                  </View>
                  <View style={styles.occupancyBar}>
                    <View style={[styles.occupancyFill, { width: `${Math.round(progress * 100)}%` }]} />
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </View>

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
    backgroundColor: "#0f1115",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 96,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f1115",
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: "#8b949e",
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1f6feb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  profileInfo: { flex: 1 },
  logoutButton: {
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
    fontWeight: "700",
    color: "#f0f6fc",
    marginBottom: 6,
  },
  userEmail: {
    color: "#8b949e",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363d",
    backgroundColor: "#0f1115",
  },
  badgeText: {
    color: "#f0f6fc",
    fontWeight: "700",
    fontSize: 12,
  },
  skillBadge: {
    backgroundColor: "#1f6feb22",
    borderColor: "#1f6feb",
  },
  infoBadge: {
    backgroundColor: "#161b22",
  },
  sectionCard: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f0f6fc",
  },
  sectionMeta: {
    color: "#8b949e",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#8b949e",
    marginBottom: 14,
    textAlign: "center",
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#1f6feb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#388bfd",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  raceCard: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cancelledRaceCard: {
    borderColor: "#f85149",
    backgroundColor: "#2a1215",
  },
  cancelledBanner: {
    alignSelf: "flex-start",
    backgroundColor: "#f85149",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  cancelledBannerText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  reservationCard: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  reservationPill: {
    backgroundColor: "#1f6feb22",
    borderWidth: 1,
    borderColor: "#388bfd",
  },
  donePill: {
    backgroundColor: "#0f766e",
  },
  raceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  raceLocation: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stateUpcoming: {
    backgroundColor: "#1f6feb",
  },
  stateCompleted: {
    backgroundColor: "#0f766e",
  },
  statePast: {
    backgroundColor: "#7c2d12",
  },
  stateCancelled: {
    backgroundColor: "#b91c1c",
  },
  difficultyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    color: "#c9d1d9",
    fontSize: 14,
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
    fontSize: 14,
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
  loginButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#1f6feb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#388bfd",
    marginTop: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "#da3633",
    fontSize: 16,
    marginBottom: 16,
  },
});

export default Profile;
