export interface RecentGame {
  id: number;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamAbbreviation: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamAbbreviation: string;
  homeScore: number;
  awayScore: number;
  gameDate: string;
}
