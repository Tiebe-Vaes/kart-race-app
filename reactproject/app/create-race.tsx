import { View, Text, StyleSheet } from "react-native";

export default function CreateRaceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Race aanmaken komt hier</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f14", justifyContent: "center", alignItems: "center" },
  text: { color: "#fff", fontSize: 18 },
});