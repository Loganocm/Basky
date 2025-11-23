import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketballDataService } from '../services/basketball-data.service';
import { Player } from '../models/player.model';
import { BoxScore } from '../models/box-score.model';
import { RecentGame } from '../interfaces/recent-game.interface';

interface GameDetails {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  quarter: string;
}

interface PlayerBoxScore {
  player: {
    id: number;
    name: string;
    position: string;
    jerseyNumber: number;
    isStarter: boolean;
  };
  minutes: string;
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
}

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-page-container">
      <!-- Header -->
      <div class="header">
        <button class="back-button" (click)="goBack()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back
        </button>
      </div>

      <!-- Game Header -->
      <div class="game-header" *ngIf="gameDetails">
        <div class="game-date">{{ gameDetails.date }}</div>
        <div class="matchup-container">
          <div class="matchup">
            <div class="team away-team" [class.winner]="gameDetails.awayScore > gameDetails.homeScore">
              <div class="team-name">{{ gameDetails.awayTeam }}</div>
              <div class="team-score">{{ gameDetails.awayScore }}</div>
            </div>
            <div class="vs">&#64;</div>
            <div class="team home-team" [class.winner]="gameDetails.homeScore > gameDetails.awayScore">
              <div class="team-name">{{ gameDetails.homeTeam }}</div>
              <div class="team-score">{{ gameDetails.homeScore }}</div>
            </div>
          </div>
        </div>
        <div class="game-status">{{ gameDetails.quarter }}</div>
      </div>

      <!-- Box Score -->
      <div class="box-score-section">
        <h2 class="section-title">Box Score</h2>
        
        <!-- Away Team Box Score -->
        <div class="team-box-score">
          <div class="team-box-header">
            <h3>{{ gameDetails?.awayTeam }}</h3>
            <span class="team-total">{{ gameDetails?.awayScore }}</span>
          </div>
          <div class="box-score-table-wrapper">
            <table class="box-score-table">
              <thead>
                <tr>
                  <th class="player-col">Player</th>
                  <th>MIN</th>
                  <th>PTS</th>
                  <th>REB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TO</th>
                  <th>FG</th>
                  <th>3PT</th>
                  <th>FT</th>
                  <th>+/-</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let playerStat of awayTeamBoxScore" 
                    class="player-stat-row" 
                    [class.starter-row]="playerStat.player.isStarter"
                    (click)="viewPlayer(playerStat.player.name)">
                  <td class="player-name-cell">
                    <div class="player-name">
                      {{ playerStat.player.name }}
                      <span *ngIf="playerStat.player.isStarter" class="starter-badge">★</span>
                    </div>
                    <div class="player-position">{{ playerStat.player.position }}</div>
                  </td>
                  <td>{{ playerStat.minutes }}</td>
                  <td class="highlight-stat">{{ playerStat.points }}</td>
                  <td>{{ playerStat.rebounds }}</td>
                  <td>{{ playerStat.assists }}</td>
                  <td>{{ playerStat.steals }}</td>
                  <td>{{ playerStat.blocks }}</td>
                  <td>{{ playerStat.turnovers }}</td>
                  <td>{{ playerStat.fieldGoalsMade }}-{{ playerStat.fieldGoalsAttempted }}</td>
                  <td>{{ playerStat.threePointersMade }}-{{ playerStat.threePointersAttempted }}</td>
                  <td>{{ playerStat.freeThrowsMade }}-{{ playerStat.freeThrowsAttempted }}</td>
                  <td [class.positive]="playerStat.plusMinus > 0" [class.negative]="playerStat.plusMinus < 0">
                    {{ playerStat.plusMinus > 0 ? '+' : '' }}{{ playerStat.plusMinus }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Home Team Box Score -->
        <div class="team-box-score">
          <div class="team-box-header">
            <h3>{{ gameDetails?.homeTeam }}</h3>
            <span class="team-total">{{ gameDetails?.homeScore }}</span>
          </div>
          <div class="box-score-table-wrapper">
            <table class="box-score-table">
              <thead>
                <tr>
                  <th class="player-col">Player</th>
                  <th>MIN</th>
                  <th>PTS</th>
                  <th>REB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TO</th>
                  <th>FG</th>
                  <th>3PT</th>
                  <th>FT</th>
                  <th>+/-</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let playerStat of homeTeamBoxScore" 
                    class="player-stat-row" 
                    [class.starter-row]="playerStat.player.isStarter"
                    (click)="viewPlayer(playerStat.player.name)">
                  <td class="player-name-cell">
                    <div class="player-name">
                      {{ playerStat.player.name }}
                      <span *ngIf="playerStat.player.isStarter" class="starter-badge">★</span>
                    </div>
                    <div class="player-position">{{ playerStat.player.position }}</div>
                  </td>
                  <td>{{ playerStat.minutes }}</td>
                  <td class="highlight-stat">{{ playerStat.points }}</td>
                  <td>{{ playerStat.rebounds }}</td>
                  <td>{{ playerStat.assists }}</td>
                  <td>{{ playerStat.steals }}</td>
                  <td>{{ playerStat.blocks }}</td>
                  <td>{{ playerStat.turnovers }}</td>
                  <td>{{ playerStat.fieldGoalsMade }}-{{ playerStat.fieldGoalsAttempted }}</td>
                  <td>{{ playerStat.threePointersMade }}-{{ playerStat.threePointersAttempted }}</td>
                  <td>{{ playerStat.freeThrowsMade }}-{{ playerStat.freeThrowsAttempted }}</td>
                  <td [class.positive]="playerStat.plusMinus > 0" [class.negative]="playerStat.plusMinus < 0">
                    {{ playerStat.plusMinus > 0 ? '+' : '' }}{{ playerStat.plusMinus }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-page-container {
      min-height: 100%;
      padding-bottom: 40px;
    }

    .header {
      margin-bottom: 30px;
      position: relative;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #e5e7eb;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
      color: #ffffff;
    }

    .back-button svg {
      width: 20px;
      height: 20px;
    }

    .game-header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 40px;
    }

    .game-date {
      font-size: 14px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }

    .matchup-container {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .matchup {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 32px 48px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
    }

    .team {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .team.winner {
      opacity: 1;
    }

    .team-name {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
    }

    .team.winner .team-name {
      color: #3b82f6;
    }

    .team-score {
      font-size: 48px;
      font-weight: 800;
      color: #ffffff;
    }

    .vs {
      font-size: 20px;
      color: #6b7280;
      font-weight: 600;
    }

    .game-status {
      font-size: 14px;
      color: #22c55e;
      font-weight: 600;
    }

    .box-score-section {
      margin-top: 40px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 32px;
      text-align: center;
    }

    .team-box-score {
      margin-bottom: 40px;
      background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .team-box-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: rgba(59, 130, 246, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .team-box-header h3 {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .team-total {
      font-size: 28px;
      font-weight: 800;
      color: #3b82f6;
    }

    .box-score-table-wrapper {
      overflow-x: auto;
    }

    .box-score-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .box-score-table th {
      background: rgba(255, 255, 255, 0.03);
      padding: 12px 8px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      white-space: nowrap;
    }

    .box-score-table th.player-col {
      text-align: left;
      padding-left: 24px;
      min-width: 180px;
    }

    .box-score-table td {
      padding: 14px 8px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #d1d5db;
    }

    .player-stat-row {
      cursor: pointer;
      transition: all 0.2s;
    }

    .player-stat-row:hover {
      background: rgba(59, 130, 246, 0.08);
    }

    .starter-row {
      background: rgba(251, 191, 36, 0.08);
      border-left: 3px solid #fbbf24;
    }

    .starter-row:hover {
      background: rgba(251, 191, 36, 0.15);
    }

    .player-name-cell {
      text-align: left !important;
      padding-left: 24px !important;
    }

    .player-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .starter-badge {
      color: #fbbf24;
      font-size: 12px;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .player-position {
      font-size: 11px;
      color: #6b7280;
      font-weight: 500;
    }

    .highlight-stat {
      font-weight: 700;
      color: #ffffff;
      font-size: 14px;
    }

    .positive {
      color: #22c55e;
      font-weight: 600;
    }

    .negative {
      color: #ef4444;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .matchup {
        gap: 20px;
        padding: 24px 32px;
      }

      .team-name {
        font-size: 20px;
      }

      .team-score {
        font-size: 36px;
      }

      .box-score-table {
        font-size: 11px;
      }

      .box-score-table th,
      .box-score-table td {
        padding: 10px 6px;
      }

      .team-box-header {
        padding: 16px 20px;
      }

      .team-total {
        font-size: 24px;
      }
    }
  `]
})
export class GamePageComponent implements OnInit {
  @Input() gameId: RecentGame | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() viewPlayerEvent = new EventEmitter<string>();

  gameDetails: GameDetails | null = null;
  homeTeamBoxScore: PlayerBoxScore[] = [];
  awayTeamBoxScore: PlayerBoxScore[] = [];

  constructor(private basketballService: BasketballDataService) {}

  ngOnInit() {
    this.loadGameData();
  }

  loadGameData() {
    if (!this.gameId) return;

    // Set game details first
    this.gameDetails = {
      homeTeam: this.gameId!.homeTeamAbbreviation || this.gameId!.homeTeamName,
      awayTeam: this.gameId!.awayTeamAbbreviation || this.gameId!.awayTeamName,
      homeScore: this.gameId!.homeScore,
      awayScore: this.gameId!.awayScore,
      date: this.formatGameDate(this.gameId!.gameDate),
      quarter: 'Final'
    };

    // Fetch real box scores from the database
    this.basketballService.getBoxScoresByGame(this.gameId!.id).subscribe(boxScores => {
      // Get all players to enrich box score data
      this.basketballService.getAllPlayers().subscribe(players => {
        // Create a player map for quick lookup
        const playerMap = new Map(players.map(p => [p.id, p]));

        // Transform box scores to PlayerBoxScore format
        const allPlayerBoxScores = boxScores.map(bs => {
          const player = playerMap.get(bs.playerId);
          return {
            player: {
              id: bs.playerId,
              name: bs.playerName,
              position: player?.position || 'N/A',
              jerseyNumber: player?.jerseyNumber || 0,
              isStarter: bs.isStarter
            },
            minutes: bs.minutesPlayed,
            points: bs.points,
            rebounds: bs.rebounds,
            assists: bs.assists,
            steals: bs.steals,
            blocks: bs.blocks,
            turnovers: bs.turnovers,
            fieldGoalsMade: bs.fieldGoalsMade,
            fieldGoalsAttempted: bs.fieldGoalsAttempted,
            threePointersMade: bs.threePointersMade,
            threePointersAttempted: bs.threePointersAttempted,
            freeThrowsMade: bs.freeThrowsMade,
            freeThrowsAttempted: bs.freeThrowsAttempted,
            plusMinus: bs.plusMinus
          };
        });

        // Get home and away team IDs from the game data
        const homeTeamId = this.gameId!.homeTeamId;
        const awayTeamId = this.gameId!.awayTeamId;

        // Split box scores by team
        this.homeTeamBoxScore = allPlayerBoxScores.filter(pbs => {
          const boxScore = boxScores.find(bs => bs.playerId === pbs.player.id);
          return boxScore?.teamId === homeTeamId;
        });

        this.awayTeamBoxScore = allPlayerBoxScores.filter(pbs => {
          const boxScore = boxScores.find(bs => bs.playerId === pbs.player.id);
          return boxScore?.teamId === awayTeamId;
        });

        // Sort starters first, then by minutes played
        const sortBoxScores = (scores: PlayerBoxScore[]) => {
          return scores.sort((a, b) => {
            if (a.player.isStarter !== b.player.isStarter) {
              return a.player.isStarter ? -1 : 1;
            }
            const aMinutes = this.parseMinutes(a.minutes);
            const bMinutes = this.parseMinutes(b.minutes);
            return bMinutes - aMinutes;
          });
        };

        this.homeTeamBoxScore = sortBoxScores(this.homeTeamBoxScore);
        this.awayTeamBoxScore = sortBoxScores(this.awayTeamBoxScore);
      });
    });
  }

  parseMinutes(minutesStr: string): number {
    if (!minutesStr) return 0;
    const parts = minutesStr.split(':');
    return parseInt(parts[0]) || 0;
  }

  formatGameDate(dateString: string): string {
    // Parse date string (format: "YYYY-MM-DD") correctly
    // Split the date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in JS
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  goBack() {
    this.back.emit();
  }

  viewPlayer(playerName: string) {
    this.viewPlayerEvent.emit(playerName);
  }
}
