import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { User, Race } from "../types";

const COLLECTION = "races";

// Alle races ophalen
export const getRaces = async (): Promise<Race[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as unknown as Race,
  );
};

// Één race ophalen op ID
export const getRaceById = async (id: string): Promise<Race | null> => {
  const ref = doc(db, COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as unknown as Race;
};

// Race toevoegen
export const addRace = async (race: Omit<Race, "id">): Promise<void> => {
  await addDoc(collection(db, COLLECTION), race);
};

// Race updaten
export const updateRace = async (
  id: string,
  data: Partial<Race>,
): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data });
};

// Race verwijderen
export const deleteRace = async (id: string): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};

// Deelnemer toevoegen aan race
export const addParticipant = async (
  raceId: string,
  user: User,
): Promise<void> => {
  const race = await getRaceById(raceId);
  if (!race) throw new Error("Race niet gevonden");
  if (race.participants.length >= race.spots) throw new Error("Race is vol");

  const ref = doc(db, COLLECTION, raceId);
  await updateDoc(ref, {
    participants: [...race.participants, user],
  });
};

// Deelnemer verwijderen uit race
export const removeParticipant = async (
  raceId: string,
  userId: string,
): Promise<void> => {
  const race = await getRaceById(raceId);
  if (!race) throw new Error("Race niet gevonden");

  const ref = doc(db, COLLECTION, raceId);
  await updateDoc(ref, {
    participants: race.participants.filter((p) => p.id !== userId),
  });
};

// Races ophalen waarvan een gebruiker deelnemer is
export const getRacesByParticipant = async (
  userId: string,
): Promise<Race[]> => {
  const allRaces = await getRaces();
  return allRaces.filter((race) =>
    race.participants.some((participant) => participant.id === userId),
  );
};
