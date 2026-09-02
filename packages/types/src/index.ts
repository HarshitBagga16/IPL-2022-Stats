// Team
export interface Team {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string;
  country: string;
}

// Player
export interface Player {
  id: number;
  name: string;
  shortName: string;
  nationality: string;
  playingRole: string;
  battingStyle: string;
  bowlingStyle: string;
  birthdate: string;
  birthplace: string;
  thumbUrl: string;
  teamId?: number;
}

// Venue
export interface Venue {
  id: number;
  name: string;
  location: string;
  country: string;
}

// Match
export interface Match {
  id: number;
  title: string;
  shortTitle: string;
  matchNumber: string;
  subtitle: string;
  status: string;
  statusNote: string;
  teamA: MatchTeam;
  teamB: MatchTeam;
  dateStart: string;
  venue: Venue;
  result: string;
  winMargin: string;
  winningTeamId: number;
  toss: Toss;
  season: string;
  dlsAffected: boolean;
}

export interface MatchTeam {
  teamId: number;
  name: string;
  shortName: string;
  logoUrl: string;
  scoresFull: string;
  scores: string;
  overs: string;
}

export interface Toss {
  text: string;
  winner: number;
  decision: number; // 1=bat, 2=field
}

// Batting Stats
export interface BattingStat {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  matches: number;
  innings: number;
  runs: number;
  notOut: number;
  highest: number;
  centuries: number;
  halfCenturies: number;
  fours: number;
  sixes: number;
  average: string;
  strikeRate: string;
  balls: number;
}

// Bowling Stats
export interface BowlingStat {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  matches: number;
  innings: number;
  wickets: number;
  economy: string;
  average: string;
  strikeRate: string;
  maidens: number;
  runs: number;
  overs: string;
  bestBowling: string;
}

// Standings
export interface StandingEntry {
  teamId: number;
  team: Team;
  played: number;
  won: number;
  lost: number;
  draw: number;
  noResult: number;
  netRunRate: string;
  points: number;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}
