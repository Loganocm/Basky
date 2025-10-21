import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CategoryLeaderboardsComponent } from './components/category-leaderboards.component';
import { RecentGamesComponent } from './components/recent-games.component';
import { StatDetailComponent } from './components/stat-detail.component';
import { TeamPageComponent } from './components/team-page.component';
import { PlayerPageComponent } from './components/player-page.component';
import { GamePageComponent } from './components/game-page.component';
import { BasketballDataService, Player, Team } from './services/basketball-data.service';
import { provideHttpClient } from '@angular/common/http';
import './global_styles.css';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryLeaderboardsComponent, RecentGamesComponent, TeamPageComponent, StatDetailComponent, PlayerPageComponent, GamePageComponent],
  template: `
    <div class="app-container">
      <header class="header">
        <div class="container">
          <div class="header-content">
            <div class="header-title">
              <h1>Basky</h1>
            </div>
            <p class="header-subtitle">
              Cool and quirky stats to write home about
            </p>
          </div>
        </div>
      </header>

      <!-- Player Search Bar -->
      <div class="search-bar-container">
        <div class="search-bar-wrapper">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search for players..."
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
            (focus)="showSearchResults = true"
            (blur)="onSearchBlur()">
          <button *ngIf="searchQuery" class="clear-button" (click)="clearSearch()">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Search Results Dropdown -->
        <div class="search-results" *ngIf="showSearchResults && searchQuery && filteredPlayers.length > 0">
          <div 
            *ngFor="let player of filteredPlayers.slice(0, 8)" 
            class="search-result-item"
            (mousedown)="selectSearchPlayer(player.name)">
            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-details">
                <span class="player-team">{{ player.teamAbbreviation }}</span>
                <span class="player-position">{{ player.position }}</span>
                <span class="player-number" *ngIf="player.jerseyNumber">#{{ player.jerseyNumber }}</span>
              </div>
            </div>
            <div class="player-stats">
              <span class="stat-item">{{ player.points.toFixed(1) }} PPG</span>
              <span class="stat-item">{{ player.rebounds.toFixed(1) }} RPG</span>
              <span class="stat-item">{{ player.assists.toFixed(1) }} APG</span>
            </div>
          </div>
        </div>
        
        <!-- No Results Message -->
        <div class="search-results no-results" *ngIf="showSearchResults && searchQuery && filteredPlayers.length === 0">
          <div class="no-results-message">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>No players found</p>
          </div>
        </div>
      </div>

      <main class="main-content" [style]="backgroundStyle">
        <div class="main-overlay"></div>
        
        <!-- Team Carousel Semicircle -->
        <div class="team-carousel">
          <div class="carousel-track"
               (wheel)="onCarouselWheel($event)"
               (touchstart)="onTouchStart($event)"
               (touchmove)="onTouchMove($event)"
               (touchend)="onTouchEnd()"
               [style.transform]="'translateY(' + carouselOffset + 'px)'">
            <div *ngFor="let team of teams; let i = index" 
                 class="team-item"
                 [class.active]="selectedTeam === team"
                 (click)="selectTeam(team)">
              <div class="team-logo">{{ team.abbreviation }}</div>
              <div class="team-name">{{ getTeamDisplayName(team) }}</div>
            </div>
          </div>
        </div>

        <div class="container main-layout">
          <div class="content-area">
            <!-- Show game page when game is selected (highest priority) -->
            <app-game-page *ngIf="selectedGame" [gameId]="selectedGame" (back)="clearGameSelection()" (viewPlayerEvent)="viewPlayer($event)"></app-game-page>
            <!-- Show player page when player is selected -->
            <app-player-page *ngIf="selectedPlayer && !selectedGame" [playerName]="selectedPlayer" (back)="clearPlayerSelection()" (viewGameEvent)="viewGame($event)"></app-player-page>
            <!-- Show team page when team is selected -->
            <app-team-page *ngIf="selectedTeam && !selectedPlayer && !selectedGame" [team]="selectedTeam" (back)="clearSelection()" (viewPlayerEvent)="viewPlayer($event)" (viewGameEvent)="viewGame($event)"></app-team-page>
            <!-- Show stat detail when stat is selected -->
            <app-stat-detail *ngIf="selectedStat && !selectedPlayer && !selectedGame" 
              [statKey]="selectedStat!" 
              [initialSearchQuery]="statSearchQuery"
              (back)="clearStatSelection()" 
              (viewPlayerEvent)="viewPlayer($event)"
              (searchQueryChange)="onStatSearchQueryChange($event)"></app-stat-detail>
            <!-- Show leaderboards when nothing is selected -->
            <app-category-leaderboards *ngIf="!selectedTeam && !selectedStat && !selectedPlayer && !selectedGame" (viewMoreStatsEvent)="viewStat($event)" (viewPlayerEvent)="viewPlayer($event)"></app-category-leaderboards>
          </div>
          <div class="sidebar-area" *ngIf="!selectedTeam && !selectedStat && !selectedPlayer && !selectedGame">
            <app-recent-games (viewGameEvent)="viewGame($event)"></app-recent-games>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .app-container {
      min-height: 100vh;
      background: #0a0a0a;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      width: 100%;
    }

    .team-carousel {
      position: fixed;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 80px;
      height: 600px;
      background: linear-gradient(90deg, #1a1a1a 0%, rgba(26, 26, 26, 0.95) 40%, transparent 100%);
      border-radius: 0 300px 300px 0;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
      z-index: 100;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .carousel-track {
      flex: 1;
      padding: 0;
      overflow: visible;
      transition: transform 0.3s ease-out;
      will-change: transform;
    }

    .carousel-track::-webkit-scrollbar {
      display: none;
    }

    .team-item {
      padding: 20px 12px 20px 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      user-select: none;
    }

    .team-item:first-child {
      border-top-right-radius: 300px;
    }

    .team-item:last-child {
      border-bottom-right-radius: 300px;
    }

    .team-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-left-color: rgba(255, 255, 255, 0.3);
    }

    .team-item.active {
      background: rgba(59, 130, 246, 0.15);
      border-left-color: #3b82f6;
    }

    .team-logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      border: 2px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      align-self: flex-start;
      margin-left: -10px;
    }

    .team-item:hover .team-logo {
      border-color: rgba(255, 255, 255, 0.4);
      transform: scale(1.1);
    }

    .team-item.active .team-logo {
      border-color: #3b82f6;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
    }

    .team-name {
      font-size: 10px;
      color: #9ca3af;
      text-align: center;
      font-weight: 500;
      line-height: 1.2;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      align-self: center;
      margin-left: -20px;
    }

    .team-item.active .team-name {
      color: #3b82f6;
      font-weight: 600;
    }

    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #2a2a2a;
      padding: 40px 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      flex-shrink: 0;
    }

    .header-content {
      text-align: center;
    }

    .header-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .header-title h1 {
      color: #ffffff;
      font-size: 64px;
      font-weight: 800;
      letter-spacing: -2px;
      font-family: 'Arial Black', 'Impact', sans-serif;
      text-transform: uppercase;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #ffd700 50%, #ff6b35 75%, #f7931e 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: basketballGradient 3s ease infinite;
      text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
    }

    @keyframes basketballGradient {
      0%, 100% {
        background-position: 0% center;
      }
      50% {
        background-position: 100% center;
      }
    }

    .header-subtitle {
      color: #9ca3af;
      font-size: 16px;
      margin: 0;
    }

    /* Search Bar Styles */
    .search-bar-container {
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 20px 0;
      position: relative;
      z-index: 1000;
    }

    .search-bar-wrapper {
      max-width: 600px;
      margin: 0 auto;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      width: 20px;
      height: 20px;
      color: #6b7280;
      pointer-events: none;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 14px 45px 14px 48px;
      background: rgba(26, 26, 26, 0.8);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
      transition: all 0.3s ease;
      outline: none;
    }

    .search-input::placeholder {
      color: #6b7280;
    }

    .search-input:focus {
      border-color: #3b82f6;
      background: rgba(26, 26, 26, 0.95);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .clear-button {
      position: absolute;
      right: 12px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      color: #9ca3af;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
    }

    .clear-button:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    .clear-button svg {
      width: 14px;
      height: 14px;
    }

    .search-results {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      max-height: 420px;
      overflow-y: auto;
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 
                  0 10px 10px -5px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    .search-result-item {
      padding: 16px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .search-result-item:last-child {
      border-bottom: none;
    }

    .search-result-item:hover {
      background: rgba(59, 130, 246, 0.1);
      border-left: 3px solid #3b82f6;
      padding-left: 17px;
    }

    .player-info {
      flex: 1;
      min-width: 0;
    }

    .player-name {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .player-details {
      display: flex;
      gap: 12px;
      align-items: center;
      font-size: 13px;
    }

    .player-team {
      color: #3b82f6;
      font-weight: 600;
    }

    .player-position {
      color: #9ca3af;
    }

    .player-number {
      color: #6b7280;
    }

    .player-stats {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .stat-item {
      font-size: 12px;
      color: #9ca3af;
      font-weight: 500;
      white-space: nowrap;
    }

    .no-results {
      padding: 40px 20px;
    }

    .no-results-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #6b7280;
    }

    .no-results-message svg {
      width: 48px;
      height: 48px;
      opacity: 0.5;
    }

    .no-results-message p {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .search-results::-webkit-scrollbar {
      width: 8px;
    }

    .search-results::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }

    .search-results::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .search-results::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    @media (max-width: 768px) {
      .search-bar-container {
        padding: 15px;
      }

      .search-bar-wrapper {
        max-width: 100%;
      }

      .search-results {
        width: calc(100% - 30px);
        left: 15px;
        transform: none;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .player-stats {
        display: none;
      }

      .search-result-item {
        padding: 12px 16px;
      }
    }

    .main-layout {
      display: flex;
      gap: 30px;
      align-items: flex-start;
      justify-content: center;
      position: relative;
      z-index: 1;
      padding: 40px 0;
      flex: 1;
    }

    .content-area {
      width: 1000px;
      max-width: 1000px;
      min-width: 1000px;
      flex: 0 0 1000px;
      height: fit-content;
      min-height: 600px;
      max-height: fit-content;
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 
                  0 10px 10px -5px rgba(0, 0, 0, 0.2),
                  0 0 0 1px rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
      overflow-y: auto;
    }

    .content-area:hover {
      box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.4), 
                  0 12px 15px -5px rgba(0, 0, 0, 0.3),
                  0 0 0 1px rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .sidebar-area {
      flex-shrink: 0;
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 
                  0 4px 6px -2px rgba(0, 0, 0, 0.2),
                  0 0 0 1px rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    .sidebar-area:hover {
      box-shadow: 0 15px 20px -3px rgba(0, 0, 0, 0.4), 
                  0 6px 8px -2px rgba(0, 0, 0, 0.3),
                  0 0 0 1px rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.15);
    }

    @media (max-width: 1650px) {
      .team-carousel {
        display: none;
      }
    }

    @media (max-width: 1400px) {
      .sidebar-area {
        display: none;
      }

      .content-area {
        width: 90%;
        max-width: 1000px;
        min-width: auto;
        flex: 1;
      }
    }

    @media (max-width: 768px) {
      .header {
        padding: 20px 0;
      }

      .header-title h1 {
        font-size: 48px;
        letter-spacing: -1px;
      }

      .header-subtitle {
        font-size: 14px;
        padding: 0 10px;
      }

      .header-content {
        padding: 0 15px;
      }

      .main-content {
        padding: 15px 0;
      }

      .main-layout {
        padding: 20px 15px;
        gap: 0;
      }

      .content-area {
        width: 100%;
        max-width: 100%;
        min-width: auto;
        padding: 20px;
        border-radius: 12px;
        margin: 0;
      }

      .content-area:hover {
        transform: none;
      }
    }

    @media (max-width: 480px) {
      .header-title h1 {
        font-size: 36px;
      }

      .header-subtitle {
        font-size: 12px;
      }

      .content-area {
        padding: 15px;
        border-radius: 8px;
      }

      .main-layout {
        padding: 15px 10px;
      }
    }

    /* Custom Scrollbar */
    .content-area::-webkit-scrollbar {
      width: 8px;
    }

    .content-area::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }

    .content-area::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .content-area::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .main-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(10, 10, 10, 0.7) 0%, rgba(0, 0, 0, 0.8) 100%);
      pointer-events: none;
      z-index: 0;
    }
  `]
})
export class HomeComponent implements OnInit {
  backgroundStyle: SafeStyle;
  selectedTeam: Team | null = null;
  selectedStat: keyof Player | null = null;
  selectedPlayer: string | null = null;
  selectedGame: any = null;
  carouselOffset: number = 0;
  currentIndex: number = 0;
  private touchStartY: number = 0;
  private touchStartOffset: number = 0;
  
