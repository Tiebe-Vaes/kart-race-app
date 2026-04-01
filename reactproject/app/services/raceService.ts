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
import { Timestamp } from "firebase/firestore";

const COLLECTION = "races";

const toJsDate = (value: Timestamp | Date | string): Date => {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
};

const ensureRaceStatus = async (race: Race): Promise<Race> => {
  const normalizedRace: Race = {
    ...race,
    participants: race.participants ?? [],
    startHour: race.startHour ?? "19:00",
    status: race.status ?? "scheduled",
    minParticipants: Math.max(1, race.minParticipants || 4),
    minSkill: Math.max(1, race.minSkill || 1),
    isMixed: race.isMixed ?? true,
    isCompetitive: race.isCompetitive ?? true,
  };

  if (normalizedRace.status === "cancelled" || normalizedRace.status === "completed") return normalizedRace;

  const raceDate = toJsDate(normalizedRace.date);
  const required = normalizedRace.minParticipants || 4;
  const shouldCancel =
    normalizedRace.participants.length < required &&
    raceDate <= new Date();

  if (shouldCancel) {
    try {
      await updateRace(normalizedRace.id, { status: "cancelled" });
    } catch (err) {
      console.warn("Kon race status niet bijwerken", err);
    }
    return { ...normalizedRace, status: "cancelled" };
  }

  return normalizedRace;
};

// Alle races ophalen
export const getRaces = async (): Promise<Race[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const races = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as unknown as Race,
  );

  return Promise.all(races.map((race) => ensureRaceStatus(race)));
};

// Één race ophalen op ID
export const getRaceById = async (id: string): Promise<Race | null> => {
  const ref = doc(db, COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const race = { id: snapshot.id, ...snapshot.data() } as unknown as Race;
  return ensureRaceStatus(race);
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
  if (race.status === "cancelled")
    throw new Error("Race is geannuleerd wegens onvoldoende deelnemers");
  if (race.participants.length >= race.spots) throw new Error("Race is vol");
  if (user.skill < race.minSkill)
    throw new Error(`Minimum skill om deel te nemen is ${race.minSkill}`);

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
