import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card p-6 mb-8">
      <!-- Search Section -->
      <div class="mb-6">
        <div class="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search players or teams..."
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            class="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
          <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Position</label>
          <select [(ngModel)]="selectedPosition" (change)="onFilterChange()" 
                  class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
            <option value="">All Positions</option>
            <option value="PG">Point Guard</option>
            <option value="SG">Shooting Guard</option>
            <option value="SF">Small Forward</option>
            <option value="PF">Power Forward</option>
            <option value="C">Center</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Team</label>
          <select [(ngModel)]="selectedTeam" (change)="onFilterChange()" 
                  class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
            <option value="">All Teams</option>
            <option value="Los Angeles Lakers">Lakers</option>
            <option value="Golden State Warriors">Warriors</option>
            <option value="Boston Celtics">Celtics</option>
            <option value="Miami Heat">Heat</option>
            <option value="Milwaukee Bucks">Bucks</option>
            <option value="Phoenix Suns">Suns</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
          <select [(ngModel)]="sortBy" (change)="onSortChange()" 
                  class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
            <option value="name">Name</option>
            <option value="points">Points</option>
            <option value="playerEfficiencyRating">PER</option>
            <option value="trueShootingPercentage">TS%</option>
            <option value="winShares">Win Shares</option>
          </select>
        </div>
      </div>

      <!-- Active Filters -->
      <div class="flex flex-wrap items-center gap-3" *ngIf="hasActiveFilters()">
        <span class="text-sm text-gray-400 font-medium">Active filters:</span>
        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium" *ngIf="selectedPosition">
            {{ selectedPosition }}
            <button (click)="clearPositionFilter()" class="hover:bg-orange-500/30 rounded-full p-0.5 transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </span>
          <span class="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium" *ngIf="selectedTeam">
            {{ selectedTeam }}
            <button (click)="clearTeamFilter()" class="hover:bg-orange-500/30 rounded-full p-0.5 transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </span>
        </div>
        <button (click)="clearAllFilters()" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors">
          Clear All
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Component styles handled by Tailwind classes */
    :host {
      display: block;
    }
  `]
})
export class SearchFilterComponent {
  searchTerm: string = '';
  selectedPosition: string = '';
  selectedTeam: string = '';
  sortBy: string = 'name';

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<{position: string, team: string}>();
  @Output() sortChange = new EventEmitter<string>();

  onSearchChange() {
    this.searchChange.emit(this.searchTerm);
  }

  onFilterChange() {
    this.filterChange.emit({
      position: this.selectedPosition,
      team: this.selectedTeam
    });
  }

  onSortChange() {
    this.sortChange.emit(this.sortBy);
  }

  hasActiveFilters(): boolean {
    return this.selectedPosition !== '' || this.selectedTeam !== '';
  }

  clearPositionFilter() {
    this.selectedPosition = '';
    this.onFilterChange();
  }

  clearTeamFilter() {
    this.selectedTeam = '';
    this.onFilterChange();
  }

  clearAllFilters() {
    this.selectedPosition = '';
    this.selectedTeam = '';
    this.onFilterChange();
  }
}