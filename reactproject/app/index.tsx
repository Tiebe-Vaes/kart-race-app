import { FlatList, Text, View } from "react-native";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { initDatabase, addCompetition, getCompetitions } from "./database"
import { useEffect, useState } from "react";
import { Competition } from "./types";

interface CompetitionProps {
  competition: Competition

}
const CompetitionView = ({ competition }: CompetitionProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.clubName}>{competition.club}</Text>
        <Text style={styles.datum}>{competition.datum}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{competition.niveau}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{competition.range}</Text>
        </View>
        {competition.gemengd && (
          <View style={[styles.badge, styles.badgeGreen]}>
            <Text style={styles.badgeText}>gemengd</Text>
          </View>
        )}
        {competition.competitie && (
          <View style={[styles.badge, styles.badgeRed]}>
            <Text style={styles.badgeText}>competitie</Text>
          </View>
        )}
      </View>
    </View>

  )
}

const App = () => {


  const [competitions, setCompetitions] = useState<Competition[]>([])
  useEffect(() => {
    initDatabase();

    //import testdata
    importData();
    setCompetitions(getCompetitions());
  }, [])
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Competitions</Text>

      <FlatList
        data={competitions}
        renderItem={({ item }) => <CompetitionView competition={item} />}
        keyExtractor={(item) => item.id!.toString()}
      />
    </View>
  )



}
const importData = () => {
  const existingClubs = getCompetitions().map((c) => c.club);

  const testdata = [
    {
      range: 'lokaal',
      niveau: 'gevorderd',
      datum: '2026-03-15',
      club: 'TC Aalst',
      gemengd: true,
      competitie: false,
      spelers: [
        { handle: 'jan_smit', level: 4 },
        { handle: 'lisa_v', level: 3 }
      ]
    },
    {
      range: 'nationaal',
      niveau: 'gevorderd',
      datum: '2026-04-02',
      club: 'BC Gent',
      gemengd: false,
      competitie: true,
      spelers: [
        { handle: 'pieter_d', level: 5 },
        { handle: 'thomas_k', level: 4 },
        { handle: 'sander_m', level: 5 }
      ]
    },
    {
      range: 'provinciaal',
      niveau: 'gemiddeld',
      datum: '2026-04-18',
      club: 'Smash Antwerpen',
      gemengd: true,
      competitie: true,
      spelers: [
        { handle: 'emma_j', level: 3 },
        { handle: 'noah_b', level: 3 },
        { handle: 'olivia_r', level: 2 }
      ]
    },
    {
      range: 'internationaal',
      niveau: 'expert',
      datum: '2026-05-10',
      club: 'Elite Brugge',
      gemengd: false,
      competitie: true,
      spelers: [
        { handle: 'max_p', level: 7 },
        { handle: 'lucas_w', level: 6 },
        { handle: 'finn_h', level: 7 },
        { handle: 'liam_v', level: 8 }
      ]
    }
  ];

  testdata.forEach((competition) => {
    if (!existingClubs.includes(competition.club)) {
      addCompetition(competition);
    }
  });
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
   title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
  },
  datum: {
    fontSize: 13,
    color: '#718096',
  },
  cardBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeGreen: {
    backgroundColor: '#c6f6d5',
  },
  badgeRed: {
    backgroundColor: '#fed7d7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
  },
})
export default App;