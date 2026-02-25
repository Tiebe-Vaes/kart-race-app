import { FlatList, Text, View } from "react-native";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import {initDatabase, addWedstrijd, getWedstrijden} from "./database"
import { useEffect, useState } from "react";
import { Competition } from "./types";

const App = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  useEffect(() => {
    initDatabase();

    //testdata
    addWedstrijd({
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
    });

    setCompetitions(getWedstrijden());
  }, [])
  return (
    <View style={styles.container}>
      
      <FlatList 
        data={competitions}
        renderItem={({item}) => <Text>{item.club}</Text>}
        keyExtractor={(item) => item.id!.toString()}
      />
    </View>
  )
  
}
const styles = StyleSheet.create({
  container: {
    flex:1,


  }
})
export default App;