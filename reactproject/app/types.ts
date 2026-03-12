
export interface Track {
  id: string,
  location: String,
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
  participants: User[],
  entryFee: number,
  spots: number

}