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
      <!-- Category Icon -->
      <div class="category-icon">
        <img [style.display]="activeTab === 'general' ? 'block' : 'none'" src="assets/general.svg" alt="General Stats" width="48" height="48">
        <img [style.display]="activeTab === 'offense' ? 'block' : 'none'" src="assets/offense.svg" alt="Offensive Stats" width="48" height="48">
        <img [style.display]="activeTab === 'defense' ? 'block' : 'none'" src="assets/defense.svg" alt="Defensive Stats" width="48" height="48">
      </div>
      
      <!-- Navigation Header -->
      <div class="navigation-header">
        <div class="tab-navigation">
          <button 
            *ngFor="let tab of tabs" 
            class="tab-button"
            [class.active]="activeTab === tab.key"
            (click)="setActiveTab(tab.key)">
            {{ tab.label }}
          </button>
        </div>
        <div class="arrow-controls">
          <button class="arrow-button" (click)="previousPage()" [disabled]="currentPage === 0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button class="arrow-button" (click)="nextPage()" [disabled]="currentPage >= totalPages - 1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 2x2 Grid of Categories -->
      <div class="leaderboards-grid">
        <div *ngFor="let category of getCurrentPageCategories()" class="category-card">
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
        </div>
        
        <!-- View More Button Inside Card -->
        <div class="view-more-container">
          <button class="view-more-button" (click)="viewMoreStats(category.statKey)">
            View More
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`
    .leaderboards-container {
      position: relative;
      min-height: 600px;
    }

    .category-icon {
      position: absolute;
      top: -10px;
      left: 0;
      width: 48px;
      height: 48px;
      z-index: 10;
      opacity: 0.9;
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }

    .category-icon img {
      display: block;
      width: 100%;
      height: 100%;
    }

    .category-icon:hover {
      opacity: 1;
      transform: scale(1.05);
    }

    .navigation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      gap: 20px;
      width: 100%;
    }

    .tab-navigation {
      display: flex;
      justify-content: center;
      gap: 8px;
      flex: 1;
    }

    .arrow-controls {
      display: flex;
      gap: 8px;
    }

    .arrow-button {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.05);
      color: #e5e7eb;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .arrow-button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
      color: #ffffff;
    }

    .arrow-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .tab-button {
      padding: 12px 24px;
      border: none;
      background: rgba(255, 255, 255, 0.05);
      color: #9ca3af;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tab-button:hover {
      color: #e5e7eb;
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .tab-button.active {
      color: white;
      background: #3b82f6;
      border-color: #3b82f6;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
    }

    .category-card {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      margin-bottom: 20px;
    }

    .leaderboards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      width: 100%;
      min-height: 400px;
    }

    @media (max-width: 768px) {
      .leaderboards-grid {
        grid-template-columns: 1fr;
      }
      
      .navigation-header {
        flex-direction: column;
      }
    }

    .category-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .category-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
    }

    .category-title {
      font-size: 14px;
      color: #ffffff;
    }
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .player-row:hover {
      background: rgba(255, 255, 255, 0.05);
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
      color: #e5e7eb;
      background: rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .player-info {
      flex: 1;
      min-width: 0;
    }

    .player-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-team {
      font-size: 12px;
      color: #9ca3af;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stat-value {
      font-size: 14px;
      font-weight: 700;
      color: #60a5fa;
      flex-shrink: 0;
    }

    .view-more-container {
      padding: 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
      display: flex;
      justify-content: stretch;
      transition: all 0.2s ease;
    }

    .view-more-container:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .view-more-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 20px;
      width: 100%;
      background: transparent;
      border: none;
      color: #9ca3af;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .view-more-button:hover {
      color: #60a5fa;
    }

    .view-more-button svg {
      width: 14px;
      height: 14px;
      transition: transform 0.2s;
    }

    .view-more-button:hover svg {
      transform: translateX(3px);
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
  currentPage: number = 0;
  itemsPerPage: number = 4;
  
  tabs = [
    { key: 'general' as const, label: 'General Stats' },
    { key: 'offense' as const, label: 'Offense' },
    { key: 'defense' as const, label: 'Defense' }
  ];

  constructor(
    private basketballService: BasketballDataService,
    private router: Router
  ) {}

  get totalPages(): number {
    const categories = this.getActiveCategories();
    return Math.ceil(categories.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  getCurrentPageCategories(): CategoryLeaderboard[] {
    const categories = this.getActiveCategories();
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return categories.slice(start, end);
  }

  ngOnInit() {
    this.loadCategories();
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

  setActiveTab(tab: 'offense' | 'defense' | 'general'): void {
    this.activeTab = tab;
    this.currentPage = 0; // Reset to first page when switching tabs
  }
}