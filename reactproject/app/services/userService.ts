import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User } from '../types';

const COLLECTION = 'users';

// Alle gebruikers ophalen
export const getUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as User));
};

// Één gebruiker ophalen op ID
export const getUserById = async (id: string): Promise<User | null> => {
  const ref = doc(db, COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as unknown as User;
};

// Gebruiker toevoegen
export const addUser = async (user: Omit<User, 'id'>): Promise<void> => {
  await addDoc(collection(db, COLLECTION), user);
};

// Gebruiker updaten
export const updateUser = async (id: string, data: Partial<User>): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data });
};

// Gebruiker verwijderen
export const deleteUser = async (id: string): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};