import { Track, User, Race } from './types';
import { Timestamp } from 'firebase/firestore';

export const seedTracks: Omit<Track, 'id'>[] = [
  { location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
  { location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
  { location: "Brands Hatch", length: 3703, difficulty: "easy", available: false, maxSpots: 10 },
  { location: "Monza", length: 5793, difficulty: "medium", available: true, maxSpots: 18 },
  { location: "Silverstone", length: 5891, difficulty: "hard", available: true, maxSpots: 22 },
  { location: "Red Bull Ring", length: 4326, difficulty: "medium", available: true, maxSpots: 16 },
];

export const seedUsers: Omit<User, 'id'>[] = [
  { name: "Jan", lastName: "Smit", skill: 6.5 },
  { name: "Lisa", lastName: "De Groot", skill: 5.0 },
  { name: "Tom", lastName: "Janssen", skill: 3.5 },
  { name: "Sven", lastName: "Peters", skill: 6.0 },
  { name: "Emma", lastName: "Willems", skill: 4.5 },
  { name: "Luca", lastName: "Ferrari", skill: 7.0 },
];

const users = [
  { id: "1", name: "Jan", lastName: "Smit", skill: 6.5 },
  { id: "2", name: "Lisa", lastName: "De Groot", skill: 5.0 },
  { id: "3", name: "Tom", lastName: "Janssen", skill: 3.5 },
  { id: "4", name: "Sven", lastName: "Peters", skill: 6.0 },
  { id: "5", name: "Emma", lastName: "Willems", skill: 4.5 },
  { id: "6", name: "Luca", lastName: "Ferrari", skill: 7.0 },
];

export const seedRaces: Omit<Race, 'id'>[] = [
  {
    track: { id: "1", location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
    durationInM: 90,
    entryFee: 50,
    spots: 12,
    minParticipants: 12,
    minSkill: 5.5,
    status: "scheduled",
    isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-06-12")), // verre toekomst, pro niveau
    participants: [users[0], users[3], users[5], users[1], users[4], users[2]],
  },
  {
    track: { id: "2", location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
    durationInM: 60,
    entryFee: 25,
    spots: 4,
    minParticipants: 4,
    minSkill: 3.0,
    status: "scheduled",
    isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-04-02")), // casual, laag-midden, bijna
    participants: [users[2], users[4]],
  },
  {
    track: { id: "3", location: "Brands Hatch", length: 3703, difficulty: "easy", available: false, maxSpots: 10 },
    durationInM: 45,
    entryFee: 15,
    spots: 8,
    minParticipants: 8,
    minSkill: 2.5,
    status: "scheduled",
    isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-03-18")), // al voorbij, casual
    participants: [users[2], users[1], users[3], users[4], users[0]],
  },
  {
    track: { id: "2", location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
    durationInM: 50,
    entryFee: 22,
    spots: 4,
    minParticipants: 4,
    minSkill: 4.0,
    status: "scheduled",
    isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-03-31")), // vandaag, competitief bijna start
    participants: [users[0], users[5], users[3]], // 3/4 -> zal cancellen bij start
  },
  {
    track: { id: "1", location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
    durationInM: 75,
    entryFee: 40,
    spots: 10,
    minParticipants: 10,
    minSkill: 5.0,
    status: "scheduled",
    isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-05-05")), // komende maand, high skill
    participants: [users[0], users[3], users[5], users[4], users[1], users[2]],
  },
  {
    track: { id: "3", location: "Brands Hatch", length: 3703, difficulty: "easy", available: false, maxSpots: 10 },
    durationInM: 40,
    entryFee: 10,
    spots: 6,
    minParticipants: 6,
    minSkill: 2.0,
    status: "scheduled",
    isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-04-20")), // toekomst casual middelmatig gevuld
    participants: [users[2], users[1], users[4], users[3]],
  },
  {
    track: { id: "4", location: "Monza", length: 5793, difficulty: "medium", available: true, maxSpots: 18 },
    durationInM: 55,
    entryFee: 28,
    spots: 8,
    minParticipants: 8,
    minSkill: 4.5,
    status: "scheduled",
    isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-04-10")),
    participants: [users[0], users[1], users[5]], // 3/8
  },
  {
    track: { id: "5", location: "Silverstone", length: 5891, difficulty: "hard", available: true, maxSpots: 22 },
    durationInM: 80,
    entryFee: 45,
    spots: 12,
    minParticipants: 12,
    minSkill: 5.5,
    status: "scheduled",
    isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-07-01")),
    participants: [users[0], users[3], users[5], users[4]],
  },
  {
    track: { id: "6", location: "Red Bull Ring", length: 4326, difficulty: "medium", available: true, maxSpots: 16 },
    durationInM: 50,
    entryFee: 18,
    spots: 6,
    minParticipants: 6,
    minSkill: 3.5,
    status: "scheduled",
    isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-03-25")),
    participants: [users[2], users[1]],
  },
];