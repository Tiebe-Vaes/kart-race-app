import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore"; 
import { db } from "../firebaseConfig";
import { User, UserCredentials } from "../types";
import { AuthenticatedUser, FirestoreUser } from "../types";
import { getAuth } from "firebase/auth";

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

export const getCurrentUser = async (): Promise<FirestoreUser | null> => {
  const firebaseUser = getAuth().currentUser;
  

  if (!firebaseUser) return null;

  const q = query(
    collection(db, "authUsers"),
    where("uid", "==", firebaseUser.uid)
  );

  const snapshot = await getDocs(q);
 

  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data();
  return {
    id: snapshot.docs[0].id,
    uid: data.uid,
    email: data.email,
    name: data.name,
    lastName: data.lastName,
    skill: data.skill,
  } as FirestoreUser;
};

