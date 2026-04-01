import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Reservation } from '../types';

const COLLECTION = 'reservations';

export const getReservations = async ():Promise<Reservation[]> => {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Reservation));
}

export const getReservationsByUser = async (userId: string): Promise<Reservation[]> => {
  const q = query(collection(db, COLLECTION), where("authUser.id", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Reservation));
};

const toDate = (value: Reservation["date"]): Date => {
  const anyValue = value as any;
  if (anyValue?.toDate) return anyValue.toDate();
  return value instanceof Date ? value : new Date(value as any);
};

const parseHourRange = (hour: string): { start: number; end: number } | null => {
  const match = hour.match(/^(\d{2}):\d{2}-(\d{2}):\d{2}$/);
  if (!match) return null;
  return { start: Number(match[1]), end: Number(match[2]) };
};

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number): boolean => {
  return aStart < bEnd && bStart < aEnd;
};

export const hasReservationConflict = async (
  trackId: string,
  date: Date,
  hourRange: string,
): Promise<boolean> => {
  const reservations = await getReservations();
  const requested = parseHourRange(hourRange);
  if (!requested) return false;

  return reservations.some((reservation) => {
    if (reservation.track?.id !== trackId) return false;

    const existingDate = toDate(reservation.date);
    if (existingDate.toDateString() !== date.toDateString()) return false;

    const existingRange = parseHourRange(reservation.hour);
    if (!existingRange) return false;

    return overlaps(requested.start, requested.end, existingRange.start, existingRange.end);
  });
};

export const getReservedSpotsForSlot = async (
  trackId: string,
  date: Date,
  hourRange: string,
): Promise<number> => {
  const reservations = await getReservations();
  const requested = parseHourRange(hourRange);
  if (!requested) return 0;

  return reservations
    .filter((reservation) => {
      if (reservation.track?.id !== trackId) return false;

      const existingDate = toDate(reservation.date);
      if (existingDate.toDateString() !== date.toDateString()) return false;

      const existingRange = parseHourRange(reservation.hour);
      if (!existingRange) return false;

      return overlaps(requested.start, requested.end, existingRange.start, existingRange.end);
    })
    .reduce((sum, reservation) => sum + (Number(reservation.personCount) || 0), 0);
};

export const createReservation = async (reservation: Omit<Reservation, 'id'>):Promise<void> => {
    await addDoc(collection(db, COLLECTION), reservation);

}

export const deleteReservation = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};