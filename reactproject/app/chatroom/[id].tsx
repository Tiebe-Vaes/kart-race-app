import { View, Text, TextInput, Pressable, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig"; // pas aan naar jouw pad
import { getCurrentUser } from "../services/authUserService";
import { FirestoreUser } from "../types";

const Chatroom = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<FirestoreUser | null>(null);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  }

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Real-time listener op de berichten van deze race
    const q = query(
      collection(db, "chatrooms", id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe(); // cleanup bij unmount
  }, [id]);


  const sendMessage = async () => {
    if (!input.trim() || !currentUser) return;

    await addDoc(collection(db, "chatrooms", id, "messages"), {
      text: input.trim(),
      senderName: `${currentUser.name} ${currentUser.lastName}`,
      senderId: currentUser.id,
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === currentUser?.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
        {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Typ een bericht..."
          placeholderTextColor="#555"
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1115" },
  messageList: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 140, gap: 10 },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    backgroundColor: "#238636",
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    backgroundColor: "#161b22",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  senderName: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  messageText: { color: "#f0f6fc", fontSize: 15 },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#30363d",
    backgroundColor: "#161b22",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#0f1115",
    color: "#f0f6fc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  sendButton: {
    backgroundColor: "#238636",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontSize: 18 },
});


export default Chatroom;