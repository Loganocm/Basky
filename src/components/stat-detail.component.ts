import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BasketballDataService, ExtendedPlayer } from '../services/basketball-data.service';

@Component({
  selector: 'app-stat-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-detail-container">
      <!-- Header -->
      <div class="header">
        <div class="container">
          <div class="header-content">
            <button class="back-button" (click)="goBack()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </button>
            <div class="header-title">
              <h1>{{ getStatTitle() }}</h1>
              <p class="header-subtitle">All players ranked by {{ getStatTitle().toLowerCase() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Players List -->
      <main class="main-content">
        <div class="container">
          <div class="players-table-card">
            <div class="table-header">
              <h2>Leaderboard</h2>
              <span class="player-count">{{ players.length }} players</span>
            </div>

            <div class="table-container desktop-view">
              <table class="players-table">
                <thead>
                  <tr>
                    <th class="rank-col">Rank</th>
                    <th class="player-col">Player</th>
                    <th class="team-col">Team</th>
                    <th class="position-col">Position</th>
                    <th class="stat-col">{{ getStatTitle() }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let player of players; let i = index" class="player-row">
                    <td class="rank-cell">
                      <div class="rank-badge" [class]="getRankClass(i)">{{ i + 1 }}</div>
                    </td>
                    <td class="player-cell">
                      <div class="player-name">{{ player.name }}</div>
                    </td>
                    <td class="team-cell">{{ player.team }}</td>
                    <td class="position-cell">
                      <span class="position-badge">{{ player.position }}</span>
                    </td>
                    <td class="stat-cell">
                      <div class="stat-value">{{ formatStatValue(player[statKey]) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mobile-view">
              <div *ngFor="let player of players; let i = index" class="mobile-player-card">
                <div class="mobile-player-header">
                  <div class="rank-badge" [class]="getRankClass(i)">{{ i + 1 }}</div>
                  <div class="mobile-player-info">
                    <div class="player-name">{{ player.name }}</div>
                    <div class="player-meta">{{ player.team }} • {{ player.position }}</div>
                  </div>
                  <div class="stat-value">{{ formatStatValue(player[statKey]) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .stat-detail-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 20px 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-button:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
    }

    .header-title h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .header-subtitle {
      color: #6b7280;
      font-size: 16px;
      margin: 4px 0 0 0;
    }

    .main-content {
      padding: 30px 0;
    }

    .players-table-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f3f4f6;
      background: #f9fafb;
    }

    .table-header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .player-count {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }

    .table-container {
      overflow-x: auto;
    }

    .players-table {
      width: 100%;
      border-collapse: collapse;
    }

    .players-table th {
      background: #f9fafb;
      padding: 16px 24px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e5e7eb;
    }

    .players-table td {
      padding: 16px 24px;
      border-bottom: 1px solid #f3f4f6;
    }

    .player-row:hover {
      background: #f9fafb;
    }

    .player-row:last-child td {
      border-bottom: none;
    }

    .rank-col { width: 80px; }
    .player-col { width: 200px; }
    .team-col { width: 180px; }
    .position-col { width: 100px; }
    .stat-col { width: 120px; }

    .rank-badge {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: white;
    }

    .rank-gold { background: #f59e0b; }
    .rank-silver { background: #6b7280; }
    .rank-bronze { background: #d97706; }
    .rank-default { background: #9ca3af; }

    .player-name {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
    }

    .team-cell {
      font-size: 14px;
      color: #374151;
    }

    .position-badge {
      display: inline-block;
      padding: 4px 8px;
      background: #e5e7eb;
      color: #374151;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
    }

    .mobile-view {
      display: none;
    }

    .desktop-view {
      display: block;
    }

    .mobile-player-card {
      border-bottom: 1px solid #f3f4f6;
    }

    .mobile-player-card:last-child {
      border-bottom: none;
    }

    .mobile-player-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
    }

    .mobile-player-info {
      flex: 1;
      min-width: 0;
    }

    .player-meta {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .table-header {
        padding: 16px 20px;
      }

      .header-title h1 {
        font-size: 24px;
      }

      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
      }
    }
  `]
})
export class StatDetailComponent implements OnInit {
  players: ExtendedPlayer[] = [];
  statKey: keyof ExtendedPlayer = 'points';
  statFormat: 'number' | 'percentage' = 'number';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private basketballService: BasketballDataService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.statKey = params['statKey'] as keyof ExtendedPlayer;
      this.statFormat = this.getStatFormat(this.statKey);
      this.loadPlayers();
    });
  }

  loadPlayers() {
    const allPlayers = this.basketballService.getPlayers();
    this.players = [...allPlayers].sort((a, b) => {
      const aValue = a[this.statKey] as number;
      const bValue = b[this.statKey] as number;
      return bValue - aValue;
    });
  }

  getStatTitle(): string {
    const titles: Record<string, string> = {
      'points': 'Points Per Game',
      'rebounds': 'Rebounds Per Game',
      'assists': 'Assists Per Game',
      'playerEfficiencyRating': 'Player Efficiency Rating',
      'trueShootingPercentage': 'True Shooting Percentage',
      'winShares': 'Win Shares',
      'boxPlusMinus': 'Box Plus/Minus',
      'usageRate': 'Usage Rate',
      'contestedShotPercentage': 'Contested Shot Percentage',
      'uncontestedShotPercentage': 'Uncontested Shot Percentage',
      'catchAndShootPercentage': 'Catch & Shoot Percentage',
      'pullUpShotPercentage': 'Pull-up Shot Percentage',
      'shotsCreatedForOthers': 'Shots Created for Others',
      'gravityScore': 'Gravity Score',
      'offBallScreenAssists': 'Off-Ball Screen Assists',
      'hockeyAssists': 'Hockey Assists',
      'fourthQuarterPerformance': '4th Quarter Performance',
      'clutchTimeStats': 'Clutch Time Stats',
      'gameWinningShotsMade': 'Game-Winning Shots Made',
      'vsTop10DefensesPerformance': 'vs Top 10 Defenses',
      'backToBackGamePerformance': 'Back-to-Back Performance',
      'shotQualityIndex': 'Shot Quality Index',
      'rimFrequencyPercentage': 'Rim Frequency Percentage',
      'midRangeFrequencyPercentage': 'Mid-Range Frequency Percentage',
      'corner3Percentage': 'Corner 3 Percentage',
      'fastBreakPointsPerGame': 'Fast Break Points Per Game',
      'offensivePointsAdded': 'Offensive Points Added',
      'opponentFieldGoalPercentageWhenGuarded': 'Opponent FG% When Guarded',
      'deflectionsPerGame': 'Deflections Per Game',
      'chargesDrawnPerGame': 'Charges Drawn Per Game',
      'looseBallsRecoveredPerGame': 'Loose Balls Recovered',
      'defensiveWinShares': 'Defensive Win Shares',
      'rimProtectionPercentage': 'Rim Protection Percentage',
      'helpDefenseRotations': 'Help Defense Rotations',
      'contestedShotsPerGame': 'Contested Shots Per Game',
      'screenAssistsPerGame': 'Screen Assists Per Game',
      'milesTraveledPerGame': 'Miles Traveled Per Game',
      'divingForLooseBalls': 'Diving for Loose Balls',
      'transitionDefenseStops': 'Transition Defense Stops',
      'defensiveEstimatedPlusMinus': 'Defensive Estimated Plus/Minus'
    };
    return titles[this.statKey] || this.statKey.toString();
  }

  getStatFormat(statKey: keyof ExtendedPlayer): 'number' | 'percentage' {
    const percentageStats = [
      'trueShootingPercentage',
      'contestedShotPercentage',
      'uncontestedShotPercentage',
      'catchAndShootPercentage',
      'pullUpShotPercentage',
      'rimFrequencyPercentage',
      'midRangeFrequencyPercentage',
      'corner3Percentage',
      'opponentFieldGoalPercentageWhenGuarded',
      'rimProtectionPercentage'
    ];
    return percentageStats.includes(statKey as string) ? 'percentage' : 'number';
  }

  formatStatValue(value: any): string {
    if (typeof value !== 'number') return '0';
    
    if (this.statFormat === 'percentage') {
      return (value * 100).toFixed(1) + '%';
    }
    
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  }

  getRankClass(index: number): string {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return 'rank-default';
  }

  goBack() {
    this.router.navigate(['/']);
  }
}