import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamStats } from '../components/team-overview.component';
import { RecentGame } from '../interfaces/recent-game.interface';

export interface Team {
  id: number;
  name: string;
  city: string;
  abbreviation: string;
}

export interface Player {
  id: number;
  name: string;
  position: string;
  jerseyNumber: number;
  teamId: number;
  teamName: string;
  teamCity: string;
  teamAbbreviation: string;
  isStarter: boolean;
  gamesPlayed: number;
  minutesPerGame: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  plusMinus: number;
  fantasyPoints: number;
  doubleDoubles: number;
  tripleDoubles: number;
  personalFouls: number;
  age: number;
  height: string;
  weight: number;
  efficiencyRating: number;
  trueShootingPercentage: number;
  effectiveFieldGoalPercentage: number;
  assistToTurnoverRatio: number;
  impactScore: number;
  usageRate: number;
  playerEfficiencyRating: number;
}

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

@Injectable({ providedIn: 'root' })
export class BasketballDataService {
  private readonly baseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : 'http://13.59.211.131:8080/api';
  constructor(private http: HttpClient) {}
  // Player endpoints
  getAllPlayers(): Observable<Player[]> { 
    return this.http.get<Player[]>(`${this.baseUrl}/players`); 
  }
  
  getPlayerById(id: number): Observable<Player> { 
    return this.http.get<Player>(`${this.baseUrl}/players/${id}`); 
  }
  
  searchPlayers(name: string): Observable<Player[]> { 
    return this.http.get<Player[]>(`${this.baseUrl}/players/search?name=${encodeURIComponent(name)}`); 
  }
  
  getTopScorers(limit: number = 10): Observable<Player[]> { 
    return this.http.get<Player[]>(`${this.baseUrl}/players/top-scorers?limit=${limit}`); 
  }
  
  getPlayersByTeam(teamId: number): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/players/team/${teamId}`);
  }
  
  getStartersByTeam(teamId: number): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/players/team/${teamId}/starters`);
  }
  
  getReservesByTeam(teamId: number): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/players/team/${teamId}/reserves`);
  }
  
  // Client-side filtering and sorting
  filterPlayers(players: Player[], filters: any): Player[] { 
    let f = [...players]; 
    if (filters.position) f = f.filter(p => p.position === filters.position); 
    if (filters.team) f = f.filter(p => p.teamName === filters.team || p.teamAbbreviation === filters.team); 
    return f; 
  }
  
  sortPlayers(players: Player[], sortBy: string): Player[] { 
    return players.sort((a, b) => { 
      switch (sortBy) { 
        case 'name': return a.name.localeCompare(b.name); 
        case 'points': return (b.points || 0) - (a.points || 0); 
        case 'playerEfficiencyRating': return (b.playerEfficiencyRating || 0) - (a.playerEfficiencyRating || 0); 
        case 'trueShootingPercentage': return (b.trueShootingPercentage || 0) - (a.trueShootingPercentage || 0); 
        case 'impactScore': return (b.impactScore || 0) - (a.impactScore || 0); 
        default: return 0; 
      } 
    }); 
  }
  
  // Game endpoints
  getRecentGames(limit: number = 10): Observable<RecentGame[]> { 
    return this.http.get<RecentGame[]>(`${this.baseUrl}/games/recent?limit=${limit}`); 
  }
  
  getGamesByTeam(teamId: number): Observable<RecentGame[]> {
    return this.http.get<RecentGame[]>(`${this.baseUrl}/games/team/${teamId}`);
  }
  
  getGameById(id: number): Observable<RecentGame> {
    return this.http.get<RecentGame>(`${this.baseUrl}/games/${id}`);
  }

  // Box score endpoints
  getBoxScoresByGame(gameId: number): Observable<BoxScore[]> {
    return this.http.get<BoxScore[]>(`${this.baseUrl}/boxscores/game/${gameId}`);
  }

  getBoxScoresByPlayer(playerId: number): Observable<BoxScore[]> {
    return this.http.get<BoxScore[]>(`${this.baseUrl}/boxscores/player/${playerId}`);
  }
  
  // Team endpoints
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/teams`);
  }
  
  getTeamById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/teams/${id}`);
  }
  
  searchTeams(name?: string, abbr?: string): Observable<Team[]> {
    let params = '';
    if (name) params += `?name=${encodeURIComponent(name)}`;
    if (abbr) params += (params ? '&' : '?') + `abbr=${encodeURIComponent(abbr)}`;
    return this.http.get<Team[]>(`${this.baseUrl}/teams/search${params}`);
  }
  
  // Deprecated - no longer used
  getTeamStats(): TeamStats[] { 
    return []; 
  }
}
