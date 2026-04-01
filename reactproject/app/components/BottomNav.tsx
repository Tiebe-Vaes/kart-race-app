import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";

const navItems = [
  { icon: "🏁", route: "/tracks", label: "Tracks" },
  { icon: "🏎", route: "/", label: "Races" },
  { icon: "➕", route: "/create-race", label: "Aanmaken" },
  { icon: "👤", route: "/profile", label: "Profiel" },
];
const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: 20 + insets.bottom }]}>
      {navItems.map((item) => (
        <Pressable
          key={item.route}
          style={[styles.navItem, pathname === item.route && styles.activeItem]}
          onPress={() => router.push(item.route as any)}
          accessibilityLabel={item.label}
        >
          <Text
            style={[
              styles.navText,
              pathname === item.route && styles.activeText,
            ]}
          >
            {item.icon}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#12151e",
    borderTopWidth: 1,
    borderTopColor: "#2a2f3e",
    paddingVertical: 16,
    paddingBottom: 26,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeItem: {
    backgroundColor: "#1e2a3e",
  },
  navText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "700",
  },
  activeText: {
    color: "#58a6ff",
  },
});

export default BottomNav;
