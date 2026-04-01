import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { User } from "../types";

const SKILL_MIN = 0.5;
const SKILL_MAX = 7;
const MAX_GAIN = 15;
const MAX_LOSS = -12;
const FIELD_STRENGTH_MIN = 0.6;
const FIELD_STRENGTH_MAX = 1.4;
const BASE_K = 10;
const GAP_DIVISOR = 10; // higher reduces sensitivity

export interface RaceResultOptions {
  isCompetitive?: boolean;
  isPlacement?: boolean;
  cleanRace?: boolean;
  incidents?: boolean;
  durationInM?: number;
  trackDifficulty?: "easy" | "medium" | "hard";
}

export interface SkillUpdate {
  id: string;
  delta: number;
  newSkill: number;
}

export interface Finisher {
  user: User;
  position: number; // 1 = winnaar
  clean?: boolean;
  incident?: boolean;
}

const clampSkill = (value: number) => Math.max(SKILL_MIN, Math.min(SKILL_MAX, value));

const applyBehaviourModifiers = (delta: number, opts: RaceResultOptions, overrideClean?: boolean, overrideIncident?: boolean) => {
  let adjusted = delta;
  const isClean = overrideClean ?? opts.cleanRace;
  const hasIncident = overrideIncident ?? opts.incidents;
  if (isClean) adjusted += 1;
  if (hasIncident) adjusted -= 2;
  return adjusted;
};

const capDelta = (delta: number) => Math.min(MAX_GAIN, Math.max(MAX_LOSS, delta));

const teamAverage = (players: User[]) => {
  if (!players.length) return 0;
  const sum = players.reduce((acc, p) => acc + (p.skill || 0), 0);
  return sum / players.length;
};

const trackFactorFromDifficulty = (difficulty?: "easy" | "medium" | "hard") => {
  if (difficulty === "easy") return 0.95;
  if (difficulty === "hard") return 1.05;
  return 1.0;
};

const raceLengthFactor = (minutes?: number) => {
  if (!minutes) return 1.0;
  if (minutes >= 90) return 1.2;
  if (minutes >= 60) return 1.1;
  if (minutes >= 30) return 1.0;
  return 0.9;
};

export const calculateSkillUpdatesFromPositions = (
  finishers: Finisher[],
  opts: RaceResultOptions = { isCompetitive: true },
): SkillUpdate[] => {
  if (!opts.isCompetitive || finishers.length === 0) return [];

  const gridSize = finishers.length;
  const fieldAvg = teamAverage(finishers.map((f) => f.user));
  const trackFactor = trackFactorFromDifficulty(opts.trackDifficulty);
  const lengthFactor = raceLengthFactor(opts.durationInM);

  return finishers.map((finisher) => {
    const { user, position } = finisher;
    const gap = (user.skill || 0) - fieldAvg;
    const fieldStrength = Math.max(
      FIELD_STRENGTH_MIN,
      Math.min(FIELD_STRENGTH_MAX, 1 - gap / GAP_DIVISOR),
    );

    const posMultiplier = Math.max(0, Math.min(1, (gridSize - position + 1) / gridSize));
    const base = BASE_K * fieldStrength * trackFactor * lengthFactor;
    const raw = base * (posMultiplier - 0.5);
    const withBehaviour = applyBehaviourModifiers(raw, opts, finisher.clean, finisher.incident);
    const capped = capDelta(withBehaviour);
    const newSkill = clampSkill((user.skill || 0) + capped);

    return { id: user.id, delta: capped, newSkill };
  });
};

const updateUserSkillEverywhere = async (id: string, newSkill: number) => {
  const authRef = doc(db, "authUsers", id);
  const authSnap = await getDoc(authRef);
  if (authSnap.exists()) {
    await updateDoc(authRef, { skill: newSkill });
  }

  const userRef = doc(db, "users", id);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    await updateDoc(userRef, { skill: newSkill });
  }
};

export const persistSkillUpdates = async (updates: SkillUpdate[]): Promise<void> => {
  await Promise.all(updates.map((u) => updateUserSkillEverywhere(u.id, u.newSkill)));
};

export const applyRaceResultFromPositions = async (
  finishers: Finisher[],
  opts: RaceResultOptions = { isCompetitive: true },
): Promise<SkillUpdate[]> => {
  const updates = calculateSkillUpdatesFromPositions(finishers, opts);
  if (updates.length === 0) return updates;
  await persistSkillUpdates(updates);
  return updates;
};
