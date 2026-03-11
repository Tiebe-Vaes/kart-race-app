import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

const navItems = [
  { label: "🏁 Tracks", route: "/tracks" },
  { label: "🏎 Races", route: "/" },
  { label: "➕ Aanmaken", route: "/create-race" },
];
const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <Pressable
          key={item.route}
          style={[styles.navItem, pathname === item.route && styles.activeItem]}
          onPress={() => router.push(item.route as any)}
        >
          <Text style={[styles.navText, pathname === item.route && styles.activeText]}>
            {item.label}
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
    paddingVertical: 12,
    paddingBottom: 50,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeItem: {
    backgroundColor: "#1e2a3e",
  },
  navText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
  activeText: {
    color: "#1e90ff",
  },
});

export default BottomNav;