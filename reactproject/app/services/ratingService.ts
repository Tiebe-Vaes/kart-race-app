import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { User } from "../types";

const SKILL_MIN = 0.5;
const SKILL_MAX = 7;
const WIN_DELTA = 12;
const LOSS_DELTA = -8;
const MAX_GAIN = 15;
const MAX_LOSS = -12;
const GAP_THRESHOLD = 3;

export interface RaceResultOptions {
  isCompetitive?: boolean;
  isPlacement?: boolean;
  cleanRace?: boolean;
  incidents?: boolean;
}

export interface SkillUpdate {
  id: string;
  delta: number;
  newSkill: number;
}

const clampSkill = (value: number) => Math.max(SKILL_MIN, Math.min(SKILL_MAX, value));

const applyBehaviourModifiers = (delta: number, opts: RaceResultOptions) => {
  let adjusted = delta;
  if (opts.cleanRace) adjusted += 1;
  if (opts.incidents) adjusted -= 2;
  return adjusted;
};

const applyPlacement = (delta: number, opts: RaceResultOptions) =>
  opts.isPlacement ? delta * 1.5 : delta;

const capDelta = (delta: number) => Math.min(MAX_GAIN, Math.max(MAX_LOSS, delta));

const scaledDelta = (base: number, teamAvg: number, oppAvg: number) => {
  if (Math.abs(teamAvg - oppAvg) >= GAP_THRESHOLD) return base * 0.5;
  return base;
};

const teamAverage = (players: User[]) => {
  if (!players.length) return 0;
  const sum = players.reduce((acc, p) => acc + (p.skill || 0), 0);
  return sum / players.length;
};

const buildUpdates = (players: User[], baseDelta: number, teamAvg: number, oppAvg: number, opts: RaceResultOptions): SkillUpdate[] => {
  return players.map((player) => {
    const scaled = scaledDelta(baseDelta, teamAvg, oppAvg);
    const withPlacement = applyPlacement(scaled, opts);
    const withBehaviour = applyBehaviourModifiers(withPlacement, opts);
    const capped = capDelta(withBehaviour);
    const newSkill = clampSkill((player.skill || 0) + capped);
    return { id: player.id, delta: capped, newSkill };
  });
};

export const calculateSkillUpdates = (
  winners: User[],
  losers: User[],
  opts: RaceResultOptions = { isCompetitive: true },
): SkillUpdate[] => {
  if (!opts.isCompetitive) return [];

  const winnersAvg = teamAverage(winners);
  const losersAvg = teamAverage(losers);

  const winnerUpdates = buildUpdates(winners, WIN_DELTA, winnersAvg, losersAvg, opts);
  const loserUpdates = buildUpdates(losers, LOSS_DELTA, losersAvg, winnersAvg, opts);

  return [...winnerUpdates, ...loserUpdates];
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

export const applyRaceResult = async (
  winners: User[],
  losers: User[],
  opts: RaceResultOptions = { isCompetitive: true },
): Promise<SkillUpdate[]> => {
  const updates = calculateSkillUpdates(winners, losers, opts);
  if (updates.length === 0) return updates;
  await persistSkillUpdates(updates);
  return updates;
};
