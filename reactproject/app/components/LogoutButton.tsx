import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "../firebaseConfig";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/pages/login");
  };

  return (
    <Pressable style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutButtonText}>Logout</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "#22272e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.8,
  },
});

export default LogoutButton;
