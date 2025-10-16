import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketballDataService, ExtendedPlayer } from '../services/basketball-data.service';

interface Game {
  opponent: string;
  date: string;
  points: number;
  rebounds: number;
  assists: number;
  result: 'W' | 'L';
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
              <span class="team">{{ player.team }}</span>
              <span class="divider">•</span>
              <span class="position">{{ player.position }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" *ngIf="player">
        <div class="stat-card">
          <div class="stat-label">Points Per Game</div>
          <div class="stat-value">{{ player.points.toFixed(1) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Rebounds Per Game</div>
          <div class="stat-value">{{ player.rebounds.toFixed(1) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Assists Per Game</div>
          <div class="stat-value">{{ player.assists.toFixed(1) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Player Efficiency</div>
          <div class="stat-value">{{ player.playerEfficiencyRating.toFixed(1) }}</div>
        </div>
      </div>

      <!-- Recent Games -->
      <div class="recent-games-section">
        <h2>Recent Games</h2>
        <div class="games-list">
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: all 0.2s;
    }

    .stat-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .stat-label {
      font-size: 12px;
      color: #9ca3af;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
    }

    .recent-games-section {
      margin-top: 40px;
    }

    .recent-games-section h2 {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 20px;
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
  `]
})
export class PlayerPageComponent implements OnInit {
  @Input() playerName: string = '';
  @Output() back = new EventEmitter<void>();
  @Output() viewGameEvent = new EventEmitter<Game>();

  player: ExtendedPlayer | null = null;
  recentGames: Game[] = [];

  constructor(private basketballService: BasketballDataService) {}

  ngOnInit() {
    this.loadPlayerData();
    this.loadRecentGames();
  }

  loadPlayerData() {
    const players = this.basketballService.getPlayers();
    this.player = players.find(p => p.name === this.playerName) || null;
  }

  loadRecentGames() {
    // Generate mock recent games data
    const opponents = ['LAL', 'GSW', 'BOS', 'MIA', 'PHX'];
    const results: ('W' | 'L')[] = ['W', 'L', 'W', 'W', 'L'];
    
    this.recentGames = Array.from({ length: 5 }, (_, i) => ({
      opponent: opponents[i],
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      points: Math.floor(Math.random() * 20) + 15,
      rebounds: Math.floor(Math.random() * 8) + 3,
      assists: Math.floor(Math.random() * 8) + 2,
      result: results[i]
    }));
  }

  goBack() {
    this.back.emit();
  }

  viewGame(game: Game) {
    this.viewGameEvent.emit(game);
  }
}
