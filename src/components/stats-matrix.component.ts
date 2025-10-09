import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from './player-card.component';

@Component({
  selector: 'app-stats-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-matrix-container">
      <!-- Header with Categories -->
      <div class="matrix-header glass-card p-4 mb-6">
        <div class="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div class="col-span-2">Player</div>
          <div class="col-span-2 text-center text-orange-400">Offense</div>
          <div class="col-span-2 text-center text-blue-400">Defense</div>
          <div class="col-span-2 text-center text-green-400">Shooting</div>
          <div class="col-span-2 text-center text-purple-400">Efficiency</div>
          <div class="col-span-2 text-center text-yellow-400">Advanced</div>
        </div>
      </div>

      <!-- Player Stats Matrix -->
      <div class="space-y-2">
        <div *ngFor="let player of players; trackBy: trackByPlayerId" 
             class="matrix-row glass-card p-4 hover:shadow-glow transition-all duration-300">
          <div class="grid grid-cols-12 gap-2 items-center">
            
            <!-- Player Info -->
            <div class="col-span-2">
              <div class="font-bold text-white text-sm">{{ player.name }}</div>
              <div class="text-xs text-gray-400">{{ player.team }} • {{ player.position }}</div>
            </div>

            <!-- Offense Stats -->
            <div class="col-span-2 grid grid-cols-2 gap-1 text-center">
              <div class="stat-cell">
                <div class="stat-value text-orange-400">{{ player.points }}</div>
                <div class="stat-label">PPG</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-orange-400">{{ player.assists }}</div>
                <div class="stat-label">APG</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-orange-400">{{ player.usageRate }}%</div>
                <div class="stat-label">USG</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-orange-400">{{ player.minutesPerGame }}</div>
                <div class="stat-label">MIN</div>
              </div>
            </div>

            <!-- Defense Stats -->
            <div class="col-span-2 grid grid-cols-2 gap-1 text-center">
              <div class="stat-cell">
                <div class="stat-value text-blue-400">{{ player.rebounds }}</div>
                <div class="stat-label">RPG</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-blue-400">{{ player.steals }}</div>
                <div class="stat-label">STL</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-blue-400">{{ player.blocks }}</div>
                <div class="stat-label">BLK</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-blue-400">{{ player.gamesPlayed }}</div>
                <div class="stat-label">GP</div>
              </div>
            </div>

            <!-- Shooting Stats -->
            <div class="col-span-2 grid grid-cols-2 gap-1 text-center">
              <div class="stat-cell">
                <div class="stat-value text-green-400">{{ (player.fieldGoalPercentage * 100).toFixed(1) }}%</div>
                <div class="stat-label">FG%</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-green-400">{{ (player.threePointPercentage * 100).toFixed(1) }}%</div>
                <div class="stat-label">3P%</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-green-400">{{ (player.freeThrowPercentage * 100).toFixed(1) }}%</div>
                <div class="stat-label">FT%</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-green-400">{{ (player.effectiveFieldGoalPercentage * 100).toFixed(1) }}%</div>
                <div class="stat-label">eFG%</div>
              </div>
            </div>

            <!-- Efficiency Stats -->
            <div class="col-span-2 grid grid-cols-2 gap-1 text-center">
              <div class="stat-cell">
                <div class="stat-value text-purple-400">{{ player.playerEfficiencyRating }}</div>
                <div class="stat-label">PER</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-purple-400">{{ (player.trueShootingPercentage * 100).toFixed(1) }}%</div>
                <div class="stat-label">TS%</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-purple-400">{{ player.boxPlusMinus > 0 ? '+' : '' }}{{ player.boxPlusMinus }}</div>
                <div class="stat-label">BPM</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-purple-400">{{ player.winShares }}</div>
                <div class="stat-label">WS</div>
              </div>
            </div>

            <!-- Advanced Stats -->
            <div class="col-span-2 grid grid-cols-2 gap-1 text-center">
              <div class="stat-cell">
                <div class="stat-value text-yellow-400">{{ player.valueOverReplacement }}</div>
                <div class="stat-label">VORP</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-yellow-400">{{ (player.effectiveFieldGoalPercentage * 100).toFixed(0) }}</div>
                <div class="stat-label">eFG</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-yellow-400">{{ player.usageRate.toFixed(0) }}</div>
                <div class="stat-label">USG</div>
              </div>
              <div class="stat-cell">
                <div class="stat-value text-yellow-400">{{ (player.trueShootingPercentage * 100).toFixed(0) }}</div>
                <div class="stat-label">TS</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-matrix-container {
      max-width: 100%;
      overflow-x: auto;
    }

    .matrix-row {
      min-width: 1200px;
    }

    .stat-cell {
      padding: 2px;
    }

    .stat-value {
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.625rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    @media (max-width: 1400px) {
      .stats-matrix-container {
        padding: 0 1rem;
      }
    }

    @media (max-width: 768px) {
      .matrix-row {
        min-width: 800px;
      }
      
      .stat-value {
        font-size: 0.75rem;
      }
      
      .stat-label {
        font-size: 0.5rem;
      }
    }
  `]
})
export class StatsMatrixComponent {
  @Input() players: Player[] = [];

  trackByPlayerId(index: number, player: Player): number {
    return player.id;
  }
}