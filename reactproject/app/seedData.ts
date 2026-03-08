import { Track, User, Race } from './types';

export const seedTracks: Omit<Track, 'id'>[] = [
  { location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
  { location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
  { location: "Brands Hatch", length: 3703, difficulty: "easy", available: false, maxSpots: 10 },
];

export const seedUsers: Omit<User, 'id'>[] = [
  { name: "Jan", lastName: "Smit", skill: 8 },
  { name: "Lisa", lastName: "De Groot", skill: 5 },
  { name: "Tom", lastName: "Janssen", skill: 3 },
];
export const seedRaces: Omit<Race, 'id'>[] = [
  {
    track: { id: 1, location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
    durationInM: 90,
    participants: [],
    entryFee: 50,
    spots: 20,
  },
  {
    track: { id: 2, location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
    durationInM: 60,
    participants: [],
    entryFee: 30,
    spots: 15,
  },
  {
    track: { id: 3, location: "Brands Hatch", length: 3703, difficulty: "easy", available: false, maxSpots: 10 },
    durationInM: 45,
    participants: [],
    entryFee: 20,
    spots: 10,
  },
];