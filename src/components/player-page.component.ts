import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketballDataService, Player } from '../services/basketball-data.service';
import { RecentGame } from '../interfaces/recent-game.interface';

interface GameDisplay {
  opponent: string;
  date: string;
  points: number;
  rebounds: number;
  assists: number;
  result: 'W' | 'L';
  gameData: RecentGame; // Store the actual game data
}

@Component({
  selector: 'app-player-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="player-page-container">
      <!-- Header -->
      <div class="header">
        <button class="back-button" (click)="goBack()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back
        </button>
        <div class="player-header" *ngIf="player">
          <div class="player-info">
            <h1>{{ player.name }}</h1>
            <div class="player-meta">
              <span class="team">{{ player.teamAbbreviation }}</span>
              <span class="divider">•</span>
              <span class="position">{{ player.position }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Player Bio -->
      <div class="bio-section" *ngIf="player">
        <div class="bio-card">
          <div class="bio-item">
            <span class="bio-label">Jersey</span>
            <span class="bio-value">#{{ player.jerseyNumber || '--' }}</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">Age</span>
            <span class="bio-value">{{ player.age || '--' }}</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">Height</span>
            <span class="bio-value">{{ player.height || '--' }}</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">Weight</span>
            <span class="bio-value">{{ player.weight ? player.weight + ' lbs' : '--' }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Games -->
      <div class="recent-games-section" *ngIf="player">
        <h2 class="section-title">Recent Games (Last 3)</h2>
        <div *ngIf="recentGames.length > 0" class="games-list">
          <div *ngFor="let game of recentGames" class="game-card" (click)="viewGame(game)">
            <div class="game-result" [class.win]="game.result === 'W'" [class.loss]="game.result === 'L'">
              {{ game.result }}
            </div>
            <div class="game-info">
              <div class="game-opponent">vs {{ game.opponent }}</div>
              <div class="game-date">{{ game.date }}</div>
            </div>
            <div class="game-stats">
              <span class="stat">{{ game.points }} PTS</span>
              <span class="stat">{{ game.rebounds }} REB</span>
              <span class="stat">{{ game.assists }} AST</span>
            </div>
          </div>
        </div>
        <div *ngIf="recentGames.length === 0" class="no-data">
          <p>No recent game data available</p>
        </div>
      </div>

      <!-- Per Game Stats -->
      <div class="stats-category" *ngIf="player">
        <h2 class="section-title">Per Game Stats</h2>
        <div class="stats-grid">
          <div class="stat-card highlight">
            <div class="stat-label">Points</div>
            <div class="stat-value">{{ player.points?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card highlight">
            <div class="stat-label">Rebounds</div>
            <div class="stat-value">{{ player.rebounds?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card highlight">
            <div class="stat-label">Assists</div>
            <div class="stat-value">{{ player.assists?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Games Played</div>
            <div class="stat-value">{{ player.gamesPlayed || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Minutes</div>
            <div class="stat-value">{{ player.minutesPerGame?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Steals</div>
            <div class="stat-value">{{ player.steals?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Blocks</div>
            <div class="stat-value">{{ player.blocks?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Turnovers</div>
            <div class="stat-value">{{ player.turnovers?.toFixed(1) || '0.0' }}</div>
          </div>
        </div>
      </div>

      <!-- Shooting Stats -->
      <div class="stats-category" *ngIf="player">
        <h2 class="section-title">Shooting</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">FG%</div>
            <div class="stat-value">{{ (player.fieldGoalPercentage * 100)?.toFixed(1) || '0.0' }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">3P%</div>
            <div class="stat-value">{{ (player.threePointPercentage * 100)?.toFixed(1) || '0.0' }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">FT%</div>
            <div class="stat-value">{{ (player.freeThrowPercentage * 100)?.toFixed(1) || '0.0' }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">FGM</div>
            <div class="stat-value">{{ player.fieldGoalsMade?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">FGA</div>
            <div class="stat-value">{{ player.fieldGoalsAttempted?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">3PM</div>
            <div class="stat-value">{{ player.threePointersMade?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">3PA</div>
            <div class="stat-value">{{ player.threePointersAttempted?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">FTM</div>
            <div class="stat-value">{{ player.freeThrowsMade?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">FTA</div>
            <div class="stat-value">{{ player.freeThrowsAttempted?.toFixed(1) || '0.0' }}</div>
          </div>
        </div>
      </div>

      <!-- Advanced Stats -->
      <div class="stats-category" *ngIf="player">
        <h2 class="section-title">Advanced Stats</h2>
        <div class="stats-grid">
          <div class="stat-card highlight">
            <div class="stat-label">PER</div>
            <div class="stat-value">{{ player.playerEfficiencyRating?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">TS%</div>
            <div class="stat-value">{{ (player.trueShootingPercentage * 100)?.toFixed(1) || '0.0' }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">eFG%</div>
            <div class="stat-value">{{ (player.effectiveFieldGoalPercentage * 100)?.toFixed(1) || '0.0' }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">AST/TO</div>
            <div class="stat-value">{{ player.assistToTurnoverRatio?.toFixed(2) || '0.00' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Usage Rate</div>
            <div class="stat-value">{{ player.usageRate?.toFixed(1) || '0.0' }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Impact Score</div>
            <div class="stat-value">{{ player.impactScore?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Efficiency</div>
            <div class="stat-value">{{ player.efficiencyRating?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">+/-</div>
            <div class="stat-value">{{ player.plusMinus?.toFixed(1) || '0.0' }}</div>
          </div>
        </div>
      </div>

      <!-- Misc Stats -->
      <div class="stats-category" *ngIf="player">
        <h2 class="section-title">Other</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">OREB</div>
            <div class="stat-value">{{ player.offensiveRebounds?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">DREB</div>
            <div class="stat-value">{{ player.defensiveRebounds?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Personal Fouls</div>
            <div class="stat-value">{{ player.personalFouls?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Fantasy Points</div>
            <div class="stat-value">{{ player.fantasyPoints?.toFixed(1) || '0.0' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Double Doubles</div>
            <div class="stat-value">{{ player.doubleDoubles || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Triple Doubles</div>
            <div class="stat-value">{{ player.tripleDoubles || 0 }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .player-page-container {
      min-height: 100%;
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

    .player-header {
      text-align: center;
      padding: 20px 0;
    }

    .player-info h1 {
      font-size: 36px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 12px 0;
    }

    .player-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 18px;
      color: #9ca3af;
    }

    .team {
      color: #3b82f6;
      font-weight: 600;
    }

    .divider {
      color: #4b5563;
    }

    .position {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
    }

    .bio-section {
      margin-bottom: 30px;
    }

    .bio-card {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .bio-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .bio-label {
      font-size: 11px;
      color: #9ca3af;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .bio-value {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid rgba(59, 130, 246, 0.3);
    }

    .stats-category {
      margin-bottom: 40px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      transition: all 0.2s;
    }

    .stat-card.highlight {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }

    .stat-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .stat-card.highlight:hover {
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.4);
    }

    .stat-label {
      font-size: 11px;
      color: #9ca3af;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
    }

    .recent-games-section {
      margin-bottom: 40px;
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
    }

    .no-data p {
      margin: 0;
      font-size: 14px;
    }

    .games-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .game-card {
      display: flex;
      align-items: center;
      gap: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px 20px;
      transition: all 0.2s;
      cursor: pointer;
    }

    .game-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateX(4px);
    }

    .game-result {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
    }

    .game-result.win {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .game-result.loss {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .game-info {
      flex: 1;
    }

    .game-opponent {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .game-date {
      font-size: 14px;
      color: #9ca3af;
    }

    .game-stats {
      display: flex;
      gap: 16px;
    }

    .game-stats .stat {
      font-size: 14px;
      color: #d1d5db;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .bio-card {
        grid-template-columns: repeat(2, 1fr);
      }

      .player-info h1 {
        font-size: 28px;
      }

      .game-card {
        flex-direction: column;
        align-items: flex-start;
      }

      .game-stats {
        width: 100%;
        justify-content: space-between;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .bio-card {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
    }
  `]
})
export class PlayerPageComponent implements OnInit {
  @Input() playerName: string = '';
  @Output() back = new EventEmitter<void>();
  @Output() viewGameEvent = new EventEmitter<RecentGame>();

  player: Player | null = null;
  recentGames: GameDisplay[] = [];

  constructor(private basketballService: BasketballDataService) {}

  ngOnInit() {
    this.loadPlayerData();
  }

  loadPlayerData() {
    this.basketballService.getAllPlayers().subscribe(players => {
      this.player = players.find(p => p.name === this.playerName) || null;
      
      // Load recent games AFTER player data is loaded
      if (this.player) {
        this.loadRecentGames();
      }
    });
  }

  loadRecentGames() {
    if (!this.player?.id) {
      console.warn('Cannot load recent games: player ID not available');
      this.recentGames = [];
      return;
    }
    
    console.log(`Loading recent games for player ID: ${this.player.id} (${this.player.name})`);
    
    // Load box scores for this specific player from the backend using player ID
    this.basketballService.getBoxScoresByPlayer(this.player.id).subscribe({
      next: (boxScores) => {
        console.log(`Fetched ${boxScores.length} box scores for player ${this.player?.name}`);
        
        // Get the last 3 games
        const recentBoxScores = boxScores.slice(0, 3);
        
        // For each box score, fetch the game details
        const gameRequests = recentBoxScores.map(boxScore =>
          this.basketballService.getGameById(boxScore.gameId)
        );
        
        // Wait for all game details to load
        if (gameRequests.length === 0) {
          console.log('No box scores found for this player');
          this.recentGames = [];
          return;
        }
        
        // Combine box scores with game data
        Promise.all(gameRequests.map(obs => obs.toPromise())).then(games => {
          this.recentGames = recentBoxScores.map((boxScore, index) => {
            const game = games[index];
            if (!game) return null;
            
            const isHomeTeam = game.homeTeamId === this.player?.teamId;
            const teamScore = isHomeTeam ? game.homeScore : game.awayScore;
            const opponentScore = isHomeTeam ? game.awayScore : game.homeScore;
            const opponent = isHomeTeam ? game.awayTeamAbbreviation : game.homeTeamAbbreviation;
            
            return {
              opponent: opponent,
              date: new Date(game.gameDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              }),
              points: boxScore.points || 0,
              rebounds: boxScore.rebounds || 0,
              assists: boxScore.assists || 0,
              result: teamScore > opponentScore ? 'W' as const : 'L' as const,
              gameData: game
            };
          }).filter((game): game is GameDisplay => game !== null);
          console.log(`Displaying ${this.recentGames.length} recent games`);
        }).catch(error => {
          console.error('Error loading game details:', error);
          this.recentGames = [];
        });
      },
      error: (error) => {
        console.error('Error loading box scores:', error);
        this.recentGames = [];
      }
    });
  }

  goBack() {
    this.back.emit();
  }

  viewGame(game: GameDisplay) {
    // Use the actual game data stored in the GameDisplay object
    this.viewGameEvent.emit(game.gameData);
  }
}
