import { Link, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { login } from "../services/authUserService";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await login({ email, password });
      router.replace("/");
    } catch (e: any) {
      if (e.code === "auth/invalid-credential") {
        setError("Ongeldig e-mailadres of wachtwoord");
      } else if (e.code === "auth/invalid-email") {
        setError("Ongeldig e-mailadres");
      } else {
        setError("Er is iets misgegaan");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inloggen</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mailadres"
        placeholderTextColor="#555"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Wachtwoord"
        placeholderTextColor="#555"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Inloggen</Text>
      </Pressable>

      <Pressable style={styles.skipButton} onPress={() => router.replace("/")}>
        <Text style={styles.skipButtonText}>Skip Login</Text>
      </Pressable>

      <Link href={"/pages/signUp"} style={styles.link}>
        Nog geen account? <Text style={styles.linkBold}>Registreer hier</Text>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1115",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#f0f6fc",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  input: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    padding: 14,
    color: "#fff",
    fontSize: 15,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1f6feb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  error: {
    color: "#f44336",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  skipButton: {
    backgroundColor: "#22272e",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  skipButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    opacity: 0.7,
  },
  link: {
    color: "#8b949e",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  linkBold: {
    color: "#1f6feb",
    fontWeight: "700",
  },
});

export default Login;