  // Circular buffer for navigation history
  private navigationStack: Array<{
    type: 'stat' | 'team' | 'game' | 'player';
    selection: any;
    searchQuery?: string;
  } | null>;
  private stackHead: number = 0; // Points to the next insertion position
  private stackSize: number = 0; // Current number of items in stack
  private readonly MAX_NAVIGATION_HISTORY = 17;
  
  statSearchQuery: string = '';
  teams: Team[] = [];
  
  // Player search properties
  searchQuery: string = '';
  allPlayers: Player[] = [];
  filteredPlayers: Player[] = [];
  showSearchResults: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private basketballService: BasketballDataService
  ) {
    this.backgroundStyle = this.sanitizer.bypassSecurityTrustStyle(
      'background-image: url(assets/basketball-court.png); background-size: cover; background-position: center; background-repeat: no-repeat; position: relative; padding: 40px 0; flex: 1; display: flex; flex-direction: column;'
    );
    // Initialize circular buffer with fixed size
    this.navigationStack = new Array(this.MAX_NAVIGATION_HISTORY).fill(null);
  }

  ngOnInit() {
    // Load teams from backend
    this.basketballService.getAllTeams().subscribe(teams => {
      // Sort teams alphabetically by name, but put 76ers last for clean UI
      this.teams = teams.sort((a, b) => {
        // Check if either team is the 76ers
        const aIs76ers = a.name.includes('76ers');
        const bIs76ers = b.name.includes('76ers');
        
        // If a is 76ers, it goes after b
        if (aIs76ers && !bIs76ers) return 1;
        // If b is 76ers, it goes after a
        if (!aIs76ers && bIs76ers) return -1;
        // Otherwise, sort alphabetically
        return a.name.localeCompare(b.name);
      });
    });

    // Load all players for search
    this.basketballService.getAllPlayers().subscribe(players => {
      this.allPlayers = players;
    });
  }

  onSearchInput() {
    if (!this.searchQuery.trim()) {
      this.filteredPlayers = [];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredPlayers = this.allPlayers.filter(player => 
      player.name.toLowerCase().includes(query) ||
      player.teamName.toLowerCase().includes(query) ||
      player.teamAbbreviation.toLowerCase().includes(query)
    ).sort((a, b) => {
      // Sort by relevance: exact name matches first, then by points
      const aNameMatch = a.name.toLowerCase().startsWith(query);
      const bNameMatch = b.name.toLowerCase().startsWith(query);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // Then sort by points (best players first)
      return b.points - a.points;
    });
  }

  selectSearchPlayer(playerName: string) {
    this.searchQuery = '';
    this.filteredPlayers = [];
    this.showSearchResults = false;
    this.viewPlayer(playerName);
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredPlayers = [];
    this.showSearchResults = false;
  }

  onSearchBlur() {
    // Delay hiding results to allow click events to register
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  onCarouselWheel(event: WheelEvent) {
    event.preventDefault();
    // Prevent scrolling past the boundaries
    const maxScroll = 0; // Can't scroll up past the top
    const minScroll = -2282; // Allow enough scrolling to see all 30 teams
    
    this.carouselOffset -= event.deltaY * 0.5;
    this.carouselOffset = Math.min(maxScroll, Math.max(minScroll, this.carouselOffset));
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
    this.touchStartOffset = this.carouselOffset;
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    const deltaY = event.touches[0].clientY - this.touchStartY;
    const maxScroll = 0;
    const minScroll = -2282;
    
    this.carouselOffset = this.touchStartOffset + deltaY;
    this.carouselOffset = Math.min(maxScroll, Math.max(minScroll, this.carouselOffset));
  }

  onTouchEnd() {
    this.touchStartY = 0;
  }

  selectTeam(team: Team) {
    // If clicking the same team, clear selection
    if (this.selectedTeam?.id === team.id) {
      this.selectedTeam = null;
    } else {
      // Select the team
      this.selectedTeam = team;
    }
  }

  getTeamDisplayName(team: Team): string {
    // Extract just the team name without the city
    // e.g., "Atlanta Hawks" -> "Hawks", "Los Angeles Lakers" -> "Lakers"
    if (team.city && team.name.startsWith(team.city)) {
      return team.name.substring(team.city.length).trim();
    }
    return team.name;
  }

  clearSelection() {
    this.selectedTeam = null;
  }

  viewStat(statKey: keyof Player) {
    this.selectedStat = statKey;
    this.statSearchQuery = ''; // Reset search when viewing new stat
  }

  clearStatSelection() {
    this.selectedStat = null;
    this.statSearchQuery = ''; // Reset search when leaving stat view
  }

  onStatSearchQueryChange(query: string) {
    this.statSearchQuery = query;
  }

  private pushToNavigationStack(type: 'stat' | 'team' | 'game' | 'player', selection: any, searchQuery?: string) {
    // Add item at current head position
    this.navigationStack[this.stackHead] = { type, selection, searchQuery };
    
    // Move head forward (circular)
    this.stackHead = (this.stackHead + 1) % this.MAX_NAVIGATION_HISTORY;
    
    // Update size (capped at max)
    if (this.stackSize < this.MAX_NAVIGATION_HISTORY) {
      this.stackSize++;
    }
  }

  private popFromNavigationStack() {
    if (this.stackSize === 0) {
      return null;
    }
    
    // Move head backward (circular)
    this.stackHead = (this.stackHead - 1 + this.MAX_NAVIGATION_HISTORY) % this.MAX_NAVIGATION_HISTORY;
    
    // Get the item
    const item = this.navigationStack[this.stackHead];
    
    // Clear the slot (helps with garbage collection)
    this.navigationStack[this.stackHead] = null;
    
    // Update size
    this.stackSize--;
    
    return item;
  }

  private clearNavigationStack() {
    this.navigationStack.fill(null);
    this.stackHead = 0;
    this.stackSize = 0;
  }

  viewPlayer(playerName: string) {
    // Push current view to stack before navigating
    if (this.selectedStat) {
      this.pushToNavigationStack('stat', this.selectedStat, this.statSearchQuery);
      this.selectedStat = null;
    } else if (this.selectedTeam) {
      this.pushToNavigationStack('team', this.selectedTeam);
      this.selectedTeam = null;
    } else if (this.selectedGame) {
      this.pushToNavigationStack('game', this.selectedGame);
      this.selectedGame = null;
    } else if (this.selectedPlayer) {
      this.pushToNavigationStack('player', this.selectedPlayer);
    }
    this.selectedPlayer = playerName;
  }

  clearPlayerSelection() {
    this.selectedPlayer = null;
    
    // Pop from navigation stack to restore previous view
    const previousNav = this.popFromNavigationStack();
    if (previousNav) {
      if (previousNav.type === 'game') {
        this.selectedGame = previousNav.selection;
      } else if (previousNav.type === 'stat') {
        this.selectedStat = previousNav.selection;
        this.statSearchQuery = previousNav.searchQuery || '';
      } else if (previousNav.type === 'team') {
        this.selectedTeam = previousNav.selection;
      } else if (previousNav.type === 'player') {
        this.selectedPlayer = previousNav.selection;
      }
    }
  }

  viewGame(game: any) {
    // Push current view to stack before navigating
    if (this.selectedPlayer) {
      this.pushToNavigationStack('player', this.selectedPlayer);
      this.selectedPlayer = null;
    } else if (this.selectedTeam) {
      this.pushToNavigationStack('team', this.selectedTeam);
      this.selectedTeam = null;
    } else if (this.selectedStat) {
      this.pushToNavigationStack('stat', this.selectedStat, this.statSearchQuery);
      this.selectedStat = null;
    }
    this.selectedGame = game;
  }

  clearGameSelection() {
    this.selectedGame = null;
    
    // Pop from navigation stack to restore previous view
    const previousNav = this.popFromNavigationStack();
    if (previousNav) {
      if (previousNav.type === 'player') {
        this.selectedPlayer = previousNav.selection;
      } else if (previousNav.type === 'stat') {
        this.selectedStat = previousNav.selection;
        this.statSearchQuery = previousNav.searchQuery || '';
      } else if (previousNav.type === 'team') {
        this.selectedTeam = previousNav.selection;
      } else if (previousNav.type === 'game') {
        this.selectedGame = previousNav.selection;
      }
    }
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}

const routes = [
  { path: '', component: HomeComponent },
  { path: 'stats/:statKey', component: StatDetailComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    BasketballDataService,
    provideRouter(routes),
    provideHttpClient()
  ]
}).catch(err => console.error(err));