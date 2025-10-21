import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketballDataService, Player } from '../services/basketball-data.service';

interface CategoryLeaderboard {
  title: string;
  icon: string;
  color: string;
  statKey: keyof Player;
  format: 'number' | 'percentage';
  players: Player[];
}

@Component({
  selector: 'app-category-leaderboards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboards-container">
      <div class="category-icon">
        <img [style.display]="activeTab === 'general' ? 'block' : 'none'" src="assets/general.svg" alt="General Stats" width="48" height="48">
        <img [style.display]="activeTab === 'offense' ? 'block' : 'none'" src="assets/offense.svg" alt="Offensive Stats" width="48" height="48">
        <img [style.display]="activeTab === 'defense' ? 'block' : 'none'" src="assets/defense.svg" alt="Defensive Stats" width="48" height="48">
      </div>
      
      <div class="navigation-header">
        <div class="tab-navigation">
          <button *ngFor="let tab of tabs" class="tab-button" [class.active]="activeTab === tab.key" (click)="setActiveTab(tab.key)">{{ tab.label }}</button>
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

      <div class="leaderboards-grid">
        <div *ngFor="let category of getCurrentPageCategories()" class="category-card">
          <div class="category-header"><h3 class="category-title">{{ category.title }}</h3></div>
          <div class="players-list">
            <div *ngFor="let player of category.players; let i = index" class="player-row" (click)="viewPlayer(player.name)">
              <div class="rank-badge" [ngClass]="getRankClass(i)">{{ i + 1 }}</div>
              <div class="player-info">
                <div class="player-name">{{ player.name }}</div>
                <div class="player-team">{{ player.teamAbbreviation }}</div>
              </div>
              <div class="stat-value">{{ formatStat(player[category.statKey], category.format) }}</div>
            </div>
          </div>
          <div class="view-more-container">
            <button class="view-more-button" (click)="viewMoreStats(category.statKey)">View More</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboards-container { position: relative; min-height: 600px; }
    .category-icon { position: absolute; top: -10px; left: 0; width: 48px; height: 48px; z-index: 10; opacity: 0.9; transition: all 0.3s ease; }
    .navigation-header { display: flex; justify-content: center; align-items: center; margin-bottom: 24px; padding: 0 60px; position: relative; }
    .tab-navigation { display: flex; gap: 8px; }
    .tab-button { padding: 10px 24px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #9ca3af; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .tab-button:hover { background: rgba(255, 255, 255, 0.08); color: #e5e7eb; }
    .tab-button.active { background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2)); border-color: rgba(59, 130, 246, 0.5); color: #ffffff; box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
    .arrow-controls { display: flex; gap: 8px; position: absolute; right: 60px; }
    .arrow-button { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #9ca3af; cursor: pointer; transition: all 0.2s; }
    .arrow-button:disabled { opacity: 0.3; cursor: not-allowed; }
    .leaderboards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; padding: 0 60px; }
    .category-card { background: linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(15, 15, 15, 0.9)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; transition: all 0.3s; }
    .category-header { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .category-title { font-size: 16px; font-weight: 600; color: #ffffff; margin: 0; }
    .players-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .player-row { display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .player-row:hover { background: rgba(255, 255, 255, 0.08); }
    .rank-badge { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 6px; color: #60a5fa; font-size: 13px; font-weight: 700; transition: all 0.2s; }
    .rank-badge.rank-gold { background: linear-gradient(135deg, #ffd700, #ffed4e); border-color: #ffd700; color: #000000; box-shadow: 0 0 12px rgba(255, 215, 0, 0.4); }
    .rank-badge.rank-silver { background: linear-gradient(135deg, #c0c0c0, #e8e8e8); border-color: #c0c0c0; color: #000000; box-shadow: 0 0 12px rgba(192, 192, 192, 0.4); }
    .rank-badge.rank-bronze { background: linear-gradient(135deg, #cd7f32, #e8a87c); border-color: #cd7f32; color: #000000; box-shadow: 0 0 12px rgba(205, 127, 50, 0.4); }
    .player-info { flex: 1; min-width: 0; }
    .player-name { font-size: 14px; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .player-team { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .stat-value { font-size: 15px; font-weight: 700; color: #60a5fa; white-space: nowrap; }
    .view-more-container { display: flex; justify-content: center; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
    .view-more-button { padding: 8px 16px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 6px; color: #60a5fa; font-size: 13px; font-weight: 500; cursor: pointer; }
  `]
})
export class CategoryLeaderboardsComponent implements OnInit, OnChanges {
  @Input() initialSearchQuery: string = '';
  @Output() viewPlayerEvent = new EventEmitter<string>();
  @Output() viewMoreStatsEvent = new EventEmitter<keyof Player>();

  tabs = [
    { key: 'general' as const, label: 'General' },
    { key: 'offense' as const, label: 'Offense' },
    { key: 'defense' as const, label: 'Defense' }
  ];
  
  activeTab: 'general' | 'offense' | 'defense' = 'general';
  currentPage = 0;
  itemsPerPage = 4;
  totalPages = 0;

  offenseCategories: CategoryLeaderboard[] = [];
  defenseCategories: CategoryLeaderboard[] = [];
  generalCategories: CategoryLeaderboard[] = [];

  constructor(private basketballService: BasketballDataService) {}

  ngOnInit() {
    this.loadCategories();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialSearchQuery']) {
      this.loadCategories();
    }
  }

  setActiveTab(tab: 'general' | 'offense' | 'defense') {
    this.activeTab = tab;
    this.currentPage = 0;
    this.updateTotalPages();
  }

  getCurrentCategories(): CategoryLeaderboard[] {
    switch (this.activeTab) {
      case 'offense': return this.offenseCategories;
      case 'defense': return this.defenseCategories;
      default: return this.generalCategories;
    }
  }

  private loadCategories() {
    this.basketballService.getAllPlayers().subscribe(allPlayers => {
      this.generalCategories = [
        { title: 'Points Per Game', icon: '', color: '', statKey: 'points', format: 'number', players: this.getTopPlayers(allPlayers, 'points', 4) },
        { title: 'Rebounds Per Game', icon: '', color: '', statKey: 'rebounds', format: 'number', players: this.getTopPlayers(allPlayers, 'rebounds', 4) },
        { title: 'Assists Per Game', icon: '', color: '', statKey: 'assists', format: 'number', players: this.getTopPlayers(allPlayers, 'assists', 4) },
        { title: 'Player Efficiency Rating', icon: '', color: '', statKey: 'playerEfficiencyRating', format: 'number', players: this.getTopPlayers(allPlayers, 'playerEfficiencyRating', 4) },
        { title: 'True Shooting %', icon: '', color: '', statKey: 'trueShootingPercentage', format: 'percentage', players: this.getTopPlayers(allPlayers, 'trueShootingPercentage', 4) },
        { title: 'Impact Score', icon: '', color: '', statKey: 'impactScore', format: 'number', players: this.getTopPlayers(allPlayers, 'impactScore', 4) },
        { title: 'Plus/Minus', icon: '', color: '', statKey: 'plusMinus', format: 'number', players: this.getTopPlayers(allPlayers, 'plusMinus', 4) },
        { title: 'Usage Rate', icon: '', color: '', statKey: 'usageRate', format: 'number', players: this.getTopPlayers(allPlayers, 'usageRate', 4) }
      ];
      this.offenseCategories = [
        { title: 'Field Goal %', icon: '', color: '', statKey: 'fieldGoalPercentage', format: 'percentage', players: this.getTopPlayers(allPlayers, 'fieldGoalPercentage', 4) },
        { title: 'Three Point %', icon: '', color: '', statKey: 'threePointPercentage', format: 'percentage', players: this.getTopPlayers(allPlayers, 'threePointPercentage', 4) },
        { title: 'Free Throw %', icon: '', color: '', statKey: 'freeThrowPercentage', format: 'percentage', players: this.getTopPlayers(allPlayers, 'freeThrowPercentage', 4) },
        { title: 'Effective FG %', icon: '', color: '', statKey: 'effectiveFieldGoalPercentage', format: 'percentage', players: this.getTopPlayers(allPlayers, 'effectiveFieldGoalPercentage', 4) },
        { title: 'Field Goals Made', icon: '', color: '', statKey: 'fieldGoalsMade', format: 'number', players: this.getTopPlayers(allPlayers, 'fieldGoalsMade', 4) },
        { title: 'Three Pointers Made', icon: '', color: '', statKey: 'threePointersMade', format: 'number', players: this.getTopPlayers(allPlayers, 'threePointersMade', 4) }
      ];
      this.defenseCategories = [
        { title: 'Steals Per Game', icon: '', color: '', statKey: 'steals', format: 'number', players: this.getTopPlayers(allPlayers, 'steals', 4) },
        { title: 'Blocks Per Game', icon: '', color: '', statKey: 'blocks', format: 'number', players: this.getTopPlayers(allPlayers, 'blocks', 4) },
        { title: 'Defensive Rebounds', icon: '', color: '', statKey: 'defensiveRebounds', format: 'number', players: this.getTopPlayers(allPlayers, 'defensiveRebounds', 4) },
        { title: 'Offensive Rebounds', icon: '', color: '', statKey: 'offensiveRebounds', format: 'number', players: this.getTopPlayers(allPlayers, 'offensiveRebounds', 4) }
      ];
      this.updateTotalPages();
    });
  }

  getCurrentPageCategories(): CategoryLeaderboard[] {
    const categories = this.getCurrentCategories();
    const start = this.currentPage * this.itemsPerPage;
    return categories.slice(start, start + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  previousPage() {
    if (this.currentPage > 0) this.currentPage--;
  }

  private updateTotalPages() {
    this.totalPages = Math.ceil(this.getCurrentCategories().length / this.itemsPerPage);
  }

  private getTopPlayers(players: Player[], statKey: keyof Player, count: number): Player[] {
    return [...players]
      .filter(p => typeof p[statKey] === 'number' && !isNaN(p[statKey] as number) && (p[statKey] as number) > 0)
      .sort((a, b) => (b[statKey] as number) - (a[statKey] as number))
      .slice(0, count);
  }

  private getTopPlayersReverse(players: Player[], statKey: keyof Player, count: number): Player[] {
    return [...players]
      .filter(p => typeof p[statKey] === 'number' && !isNaN(p[statKey] as number))
      .sort((a, b) => (a[statKey] as number) - (b[statKey] as number))
      .slice(0, count);
  }

  formatStat(value: any, format: 'number' | 'percentage'): string {
    if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) return '--';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (format === 'percentage') return (numValue * 100).toFixed(1) + '%';
    return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(1);
  }

  viewPlayer(playerName: string) {
    this.viewPlayerEvent.emit(playerName);
  }

  viewMoreStats(statKey: keyof Player) {
    this.viewMoreStatsEvent.emit(statKey);
  }

  getRankClass(index: number): string {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  }
}
