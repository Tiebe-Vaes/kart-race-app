
export interface Track {
  id: number,
  location: String,
  length: number,
  difficulty: "easy" | "medium" | "hard",
  available: boolean,
  maxSpots: number

}
export interface User {
  id:number,
  name:string,
  lastName: string,
  skill: number,

}
export interface Race {
  id: number,
  track: Track,
  durationInM: number,
  participants: User[],
  entryFee: number,
  spots: number

}