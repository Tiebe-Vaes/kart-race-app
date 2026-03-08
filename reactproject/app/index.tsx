
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { Link } from "expo-router";
import { seedTracks, seedUsers, seedRaces } from "./seedData";
import { addTrack } from "./services/trackService";
import { addUser } from "./services/userService";
import { addRace } from "./services/raceService";


const App = () => {
  const seed = async () => {
    try {
      for (const track of seedTracks) {
        await addTrack(track);
      }
      for (const user of seedUsers) {
        await addUser(user);
      }
      for (const race of seedRaces) {
        await addRace(race);
      }
    } catch (er) {
      console.error("seeding failed");
    }
  };


  return (
    <View>
      <Pressable onPress={seed}>
        <Text>seed database</Text>
      </Pressable>

    </View>

  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

});

export default App;

