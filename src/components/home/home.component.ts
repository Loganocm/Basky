import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CategoryLeaderboardsComponent } from '../category-leaderboards.component';
import { RecentGamesComponent } from '../recent-games.component';
import { StatDetailComponent } from '../stat-detail.component';
import { TeamPageComponent } from '../team-page.component';
import { PlayerPageComponent } from '../player-page.component';
import { GamePageComponent } from '../game-page.component';
import { BasketballDataService } from '../../services/basketball-data.service';
import { Player } from '../../models/player.model';
import { Team } from '../../models/team.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryLeaderboardsComponent, RecentGamesComponent, TeamPageComponent, StatDetailComponent, PlayerPageComponent, GamePageComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
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
  readonly SEARCH_RESULTS_LIMIT = 8;
  private readonly SEARCH_BLUR_DELAY_MS = 200;
  private readonly CAROUSEL_MAX_SCROLL = 0;
  private readonly CAROUSEL_MIN_SCROLL = -2282;
  
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
    }, this.SEARCH_BLUR_DELAY_MS);
  }

  onCarouselWheel(event: WheelEvent) {
    event.preventDefault();
    // Prevent scrolling past the boundaries
    
    this.carouselOffset -= event.deltaY * 0.5;
    this.carouselOffset = Math.min(this.CAROUSEL_MAX_SCROLL, Math.max(this.CAROUSEL_MIN_SCROLL, this.carouselOffset));
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
    this.touchStartOffset = this.carouselOffset;
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    const deltaY = event.touches[0].clientY - this.touchStartY;
    
    this.carouselOffset = this.touchStartOffset + deltaY;
    this.carouselOffset = Math.min(this.CAROUSEL_MAX_SCROLL, Math.max(this.CAROUSEL_MIN_SCROLL, this.carouselOffset));
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
