import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Player } from './player-card.component';
import { BasketballDataService, ExtendedPlayer } from '../services/basketball-data.service';

interface CategoryLeaderboard {
  title: string;
  icon: string;
  color: string;
  statKey: keyof ExtendedPlayer;
  format: 'number' | 'percentage';
  players: ExtendedPlayer[];
}

@Component({
  selector: 'app-category-leaderboards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboards-container">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          *ngFor="let tab of tabs" 
          class="tab-button"
          [class.active]="activeTab === tab.key"
          (click)="setActiveTab(tab.key)">
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="leaderboards-grid">
        <div *ngFor="let category of getActiveCategories()" class="category-card">
        <!-- Category Header -->
        <div class="category-header">
          <h3 class="category-title">{{ category.title }}</h3>
        </div>

        <!-- Top 4 Players -->
        <div class="players-list">
          <div *ngFor="let player of category.players; let i = index" class="player-row">
            <div class="rank-badge">
              {{ i + 1 }}
            </div>
            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-team">{{ player.team }}</div>
            </div>
            <div class="stat-value">
              {{ formatStat(player[category.statKey], category.format) }}
            </div>
          </div>
          
          <!-- View More Button -->
          <div class="view-more-container">
            <button class="view-more-button" (click)="viewMoreStats(category.statKey)">
              View More
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-navigation {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 30px;
    }

    .tab-button {
      padding: 12px 24px;
      border: none;
      background: #f3f4f6;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
      border: 1px solid #e5e7eb;
    }

    .tab-button:hover {
      color: #374151;
      background: #e5e7eb;
      border-color: #d1d5db;
    }

    .tab-button.active {
      color: white;
      background: #3b82f6;
      border-color: #3b82f6;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }

    .category-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 20px;
    }

    .leaderboards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .category-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .category-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
      background: #f9fafb;
    }

    .category-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .players-list {
      padding: 0;
    }

    .player-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid #f3f4f6;
    }

    .player-row:hover {
      background: #f9fafb;
    }

    .player-row:last-child {
      border-bottom: none;
    }

    .rank-badge {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      background: #f3f4f6;
      flex-shrink: 0;
    }

    .player-info {
      flex: 1;
      min-width: 0;
    }

    .player-name {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-team {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stat-value {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
      flex-shrink: 0;
    }

    .view-more-container {
      padding: 12px 20px;
      border-top: 1px solid #f3f4f6;
      display: flex;
      justify-content: center;
    }

    .view-more-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 24px;
      background: #f8f9fa;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-more-button:hover {
      background: #e5e7eb;
      border-color: #d1d5db;
      color: #1f2937;
    }

    .view-more-button svg {
      width: 16px;
      height: 16px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .leaderboards-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }

      .tab-navigation {
        margin-bottom: 20px;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
      }

      .tab-button {
        padding: 10px 16px;
        font-size: 13px;
      }

      .leaderboards-grid {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        width: 100%;
        padding: 0 20px;
      }

      .category-card {
        width: 100%;
        max-width: 400px;
      }

      .category-header {
        padding: 12px 15px;
      }

      .player-row {
        padding: 10px 15px;
      }
    }

    @media (max-width: 480px) {
      .tab-button {
        padding: 8px 12px;
        font-size: 12px;
      }

      .category-card {
        max-width: 100%;
      }

      .leaderboards-grid {
        padding: 0 15px;
      }
    }
  `]
})
export class CategoryLeaderboardsComponent implements OnInit {
  offenseCategories: CategoryLeaderboard[] = [];
  defenseCategories: CategoryLeaderboard[] = [];
  generalCategories: CategoryLeaderboard[] = [];
  
  activeTab: 'offense' | 'defense' | 'general' = 'general';
  
  tabs = [
    { key: 'general' as const, label: 'General Stats' },
    { key: 'offense' as const, label: 'Offense' },
    { key: 'defense' as const, label: 'Defense' }
  ];

  constructor(
    private basketballService: BasketballDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  setActiveTab(tab: 'offense' | 'defense' | 'general') {
    this.activeTab = tab;
  }

  getActiveCategories(): CategoryLeaderboard[] {
    switch (this.activeTab) {
      case 'offense':
        return this.offenseCategories;
      case 'defense':
        return this.defenseCategories;
      case 'general':
        return this.generalCategories;
      default:
        return this.generalCategories;
    }
  }
  private loadCategories() {
    const allPlayers = this.basketballService.getPlayers();

    // General Stats
    this.generalCategories = [
      {
        title: 'Points Per Game',
        icon: '',
        color: '',
        statKey: 'points',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'points', 4)
      },
      {
        title: 'Rebounds Per Game',
        icon: '',
        color: '',
        statKey: 'rebounds',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'rebounds', 4)
      },
      {
        title: 'Assists Per Game',
        icon: '',
        color: '',
        statKey: 'assists',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'assists', 4)
      },
      {
        title: 'Player Efficiency Rating',
        icon: '',
        color: '',
        statKey: 'playerEfficiencyRating',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'playerEfficiencyRating', 4)
      },
      {
        title: 'True Shooting %',
        icon: '',
        color: '',
        statKey: 'trueShootingPercentage',
        format: 'percentage',
        players: this.getTopPlayers(allPlayers, 'trueShootingPercentage', 4)
      },
      {
        title: 'Win Shares',
        icon: '',
        color: '',
        statKey: 'winShares',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'winShares', 4)
      },
      {
        title: 'Box Plus/Minus',
        icon: '',
        color: '',
        statKey: 'boxPlusMinus',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'boxPlusMinus', 4)
      },
      {
        title: 'Usage Rate',
        icon: '',
        color: '',
        statKey: 'usageRate',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'usageRate', 4)
      }
    ];

    // Offense Categories
    this.offenseCategories = [
      {
        title: 'Contested Shot %',
        icon: '',
        color: '',
        statKey: 'contestedShotPercentage',
        format: 'percentage',
        players: this.getTopPlayers(allPlayers, 'contestedShotPercentage', 4)
      },
      {
        title: 'Uncontested Shot %',
        icon: '',
        color: '',
        statKey: 'uncontestedShotPercentage',
        format: 'percentage',
        players: this.getTopPlayers(allPlayers, 'uncontestedShotPercentage', 4)
      },
      {
        title: 'Catch & Shoot %',
        icon: '',
        color: '',
        statKey: 'catchAndShootPercentage',
        format: 'percentage',
        players: this.getTopPlayers(allPlayers, 'catchAndShootPercentage', 4)
      },
      {
        title: 'Pull-up Shot %',
        icon: '',
        color: '',
        statKey: 'pullUpShotPercentage',
        format: 'percentage',
        players: this.getTopPlayers(allPlayers, 'pullUpShotPercentage', 4)
      },
      {
        title: 'Shots Created for Others',
        icon: '',
        color: '',
        statKey: 'shotsCreatedForOthers',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'shotsCreatedForOthers', 4)
      },
      {
        title: 'Gravity Score',
        icon: '',
        color: '',
        statKey: 'gravityScore',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'gravityScore', 4)
      },
      {
        title: 'Off-Ball Screen Assists',
        icon: '',
        color: '',
        statKey: 'offBallScreenAssists',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'offBallScreenAssists', 4)
      },
      {
        title: 'Hockey Assists',
        icon: '',
        color: '',
        statKey: 'hockeyAssists',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'hockeyAssists', 4)
      },
      {
        title: '4th Quarter Performance',
        icon: '',
        color: '',
        statKey: 'fourthQuarterPerformance',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'fourthQuarterPerformance', 4)
      },
      {
        title: 'Clutch Time Stats',
        icon: '',
        color: '',
        statKey: 'clutchTimeStats',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'clutchTimeStats', 4)
      },
      {
        title: 'Game-Winning Shots Made',
        icon: '',
        color: '',
        statKey: 'gameWinningShotsMade',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'gameWinningShotsMade', 4)
      },
      {
        title: 'vs Top 10 Defenses',
        icon: '',
        color: '',
        statKey: 'vsTop10DefensesPerformance',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'vsTop10DefensesPerformance', 4)
      },
      {
        title: 'Back-to-Back Performance',
        icon: '',
        color: '',
        statKey: 'backToBackGamePerformance',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'backToBackGamePerformance', 4)
      },
      {
        title: 'Shot Quality Index',
        icon: '',
        color: '',
        statKey: 'shotQualityIndex',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'shotQualityIndex', 4)
      },
      {
        title: 'Rim Frequency %',
        icon: '',
        color: '',
        statKey: 'rimFrequencyPercentage',
        format: 'percentage',
        players: this.getTopPlayers(allPlayers, 'rimFrequencyPercentage', 4)
      },
      {
        title: 'Mid-Range Frequency %',
        icon: '',
        color: '',
        statKey: 'midRangeFrequencyPercentage',
        format: 'percentage',
        players: this.getTopPlayers(allPlayers, 'midRangeFrequencyPercentage', 4)
      },
      {
        title: 'Corner 3 %',
        icon: '',
        color: '',
        statKey: 'corner3Percentage',
        format: 'percentage',
        players: this.getTopPlayers(allPlayers, 'corner3Percentage', 4)
      },
      {
        title: 'Fast Break PPG',
        icon: '',
        color: '',
        statKey: 'fastBreakPointsPerGame',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'fastBreakPointsPerGame', 4)
      },
      {
        title: 'Offensive Points Added',
        icon: '',
        color: '',
        statKey: 'offensivePointsAdded',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'offensivePointsAdded', 4)
      }
    ];

    // Defense Categories
    this.defenseCategories = [
      {
        title: 'Opponent FG% When Guarded',
        icon: '',
        color: '',
        statKey: 'opponentFieldGoalPercentageWhenGuarded',
        format: 'percentage',
        players: this.getTopPlayersReverse(allPlayers, 'opponentFieldGoalPercentageWhenGuarded', 4)
      },
      {
        title: 'Deflections Per Game',
        icon: '',
        color: '',
        statKey: 'deflectionsPerGame',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'deflectionsPerGame', 4)
      },
      {
        title: 'Charges Drawn Per Game',
        icon: '',
        color: '',
        statKey: 'chargesDrawnPerGame',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'chargesDrawnPerGame', 4)
      },
      {
        title: 'Loose Balls Recovered',
        icon: '',
        color: '',
        statKey: 'looseBallsRecoveredPerGame',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'looseBallsRecoveredPerGame', 4)
      },
      {
        title: 'Defensive Win Shares',
        icon: '',
        color: '',
        statKey: 'defensiveWinShares',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'defensiveWinShares', 4)
      },
      {
        title: 'Rim Protection %',
        icon: '',
        color: '',
        statKey: 'rimProtectionPercentage',
        format: 'percentage',
        players: this.getTopPlayers(allPlayers, 'rimProtectionPercentage', 4)
      },
      {
        title: 'Help Defense Rotations',
        icon: '',
        color: '',
        statKey: 'helpDefenseRotations',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'helpDefenseRotations', 4)
      },
      {
        title: 'Contested Shots Per Game',
        icon: '',
        color: '',
        statKey: 'contestedShotsPerGame',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'contestedShotsPerGame', 4)
      },
      {
        title: 'Screen Assists Per Game',
        icon: '',
        color: '',
        statKey: 'screenAssistsPerGame',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'screenAssistsPerGame', 4)
      },
      {
        title: 'Miles Traveled Per Game',
        icon: '',
        color: '',
        statKey: 'milesTraveledPerGame',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'milesTraveledPerGame', 4)
      },
      {
        title: 'Diving for Loose Balls',
        icon: '',
        color: '',
        statKey: 'divingForLooseBalls',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'divingForLooseBalls', 4)
      },
      {
        title: 'Transition Defense Stops',
        icon: '',
        color: '',
        statKey: 'transitionDefenseStops',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'transitionDefenseStops', 4)
      },
      {
        title: 'Defensive Estimated +/-',
        icon: '',
        color: '',
        statKey: 'defensiveEstimatedPlusMinus',
        format: 'number',
        players: this.getTopPlayers(allPlayers, 'defensiveEstimatedPlusMinus', 4)
      }
    ];
  }

  private getTopPlayers(players: ExtendedPlayer[], statKey: keyof ExtendedPlayer, count: number): ExtendedPlayer[] {
    return [...players]
      .sort((a, b) => (b[statKey] as number) - (a[statKey] as number))
      .slice(0, count);
  }
  
  private getTopPlayersReverse(players: ExtendedPlayer[], statKey: keyof ExtendedPlayer, count: number): ExtendedPlayer[] {
    return [...players]
      .sort((a, b) => (a[statKey] as number) - (b[statKey] as number))
      .slice(0, count);
  }

  formatStat(value: any, format: 'number' | 'percentage'): string {
    if (typeof value !== 'number') return '0';
    
    if (format === 'percentage') {
      return (value * 100).toFixed(1) + '%';
    }
    
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  }

  viewMoreStats(statKey: keyof ExtendedPlayer) {
    this.router.navigate(['/stats', statKey]);
  }
}