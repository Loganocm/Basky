import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameDetails {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  quarter: string;
}

interface PlayerStats {
  name: string;
  points: number;
  rebounds: number;
  assists: number;
  team: string;
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
        <div class="game-status">{{ gameDetails.quarter }}</div>
      </div>

      <!-- Player Stats -->
      <div class="stats-section">
        <h2>Top Performers</h2>
        <div class="performers-grid">
          <div *ngFor="let player of topPerformers" class="performer-card" (click)="viewPlayer(player.name)">
            <div class="performer-header">
              <div class="performer-name">{{ player.name }}</div>
              <div class="performer-team">{{ player.team }}</div>
            </div>
            <div class="performer-stats">
              <div class="stat-item">
                <div class="stat-label">PTS</div>
                <div class="stat-value">{{ player.points }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">REB</div>
                <div class="stat-value">{{ player.rebounds }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">AST</div>
                <div class="stat-value">{{ player.assists }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-page-container {
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

    .matchup {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      margin-bottom: 20px;
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

    .stats-section {
      margin-top: 40px;
    }

    .stats-section h2 {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 24px;
    }

    .performers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .performer-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s;
      cursor: pointer;
    }

    .performer-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .performer-header {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .performer-name {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .performer-team {
      font-size: 14px;
      color: #3b82f6;
      font-weight: 600;
    }

    .performer-stats {
      display: flex;
      justify-content: space-around;
    }

    .stat-item {
      text-align: center;
    }

    .stat-label {
      font-size: 11px;
      color: #9ca3af;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
    }

    @media (max-width: 768px) {
      .matchup {
        gap: 20px;
      }

      .team-name {
        font-size: 20px;
      }

      .team-score {
        font-size: 36px;
      }

      .performers-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GamePageComponent implements OnInit {
  @Input() gameId: string = '';
  @Output() back = new EventEmitter<void>();
  @Output() viewPlayerEvent = new EventEmitter<string>();

  gameDetails: GameDetails | null = null;
  topPerformers: PlayerStats[] = [];

  ngOnInit() {
    this.loadGameData();
  }

  loadGameData() {
    // Mock game data
    this.gameDetails = {
      homeTeam: 'LAL',
      awayTeam: 'GSW',
      homeScore: 112,
      awayScore: 108,
      date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      }),
      quarter: 'Final'
    };

    // Mock top performers
    this.topPerformers = [
      { name: 'LeBron James', points: 32, rebounds: 8, assists: 11, team: 'LAL' },
      { name: 'Stephen Curry', points: 28, rebounds: 5, assists: 7, team: 'GSW' },
      { name: 'Anthony Davis', points: 24, rebounds: 12, assists: 4, team: 'LAL' },
      { name: 'Klay Thompson', points: 22, rebounds: 3, assists: 3, team: 'GSW' }
    ];
  }

  goBack() {
    this.back.emit();
  }

  viewPlayer(playerName: string) {
    this.viewPlayerEvent.emit(playerName);
  }
}
