export interface RecentGame {
  id: number;
  date: string;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamScore: number;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamScore: number;
  winnerId: number;
}
