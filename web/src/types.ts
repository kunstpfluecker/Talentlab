export type Player = {
  id: string;
  uniqueId?: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  nation: string;
  playsIn?: string;
  position?: string;
  club?: string;
  level?: string;
  height?: string;
  foot?: string;
  note?: string;
  photoData?: string | null;
  shortlisted?: boolean;
};

export type RosterEntry = { playerId: string; number: string };

export type Team = {
  id: string;
  name: string;
  kitColor: string;
  roster: RosterEntry[];
};

export type Game = {
  id: string;
  teamAId: string;
  teamBId?: string | null;
  kickoff?: string;
  kitA?: string;
  kitB?: string;
  note?: string;
  pitchId?: string | null;
  lineup?: {
    playerId: string;
    teamId: string;
    number: string;
    kit?: string;
    position?: string;
  }[];
  videos?: {
    id: string;
    name: string;
    status: "none" | "uploaded" | "processing" | "done" | "failed";
  }[];
};

export type Venue = {
  id: string;
  name: string;
  address?: string;
  homeClub?: string;
  contact?: string;
  price?: string;
  note?: string;
  photoData?: string | null;
  pitches?: { id?: string; label: string; surface?: string; lights?: boolean }[];
};

export type Tournament = {
  id: string;
  uniqueId?: string;
  name: string;
  country: string;
  start?: string;
  end?: string;
  note?: string;
  venue?: Venue;
  participants?: string[];
  teams: Team[];
  games?: Game[];
};

export type Evaluation = {
  id: string;
  eventId: string;
  playerId: string;
  scoutName: string;
  ratingTechnique: number;
  ratingPhysical: number;
  ratingIntelligence: number;
  ratingMentality: number;
  ratingImpact: number;
  strengths?: string | null;
  weaknesses?: string | null;
  remarks?: string | null;
  createdAt?: string;
};
