import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { View } from "react-native";
import BottomNav from "./components/BottomNav";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
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
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  // Verberg BottomNav op login en signup pagina's
  const hiddenRoutes = ["login", "signUp"];
  const currentSegment = segments[segments.length - 1];
  const showNav = !hiddenRoutes.includes(currentSegment);

  return (
    <View style={{ flex: 1, backgroundColor: "#0f1115" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: "#12151e" },
          headerTintColor: "#fff",
          contentStyle: { paddingBottom: showNav ? 80 : 0 },
        }}
      />
      {showNav && <BottomNav />}
    </View>
  );
}
