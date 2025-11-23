export interface BoxScore {
  id: number;
  gameId: number;
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  minutesPlayed: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  plusMinus: number;
  isStarter: boolean;
}
