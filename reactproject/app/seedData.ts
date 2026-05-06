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
  { name: "Sven", lastName: "Peters", skill: 7.0 },
  { name: "Emma", lastName: "Willems", skill: 4.5 },
  { name: "Luca", lastName: "Ferrari", skill: 8.0 },
];

const users = [
  { id: "1", name: "Jan", lastName: "Smit", skill: 6.5 },
  { id: "2", name: "Lisa", lastName: "De Groot", skill: 5.0 },
  { id: "3", name: "Tom", lastName: "Janssen", skill: 3.5 },
  { id: "4", name: "Sven", lastName: "Peters", skill: 7.0 },
  { id: "5", name: "Emma", lastName: "Willems", skill: 4.5 },
  { id: "6", name: "Luca", lastName: "Ferrari", skill: 8.0 },
];

export const seedRaces: Omit<Race, 'id'>[] = [
  // === 20 scheduled future races (mix comp / non-comp) ===
  {
    track: { id: "1", location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
    durationInM: 75, startHour: "21:00", entryFee: 40, spots: 6, minParticipants: 4, minSkill: 5.0,
    isMixed: false, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-05-12")),
    participants: [users[0], users[3], users[5]],
  },
  {
    track: { id: "2", location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
    durationInM: 60, startHour: "18:00", entryFee: 25, spots: 5, minParticipants: 3, minSkill: 3.0,
    isMixed: true, status: "scheduled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-05-16")),
    participants: [users[2], users[4]],
  },
  {
    track: { id: "4", location: "Monza", length: 5793, difficulty: "medium", available: true, maxSpots: 18 },
    durationInM: 55, startHour: "19:00", entryFee: 28, spots: 6, minParticipants: 4, minSkill: 4.5,
    isMixed: true, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-05-21")),
    participants: [users[0], users[1]],
  },
  {
    track: { id: "6", location: "Red Bull Ring", length: 4326, difficulty: "medium", available: true, maxSpots: 16 },
    durationInM: 50, startHour: "18:00", entryFee: 18, spots: 6, minParticipants: 4, minSkill: 3.5,
    isMixed: false, status: "scheduled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-05-25")),
    participants: [users[2], users[1]],
  },
  {
    track: { id: "5", location: "Silverstone", length: 5891, difficulty: "hard", available: true, maxSpots: 22 },
    durationInM: 80, startHour: "20:00", entryFee: 45, spots: 5, minParticipants: 4, minSkill: 5.5,
    isMixed: true, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-05-29")),
    participants: [users[3], users[5]],
  },
  {
    track: { id: "2", location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
    durationInM: 65, startHour: "17:00", entryFee: 35, spots: 6, minParticipants: 4, minSkill: 4.5,
    isMixed: false, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-06-03")),
    participants: [users[0], users[3], users[1]],
  },
  {
    track: { id: "4", location: "Monza", length: 5793, difficulty: "medium", available: true, maxSpots: 18 },
    durationInM: 60, startHour: "22:00", entryFee: 22, spots: 4, minParticipants: 3, minSkill: 3.5,
    isMixed: true, status: "scheduled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-06-09")),
    participants: [users[2], users[4]],
  },
  {
    track: { id: "6", location: "Red Bull Ring", length: 4326, difficulty: "medium", available: true, maxSpots: 16 },
    durationInM: 60, startHour: "18:00", entryFee: 30, spots: 5, minParticipants: 3, minSkill: 4.0,
    isMixed: true, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-06-14")),
    participants: [users[1], users[4]],
  },
  {
    track: { id: "1", location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
    durationInM: 70, startHour: "19:00", entryFee: 32, spots: 6, minParticipants: 4, minSkill: 4.5,
    isMixed: true, status: "scheduled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-06-19")),
    participants: [users[0], users[2]],
  },
  {
    track: { id: "5", location: "Silverstone", length: 5891, difficulty: "hard", available: true, maxSpots: 22 },
    durationInM: 70, startHour: "19:30", entryFee: 38, spots: 6, minParticipants: 4, minSkill: 5.0,
    isMixed: true, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-06-24")),
    participants: [users[3]],
  },
  {
    track: { id: "2", location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
    durationInM: 55, startHour: "16:30", entryFee: 24, spots: 5, minParticipants: 3, minSkill: 3.5,
    isMixed: true, status: "scheduled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-06-29")),
    participants: [users[4], users[2]],
  },
  {
    track: { id: "4", location: "Monza", length: 5793, difficulty: "medium", available: true, maxSpots: 18 },
    durationInM: 65, startHour: "20:30", entryFee: 33, spots: 6, minParticipants: 4, minSkill: 4.5,
    isMixed: true, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-07-04")),
    participants: [users[0], users[5]],
  },
  {
    track: { id: "1", location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
    durationInM: 90, startHour: "20:00", entryFee: 50, spots: 6, minParticipants: 4, minSkill: 5.5,
    isMixed: true, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-07-10")),
    participants: [users[0], users[3], users[5], users[1], users[4], users[2]],
  },
  {
    track: { id: "6", location: "Red Bull Ring", length: 4326, difficulty: "medium", available: true, maxSpots: 16 },
    durationInM: 70, startHour: "10:00", entryFee: 20, spots: 5, minParticipants: 3, minSkill: 3.0,
    isMixed: true, status: "scheduled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-07-17")),
    participants: [users[0]],
  },
  {
    track: { id: "5", location: "Silverstone", length: 5891, difficulty: "hard", available: true, maxSpots: 22 },
    durationInM: 75, startHour: "21:00", entryFee: 42, spots: 6, minParticipants: 4, minSkill: 5.0,
    isMixed: false, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-07-23")),
    participants: [users[3], users[0], users[1]],
  },
  {
    track: { id: "2", location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
    durationInM: 50, startHour: "15:00", entryFee: 20, spots: 6, minParticipants: 4, minSkill: 3.0,
    isMixed: true, status: "scheduled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-08-01")),
    participants: [users[2], users[4], users[1]],
  },
  {
    track: { id: "4", location: "Monza", length: 5793, difficulty: "medium", available: true, maxSpots: 18 },
    durationInM: 60, startHour: "19:00", entryFee: 30, spots: 5, minParticipants: 3, minSkill: 4.5,
    isMixed: true, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-08-12")),
    participants: [users[5], users[3]],
  },
  {
    track: { id: "6", location: "Red Bull Ring", length: 4326, difficulty: "medium", available: true, maxSpots: 16 },
    durationInM: 55, startHour: "17:00", entryFee: 22, spots: 6, minParticipants: 4, minSkill: 3.5,
    isMixed: false, status: "scheduled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-08-22")),
    participants: [users[2], users[1]],
  },
  {
    track: { id: "1", location: "Spa-Francorchamps", length: 7004, difficulty: "hard", available: true, maxSpots: 20 },
    durationInM: 85, startHour: "20:30", entryFee: 48, spots: 6, minParticipants: 4, minSkill: 5.5,
    isMixed: true, status: "scheduled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-09-05")),
    participants: [users[0], users[3]],
  },
  {
    track: { id: "5", location: "Silverstone", length: 5891, difficulty: "hard", available: true, maxSpots: 22 },
    durationInM: 65, startHour: "18:30", entryFee: 28, spots: 6, minParticipants: 4, minSkill: 4.0,
    isMixed: true, status: "scheduled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-09-20")),
    participants: [users[4], users[2], users[1]],
  },

  // === 2 cancelled (1 past, 1 future) ===
  {
    track: { id: "3", location: "Brands Hatch", length: 3703, difficulty: "easy", available: false, maxSpots: 10 },
    durationInM: 45, startHour: "17:00", entryFee: 15, spots: 6, minParticipants: 4, minSkill: 2.5,
    isMixed: true, status: "cancelled", isCompetitive: false,
    date: Timestamp.fromDate(new Date("2026-03-20")),
    participants: [users[2], users[1], users[3]],
  },
  {
    track: { id: "2", location: "Zandvoort", length: 4259, difficulty: "medium", available: true, maxSpots: 15 },
    durationInM: 50, startHour: "21:00", entryFee: 22, spots: 4, minParticipants: 4, minSkill: 4.0,
    isMixed: true, status: "cancelled", isCompetitive: true,
    date: Timestamp.fromDate(new Date("2026-07-30")),
    participants: [users[0], users[5], users[3]],
  },
];
