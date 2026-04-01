import { Timestamp } from "firebase/firestore"

export interface Track {
  id: string,
  location: string,
  length: number,
  difficulty: "easy" | "medium" | "hard",
  available: boolean,
  maxSpots: number

}
export interface User {
  id:string,
  name:string,
  lastName: string,
  skill: number,
}
export interface UserCredentials {
  email: string,
  password: string
}
export interface AuthenticatedUser {
  credentials: UserCredentials,
  user: User
}
export interface FirestoreUser {
  id: string,
  uid: string,
  email: string,
  name: string,
  lastName: string,
  skill: number,
}
export interface Race {
  id: string,
  track: Track,
  durationInM: number,
  startHour: string,
  participants: User[],
  entryFee: number,
  spots: number,
  minParticipants: number,
  minSkill: number,
  isMixed: boolean,
  status: "scheduled" | "cancelled" | "completed",
  isCompetitive: boolean,
  date: Timestamp

}
export interface Reservation {
  id: string,
  track: Track,
  authUser: FirestoreUser,
  date: Date | Timestamp,
  hour: string,
  personCount: number


}