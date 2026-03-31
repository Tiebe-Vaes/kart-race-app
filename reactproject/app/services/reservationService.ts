import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Reservation, Track } from '../types';

const COLLECTION = 'reservations';

export const getReservations = async ():Promise<Reservation[]> => {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Reservation));
}

export const createReservation = async (reservation: Omit<Reservation, 'id'>):Promise<void> => {
    await addDoc(collection(db, COLLECTION), reservation);

}

export const deleteReservation = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};