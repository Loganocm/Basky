import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BasketballDataService } from '../services/basketball-data.service';
import { Player } from '../models/player.model';

@Component({
  selector: 'app-stat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <!-- Search Bar -->
        <div class="search-container">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search players by name, team, or position..." 
            [(ngModel)]="searchQuery"
            (input)="filterPlayers()"
          />
          <span class="player-count">{{ filteredPlayers.length }} of {{ allPlayers.length }} players</span>
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
              <tr *ngFor="let player of filteredPlayers; let i = index" class="player-row" (click)="viewPlayer(player.name)">
                <td class="rank-cell">
                  <div class="rank-badge" [class]="getRankClass(player.originalRank)">{{ player.originalRank + 1 }}</div>
                </td>
                <td class="player-cell">
                  <div class="player-name">{{ player.name }}</div>
                </td>
                <td class="team-cell">{{ player.teamAbbreviation }}</td>
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
          <div *ngFor="let player of filteredPlayers; let i = index" class="mobile-player-card" (click)="viewPlayer(player.name)">
            <div class="mobile-player-header">
              <div class="rank-badge" [class]="getRankClass(player.originalRank)">{{ player.originalRank + 1 }}</div>
              <div class="mobile-player-info">
                <div class="player-name">{{ player.name }}</div>
                <div class="player-meta">{{ player.teamAbbreviation }} • {{ player.position }}</div>
              </div>
              <div class="stat-value">{{ formatStatValue(player[statKey]) }}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .stat-detail-container {
      min-height: 100vh;
      background: #0a0a0a;
    }

    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      border-bottom: 1px solid #2a2a2a;
      padding: 20px 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
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
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #e5e7eb;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
      color: #ffffff;
    }

    .header-title h1 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .header-subtitle {
      color: #9ca3af;
      font-size: 16px;
      margin: 4px 0 0 0;
    }

    .main-content {
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3),
                  0 2px 4px -1px rgba(0, 0, 0, 0.2),
                  0 0 0 1px rgba(255, 255, 255, 0.05);
      overflow: hidden;
      margin: 0px 0;
      padding: 0;
    }

    .search-container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
      position: relative;
    }

    .search-icon {
      width: 20px;
      height: 20px;
      color: #9ca3af;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 10px 16px;
      color: #ffffff;
      font-size: 14px;
      transition: all 0.2s;
    }

    .search-input::placeholder {
      color: #6b7280;
    }

    .search-input:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .player-count {
      font-size: 13px;
      color: #9ca3af;
      font-weight: 500;
      white-space: nowrap;
    }

    .table-container {
      width: 100%;
    }

    .category-icon {
      position: absolute;
      top: 20px;
      left: 20px;
      width: 48px;
      height: 48px;
      z-index: 10;
      opacity: 0.9;
      transition: all 0.3s ease;
    }

    .category-icon:hover {
      opacity: 1;
      transform: scale(1.05);
    }

    .table-container {
      overflow-x: auto;
    }

    .players-table {
      width: 100%;
      border-collapse: collapse;
    }

    .players-table th {
      background: rgba(255, 255, 255, 0.05);
      padding: 16px 24px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .players-table td {
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .player-row:hover {
      background: rgba(255, 255, 255, 0.05);
      cursor: pointer;
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
      color: #ffffff;
    }

    .team-cell {
      font-size: 14px;
      color: #d1d5db;
    }

    .position-badge {
      display: inline-block;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.1);
      color: #e5e7eb;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
    }

    .mobile-view {
      display: none;
    }

    .desktop-view {
      display: block;
    }

    .mobile-player-card {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
      color: #9ca3af;
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
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
  @Input() statKey: keyof Player = 'points';
  @Input() initialSearchQuery: string = '';
  @Output() back = new EventEmitter<void>();
  @Output() viewPlayerEvent = new EventEmitter<string>();
  @Output() searchQueryChange = new EventEmitter<string>();
  
  allPlayers: (Player & { originalRank: number })[] = [];
  filteredPlayers: (Player & { originalRank: number })[] = [];
  searchQuery: string = '';
  statFormat: 'number' | 'percentage' = 'number';

  constructor(
    private basketballService: BasketballDataService
  ) {}

  ngOnInit() {
    this.statFormat = this.getStatFormat(this.statKey);
    this.searchQuery = this.initialSearchQuery;
    this.loadPlayers();
  }

  loadPlayers() {
    this.basketballService.getAllPlayers().subscribe(players => {
      this.allPlayers = [...players]
        .sort((a, b) => {
          const aValue = a[this.statKey] as number;
          const bValue = b[this.statKey] as number;
          return bValue - aValue;
        })
        .map((player, index) => ({
          ...player,
          originalRank: index
        }));
      this.filterPlayers();
    });
  }

  filterPlayers() {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      this.filteredPlayers = [...this.allPlayers];
    } else {
      this.filteredPlayers = this.allPlayers.filter(player => 
        player.name.toLowerCase().includes(query) ||
        player.teamAbbreviation.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query)
      );
    }
    
    // Emit the search query change
    this.searchQueryChange.emit(this.searchQuery);
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

  getStatFormat(statKey: keyof Player): 'number' | 'percentage' {
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

  getStatCategory(): 'general' | 'offense' | 'defense' {
    const offenseStats = [
      'contestedShotPercentage',
      'uncontestedShotPercentage',
      'catchAndShootPercentage',
      'pullUpShotPercentage',
      'shotsCreatedForOthers',
      'gravityScore',
      'offBallScreenAssists',
      'hockeyAssists',
      'fourthQuarterPerformance',
      'clutchTimeStats',
      'gameWinningShotsMade',
      'vsTop10DefensesPerformance',
      'backToBackGamePerformance',
      'shotQualityIndex',
      'rimFrequencyPercentage',
      'midRangeFrequencyPercentage',
      'corner3Percentage',
      'fastBreakPointsPerGame',
      'offensivePointsAdded'
    ];

    const defenseStats = [
      'opponentFieldGoalPercentageWhenGuarded',
      'deflectionsPerGame',
      'chargesDrawnPerGame',
      'looseBallsRecoveredPerGame',
      'defensiveWinShares',
      'rimProtectionPercentage',
      'helpDefenseRotations',
      'contestedShotsPerGame',
      'screenAssistsPerGame',
      'milesTraveledPerGame',
      'divingForLooseBalls',
      'transitionDefenseStops',
      'defensiveEstimatedPlusMinus'
    ];

    if (offenseStats.includes(this.statKey as string)) {
      return 'offense';
    } else if (defenseStats.includes(this.statKey as string)) {
      return 'defense';
    } else {
      return 'general';
    }
  }

  goBack() {
    this.back.emit();
  }

  viewPlayer(playerName: string) {
    this.viewPlayerEvent.emit(playerName);
  }
}