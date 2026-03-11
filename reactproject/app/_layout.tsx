import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { View } from "react-native";
import BottomNav from "./components/BottomNav";

export default function Layout() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setTimeout(() => {
        if (user) {
          router.replace("/");
        } else {
          router.replace("/pages/login");
        }
      }, 100); // wacht tot navigator klaar is
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0f1115" }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#12151e" },
          headerTintColor: "#fff",
          contentStyle: { paddingBottom: 80 },
        }}
      />
      {loggedIn && <BottomNav />}
    </View>
  );
}