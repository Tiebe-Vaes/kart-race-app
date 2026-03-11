import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { User, UserCredentials } from "../types";

const COLLECTION = "authUsers";

// Registreren + opslaan in Firestore
export const register = async (credentials: UserCredentials, user: Omit<User, "id">): Promise<void> => {
  const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
  
  // Sla gebruikersdata op in Firestore (GEEN wachtwoord!)
  await addDoc(collection(db, COLLECTION), {
    uid: userCredential.user.uid,  // Firebase Auth ID
    name: user.name,
    lastName: user.lastName,
    skill: user.skill,
    email: credentials.email,
  });
};

// Inloggen
export const login = async (credentials: UserCredentials) => {
  const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
  return userCredential.user;
};

// Uitloggen
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// Alle gebruikers ophalen uit Firestore
export const getAuthUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as User));
};

