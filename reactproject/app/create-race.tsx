import { View, Text, StyleSheet } from "react-native";
import LogoutButton from "./components/LogoutButton";

export default function CreateRaceScreen() {
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 24,
          marginTop: 20,
        }}
      >
        <Text style={styles.text}>Race aanmaken</Text>
        <LogoutButton />
      </View>
      <Text style={styles.text}>
        Hier komt het formulier om een race aan te maken.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f14",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { color: "#fff", fontSize: 18 },
});
