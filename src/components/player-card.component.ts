import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../models/player.model';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-6 hover:shadow-glow transition-all duration-300">
      <!-- Player Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-white mb-1">{{ player.name }}</h3>
          <div class="flex items-center gap-3 text-sm">
            <span class="text-orange-400 font-medium">{{ player.teamAbbreviation }}</span>
            <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span class="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs font-medium">{{ player.position }}</span>
            <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span class="text-xs text-gray-400">{{ player.age }}y</span>
            <span class="text-xs text-gray-400">{{ player.height }}</span>
            <span class="text-xs text-gray-400">{{ player.weight }}lbs</span>
          </div>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-1">
            <span class="text-white font-bold text-sm">{{ player.gamesPlayed }}</span>
          </div>
          <span class="text-xs text-gray-400 font-medium">GP</span>
        </div>
      </div>

      <!-- Achievement Badges -->
      <div class="flex flex-wrap gap-2 mb-4" *ngIf="getBadges().length > 0">
        <span *ngFor="let badge of getBadges()" 
              [class]="'px-2 py-1 text-xs rounded-full font-semibold ' + badge.color">
          {{ badge.label }}
        </span>
      </div>
      
      <!-- Primary Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="text-center p-3 bg-gray-800/50 rounded-lg">
          <div class="text-2xl font-bold text-white mb-1">{{ formatStat(player.points) }}</div>
          <div class="text-xs text-gray-400 font-medium">PPG</div>
        </div>
        <div class="text-center p-3 bg-gray-800/50 rounded-lg">
          <div class="text-2xl font-bold text-white mb-1">{{ formatStat(player.rebounds) }}</div>
          <div class="text-xs text-gray-400 font-medium">RPG</div>
        </div>
        <div class="text-center p-3 bg-gray-800/50 rounded-lg">
          <div class="text-2xl font-bold text-white mb-1">{{ formatStat(player.assists) }}</div>
          <div class="text-xs text-gray-400 font-medium">APG</div>
        </div>
        <div class="text-center p-3 bg-gray-800/50 rounded-lg">
          <div class="text-2xl font-bold text-white mb-1">{{ formatStat(player.minutesPerGame) }}</div>
          <div class="text-xs text-gray-400 font-medium">MPG</div>
        </div>
      </div>

      <!-- Advanced Metrics -->
      <div class="mb-6">
        <h4 class="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Advanced Metrics</h4>
        <div class="grid grid-cols-3 gap-3">
          <div class="text-center p-3 rounded-lg transition-colors" 
               [class]="getPerformanceClass(player.playerEfficiencyRating, 15, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ formatStat(player.playerEfficiencyRating) }}</div>
            <div class="text-xs text-gray-400 font-medium">PER</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.trueShootingPercentage, 0.56, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ formatPercent(player.trueShootingPercentage) }}</div>
            <div class="text-xs text-gray-400 font-medium">TS%</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.impactScore, 20, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ formatStat(player.impactScore) }}</div>
            <div class="text-xs text-gray-400 font-medium">Impact</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.efficiencyRating, 15, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ formatStat(player.efficiencyRating) }}</div>
            <div class="text-xs text-gray-400 font-medium">EFF</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.assistToTurnoverRatio, 1.5, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ formatStat(player.assistToTurnoverRatio) }}</div>
            <div class="text-xs text-gray-400 font-medium">AST/TO</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.plusMinus, 0, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ player.plusMinus > 0 ? '+' : '' }}{{ formatStat(player.plusMinus) }}</div>
            <div class="text-xs text-gray-400 font-medium">+/-</div>
          </div>
        </div>
      </div>

      <!-- Shooting Stats -->
      <div class="mb-6">
        <h4 class="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Shooting</h4>
        <div class="grid grid-cols-3 gap-3 mb-3">
          <div class="text-center p-2 bg-gray-800/30 rounded">
            <div class="text-sm font-bold text-white">{{ formatStat(player.fieldGoalsMade) }}-{{ formatStat(player.fieldGoalsAttempted) }}</div>
            <div class="text-xs text-gray-400">FG</div>
          </div>
          <div class="text-center p-2 bg-gray-800/30 rounded">
            <div class="text-sm font-bold text-white">{{ formatStat(player.threePointersMade) }}-{{ formatStat(player.threePointersAttempted) }}</div>
            <div class="text-xs text-gray-400">3PT</div>
          </div>
          <div class="text-center p-2 bg-gray-800/30 rounded">
            <div class="text-sm font-bold text-white">{{ formatStat(player.freeThrowsMade) }}-{{ formatStat(player.freeThrowsAttempted) }}</div>
            <div class="text-xs text-gray-400">FT</div>
          </div>
        </div>
        <div class="space-y-3">
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-gray-300 w-8">FG%</span>
            <div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500" 
                   [style.width.%]="(player.fieldGoalPercentage || 0) * 100"></div>
            </div>
            <span class="text-sm font-bold text-white w-12 text-right">{{ formatPercent(player.fieldGoalPercentage) }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-gray-300 w-8">3P%</span>
            <div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" 
                   [style.width.%]="(player.threePointPercentage || 0) * 100"></div>
            </div>
            <span class="text-sm font-bold text-white w-12 text-right">{{ formatPercent(player.threePointPercentage) }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-gray-300 w-8">FT%</span>
            <div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500" 
                   [style.width.%]="(player.freeThrowPercentage || 0) * 100"></div>
            </div>
            <span class="text-sm font-bold text-white w-12 text-right">{{ formatPercent(player.freeThrowPercentage) }}</span>
          </div>
        </div>
      </div>

      <!-- Additional Stats Grid -->
      <div class="grid grid-cols-4 gap-2 text-center text-xs">
        <div class="p-2 bg-gray-800/30 rounded">
          <div class="font-bold text-white">{{ formatStat(player.steals) }}</div>
          <div class="text-gray-400">STL</div>
        </div>
        <div class="p-2 bg-gray-800/30 rounded">
          <div class="font-bold text-white">{{ formatStat(player.blocks) }}</div>
          <div class="text-gray-400">BLK</div>
        </div>
        <div class="p-2 bg-gray-800/30 rounded">
          <div class="font-bold text-white">{{ formatStat(player.turnovers) }}</div>
          <div class="text-gray-400">TO</div>
        </div>
        <div class="p-2 bg-gray-800/30 rounded">
          <div class="font-bold text-white">{{ formatStat(player.personalFouls) }}</div>
          <div class="text-gray-400">PF</div>
        </div>
        <div class="p-2 bg-gray-800/30 rounded">
          <div class="font-bold text-white">{{ formatStat(player.offensiveRebounds) }}</div>
          <div class="text-gray-400">OREB</div>
        </div>
        <div class="p-2 bg-gray-800/30 rounded">
          <div class="font-bold text-white">{{ formatStat(player.defensiveRebounds) }}</div>
          <div class="text-gray-400">DREB</div>
        </div>
        <div class="p-2 bg-gray-800/30 rounded">
          <div class="font-bold text-white">{{ player.doubleDoubles }}</div>
          <div class="text-gray-400">2x2</div>
        </div>
        <div class="p-2 bg-gray-800/30 rounded">
          <div class="font-bold text-white">{{ player.tripleDoubles }}</div>
          <div class="text-gray-400">3x3</div>
        </div>
      </div>

      <!-- Fantasy Points -->
      <div class="mt-4 pt-4 border-t border-gray-700 text-center" *ngIf="player.fantasyPoints">
        <div class="text-2xl font-bold text-orange-400">{{ formatStat(player.fantasyPoints) }}</div>
        <div class="text-xs text-gray-400 uppercase tracking-wider">Fantasy Points</div>
      </div>
    </div>
  `,
  styles: [`
    .performance-above {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    
    .performance-below {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    
    .performance-neutral {
      background: rgba(107, 114, 128, 0.1);
      border: 1px solid rgba(107, 114, 128, 0.3);
    }
  `]
})
export class PlayerCardComponent {
  @Input() player!: Player;

  getPerformanceClass(value: number | null | undefined, threshold: number, type: 'above' | 'below'): string {
    if (value === null || value === undefined) return 'performance-neutral';
    if (type === 'above') {
      return value > threshold ? 'performance-above' : 'performance-below';
    } else {
      return value < threshold ? 'performance-above' : 'performance-below';
    }
  }

  getBadges(): Array<{label: string; color: string}> {
    const badges: Array<{label: string; color: string}> = [];
    const p = this.player;

    // Elite Scorer (25+ PPG)
    if (p.points && p.points >= 25) {
      badges.push({ label: '🔥 Elite Scorer', color: 'bg-red-600/20 text-red-300 border border-red-500/30' });
    }

    // Iron Man (70+ GP)
    if (p.gamesPlayed && p.gamesPlayed >= 70) {
      badges.push({ label: '💪 Iron Man', color: 'bg-blue-600/20 text-blue-300 border border-blue-500/30' });
    }

    // Defensive Anchor (STL+BLK > 3)
    if (p.steals && p.blocks && (p.steals + p.blocks) >= 3) {
      badges.push({ label: '🛡️ Defensive Anchor', color: 'bg-purple-600/20 text-purple-300 border border-purple-500/30' });
    }

    // Playmaker (7+ APG)
    if (p.assists && p.assists >= 7) {
      badges.push({ label: '🎯 Playmaker', color: 'bg-green-600/20 text-green-300 border border-green-500/30' });
    }

    // Glass Cleaner (10+ RPG)
    if (p.rebounds && p.rebounds >= 10) {
      badges.push({ label: '📊 Glass Cleaner', color: 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30' });
    }

    // Efficient (TS% > 60%)
    if (p.trueShootingPercentage && p.trueShootingPercentage >= 0.60) {
      badges.push({ label: '✨ Efficient', color: 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' });
    }

    // Triple Double Machine (3+ triple doubles)
    if (p.tripleDoubles && p.tripleDoubles >= 3) {
      badges.push({ label: '🌟 Triple Double Machine', color: 'bg-orange-600/20 text-orange-300 border border-orange-500/30' });
    }

    // High Impact (Impact Score > 30)
    if (p.impactScore && p.impactScore >= 30) {
      badges.push({ label: '⚡ High Impact', color: 'bg-pink-600/20 text-pink-300 border border-pink-500/30' });
    }

    return badges;
  }

  formatStat(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return value.toFixed(1);
  }

  formatPercent(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return (value * 100).toFixed(1) + '%';
  }
}