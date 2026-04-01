import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomNav from "./components/BottomNav";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const insets = useSafeAreaInsets();

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
  const showNav = loggedIn && !hiddenRoutes.includes(currentSegment);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0f1115" }} edges={["top", "left", "right"]}>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              headerStyle: { backgroundColor: "#12151e" },
              headerTintColor: "#fff",
              contentStyle: { paddingBottom: showNav ? 90 + insets.bottom : insets.bottom, backgroundColor: "#0f1115" },
            }}
          />
          {showNav && <BottomNav />}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}