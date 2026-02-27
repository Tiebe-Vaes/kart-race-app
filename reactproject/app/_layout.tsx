import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0b0f14" },
        headerTintColor: "#f7fafc",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#0b0f14" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="tracks" options={{ title: "Tracks" }} />
      <Stack.Screen name="races" options={{ title: "Open Races" }} />
      <Stack.Screen name="home" options={{ title: "Home" }} />
    </Stack>
  );
};

export default RootLayout;
