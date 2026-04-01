import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { register } from "../services/authUserService";
import { addUser } from "../services/userService";

const SignUp = () => {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [skill, setSkill] = useState("");
    const [error, setError] = useState("");



    const createAccount = async () => {
        setError(""); // reset vorige fout
        try {
            await register({ email, password }, { name, lastName, skill: Number(skill) });
            await addUser({ name, lastName, skill: Number(skill) });
        } catch (e: any) {
            switch (e.code) {
                case "auth/email-already-in-use":
                    setError("Dit e-mailadres is al in gebruik.");
                    break;
                case "auth/invalid-email":
                    setError("Ongeldig e-mailadres.");
                    break;
                case "auth/weak-password":
                    setError("Wachtwoord moet minstens 6 tekens bevatten.");
                    break;
                default:
                    setError("Er ging iets mis. Probeer opnieuw.");
            }
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registreren</Text>

            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Voornaam"
                    placeholderTextColor="#555"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Achternaam"
                    placeholderTextColor="#555"
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>

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
            <TextInput
                style={styles.input}
                placeholder="Skill (1 - 10)"
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={skill}
                onChangeText={(val) => {
                    const num = Number(val);
                    if (val === "" || (num >= 1 && num <= 10)) setSkill(val);
                }}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable style={styles.button} onPress={createAccount}>
                <Text style={styles.buttonText}>Account aanmaken</Text>
            </Pressable>


            <Link href={"/pages/login"} style={styles.link}>
                Al een account? <Text style={styles.linkBold}>Log hier in</Text>
            </Link>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f1115",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        color: "#f0f6fc",
        fontSize: 28,
        fontWeight: "800",
        marginTop: 0,
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    row: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 0,
    },
    errorText: {
        color: "#f85149",
        fontSize: 14,
        marginBottom: 8,
        textAlign: "center",
    },
    halfInput: {
        flex: 1,
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

export default SignUp;