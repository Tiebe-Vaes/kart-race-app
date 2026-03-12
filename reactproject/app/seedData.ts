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
  { name: "Sven", lastName: "Peters", skill: 7 },
  { name: "Emma", lastName: "Willems", skill: 4 },
  { name: "Luca", lastName: "Ferrari", skill: 9 },
];

const users = [
  { id: "1", name: "Jan", lastName: "Smit", skill: 8 },
  { id: "2", name: "Lisa", lastName: "De Groot", skill: 5 },
  { id: "3", name: "Tom", lastName: "Janssen", skill: 3 },
  { id: "4", name: "Sven", lastName: "Peters", skill: 7 },
  { id: "5", name: "Emma", lastName: "Willems", skill: 4 },
  { id: "6", name: "Luca", lastName: "Ferrari", skill: 9 },
];

export const seedRaces: Omit<Race, 'id'>[] = [
  {
    track: { id: "1", location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
    durationInM: 90,
    entryFee: 50,
    spots: 20,
    participants: [users[0], users[3], users[5]],
  },
  {
    track: { id: "2", location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
    durationInM: 60,
    entryFee: 30,
    spots: 15,
    participants: [users[1], users[4]],
  },
  {
    track: { id: "3", location: "Brands Hatch", length: 3703, difficulty: "easy", available: false, maxSpots: 10 },
    durationInM: 45,
    entryFee: 20,
    spots: 10,
    participants: [users[2], users[1], users[3]],
  },
];