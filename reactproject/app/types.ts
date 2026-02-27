export interface Track {
  id?: number;
  name: string;
  location: string;
  length: string;
  pricePerSession: number;
  priceUnit: string;
  surface: string;
  indoor: boolean;
  rentalKarts: boolean;
  features: string[];
}

export type SessionType = "recreatief" | "competitief";

export interface Driver {
  id?: number;
  displayName: string;
  level: number;
}

export interface Race {
  id?: number;
  trackId: number;
  title: string;
  dateTime: string;
  skillMin: number;
  skillMax: number;
  minDrivers: number;
  maxDrivers: number;
  type: SessionType;
  entryFee: number;
  confirmed: boolean;
}

export interface RaceParticipant {
  id?: number;
  raceId: number;
  driverId: number;
  paid: boolean;
}
