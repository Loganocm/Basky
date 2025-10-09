import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TeamStats {
  name: string;
  record: string;
  wins: number;
  losses: number;
  winPercentage: number;
  pointsPerGame: number;
  pointsAgainst: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  offensiveRating: number;
  defensiveRating: number;
  netRating: number;
  pace: number;
  effectiveFieldGoalPercentage: number;
  turnoverRate: number;
  reboundRate: number;
}

@Component({
  selector: 'app-team-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-6 hover:shadow-glow transition-all duration-300">
      <!-- Team Header -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
        <div>
          <h2 class="text-2xl font-bold text-white mb-1">{{ team.name }}</h2>
          <div class="flex items-center gap-3">
            <span class="text-3xl font-black text-orange-400">{{ team.record }}</span>
            <span class="text-gray-400">({{ (team.winPercentage * 100).toFixed(1) }}%)</span>
          </div>
        </div>
        <div class="text-right">
          <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-2">
            <span class="text-white font-bold text-lg">{{ team.wins }}</span>
          </div>
          <span class="text-xs text-gray-400 font-medium">WINS</span>
        </div>
      </div>

      <!-- Stats Categories -->
      <div class="space-y-6">
        <!-- Offensive Stats -->
        <div class="bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-xl border-l-4 border-orange-500">
          <h3 class="text-sm font-semibold text-orange-300 mb-3 uppercase tracking-wider">Offensive Performance</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ team.pointsPerGame }}</div>
              <div class="text-xs text-gray-400 font-medium">PPG</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ team.assistsPerGame }}</div>
              <div class="text-xs text-gray-400 font-medium">APG</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ (team.fieldGoalPercentage * 100).toFixed(1) }}%</div>
              <div class="text-xs text-gray-400 font-medium">FG%</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ (team.threePointPercentage * 100).toFixed(1) }}%</div>
              <div class="text-xs text-gray-400 font-medium">3P%</div>
            </div>
          </div>
        </div>

        <!-- Defensive Stats -->
        <div class="bg-gradient-to-r from-blue-500/10 to-transparent p-4 rounded-xl border-l-4 border-blue-500">
          <h3 class="text-sm font-semibold text-blue-300 mb-3 uppercase tracking-wider">Defensive Performance</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ team.pointsAgainst }}</div>
              <div class="text-xs text-gray-400 font-medium">OPP PPG</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ team.reboundsPerGame }}</div>
              <div class="text-xs text-gray-400 font-medium">RPG</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ (team.reboundRate * 100).toFixed(1) }}%</div>
              <div class="text-xs text-gray-400 font-medium">REB%</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ (team.turnoverRate * 100).toFixed(1) }}%</div>
              <div class="text-xs text-gray-400 font-medium">TOV%</div>
            </div>
          </div>
        </div>

        <!-- Advanced Metrics -->
        <div class="bg-gradient-to-r from-green-500/10 to-transparent p-4 rounded-xl border-l-4 border-green-500">
          <h3 class="text-sm font-semibold text-green-300 mb-3 uppercase tracking-wider">Advanced Analytics</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="text-center p-3 rounded-lg transition-colors"
                 [class]="team.netRating > 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'">
              <div class="text-2xl font-bold mb-1"
                   [class]="team.netRating > 0 ? 'text-green-400' : 'text-red-400'">
                {{ team.netRating > 0 ? '+' : '' }}{{ team.netRating }}
              </div>
              <div class="text-xs text-gray-400 font-medium">Net RTG</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ team.offensiveRating }}</div>
              <div class="text-xs text-gray-400 font-medium">OFF RTG</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ team.defensiveRating }}</div>
              <div class="text-xs text-gray-400 font-medium">DEF RTG</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white mb-1">{{ team.pace }}</div>
              <div class="text-xs text-gray-400 font-medium">PACE</div>
            </div>
          </div>
        </div>
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
export class TeamOverviewComponent {
  @Input() team!: TeamStats;
}