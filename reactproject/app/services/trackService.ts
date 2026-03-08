import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Track } from '../types';

const COLLECTION = 'tracks';

// Alle tracks ophalen
export const getTracks = async (): Promise<Track[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Track));
};

// Één track ophalen op ID
export const getTrackById = async (id: string): Promise<Track | null> => {
  const ref = doc(db, COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as unknown as Track;
};

// Track toevoegen
export const addTrack = async (track: Omit<Track, 'id'>): Promise<void> => {
  await addDoc(collection(db, COLLECTION), track);
};

// Track updaten
export const updateTrack = async (id: string, data: Partial<Track>): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data });
};

// Track verwijderen
export const deleteTrack = async (id: string): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};