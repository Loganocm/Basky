import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtendedPlayer } from '../services/basketball-data.service';

export interface Player {
  id: number;
  name: string;
  team: string;
  position: string;
  gamesPlayed: number;
  minutesPerGame: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  trueShootingPercentage: number;
  effectiveFieldGoalPercentage: number;
  usageRate: number;
  playerEfficiencyRating: number;
  boxPlusMinus: number;
  winShares: number;
  valueOverReplacement: number;
}

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-6 hover:shadow-glow transition-all duration-300">
      <!-- Player Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-white mb-1">{{ player.name }}</h3>
          <div class="flex items-center gap-3 text-sm">
            <span class="text-orange-400 font-medium">{{ player.team }}</span>
            <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span class="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs font-medium">{{ player.position }}</span>
          </div>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-1">
            <span class="text-white font-bold text-sm">{{ player.gamesPlayed }}</span>
          </div>
          <span class="text-xs text-gray-400 font-medium">GP</span>
        </div>
      </div>
      
      <!-- Primary Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="text-center p-3 bg-gray-800/50 rounded-lg">
          <div class="text-2xl font-bold text-white mb-1">{{ player.points }}</div>
          <div class="text-xs text-gray-400 font-medium">PPG</div>
        </div>
        <div class="text-center p-3 bg-gray-800/50 rounded-lg">
          <div class="text-2xl font-bold text-white mb-1">{{ player.rebounds }}</div>
          <div class="text-xs text-gray-400 font-medium">RPG</div>
        </div>
        <div class="text-center p-3 bg-gray-800/50 rounded-lg">
          <div class="text-2xl font-bold text-white mb-1">{{ player.assists }}</div>
          <div class="text-xs text-gray-400 font-medium">APG</div>
        </div>
        <div class="text-center p-3 bg-gray-800/50 rounded-lg">
          <div class="text-2xl font-bold text-white mb-1">{{ player.minutesPerGame }}</div>
          <div class="text-xs text-gray-400 font-medium">MPG</div>
        </div>
      </div>

      <!-- Advanced Metrics -->
      <div class="mb-6">
        <h4 class="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Advanced Metrics</h4>
        <div class="grid grid-cols-3 gap-3">
          <div class="text-center p-3 rounded-lg transition-colors" 
               [class]="getPerformanceClass(player.playerEfficiencyRating, 15, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ player.playerEfficiencyRating }}</div>
            <div class="text-xs text-gray-400 font-medium">PER</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.trueShootingPercentage, 0.56, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ (player.trueShootingPercentage * 100).toFixed(1) }}%</div>
            <div class="text-xs text-gray-400 font-medium">TS%</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.usageRate, 20, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ player.usageRate }}%</div>
            <div class="text-xs text-gray-400 font-medium">USG%</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.boxPlusMinus, 0, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ player.boxPlusMinus > 0 ? '+' : '' }}{{ player.boxPlusMinus }}</div>
            <div class="text-xs text-gray-400 font-medium">BPM</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.winShares, 5, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ player.winShares }}</div>
            <div class="text-xs text-gray-400 font-medium">WS</div>
          </div>
          <div class="text-center p-3 rounded-lg transition-colors"
               [class]="getPerformanceClass(player.valueOverReplacement, 2, 'above')">
            <div class="text-lg font-bold text-white mb-1">{{ player.valueOverReplacement }}</div>
            <div class="text-xs text-gray-400 font-medium">VORP</div>
          </div>
        </div>
      </div>

      <!-- Shooting Efficiency -->
      <div>
        <h4 class="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Shooting Efficiency</h4>
        <div class="space-y-3">
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-gray-300 w-8">FG%</span>
            <div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500" 
                   [style.width.%]="player.fieldGoalPercentage * 100"></div>
            </div>
            <span class="text-sm font-bold text-white w-12 text-right">{{ (player.fieldGoalPercentage * 100).toFixed(1) }}%</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-gray-300 w-8">3P%</span>
            <div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" 
                   [style.width.%]="player.threePointPercentage * 100"></div>
            </div>
            <span class="text-sm font-bold text-white w-12 text-right">{{ (player.threePointPercentage * 100).toFixed(1) }}%</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-gray-300 w-8">FT%</span>
            <div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500" 
                   [style.width.%]="player.freeThrowPercentage * 100"></div>
            </div>
            <span class="text-sm font-bold text-white w-12 text-right">{{ (player.freeThrowPercentage * 100).toFixed(1) }}%</span>
          </div>
        </div>
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
  @Input() player!: ExtendedPlayer;

  getPerformanceClass(value: number, threshold: number, type: 'above' | 'below'): string {
    if (type === 'above') {
      return value > threshold ? 'performance-above' : 'performance-below';
    } else {
      return value < threshold ? 'performance-above' : 'performance-below';
    }
  }
}