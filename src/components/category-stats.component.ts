import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../services/basketball-data.service';

@Component({
  selector: 'app-category-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-stats-grid">
      <!-- Offensive Categories -->
      <div class="stat-category glass-card p-6">
        <h3 class="category-title text-orange-400 mb-4">
          <span class="category-icon">⚡</span>
          Offensive Production
        </h3>
        <div class="player-stats-list">
          <div *ngFor="let player of players" class="player-stat-row">
            <div class="player-name">{{ player.name }}</div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ player.points }}</span>
                <span class="stat-label">PPG</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ player.assists }}</span>
                <span class="stat-label">AST</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ player.usageRate }}%</span>
                <span class="stat-label">USG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Defensive Categories -->
      <div class="stat-category glass-card p-6">
        <h3 class="category-title text-blue-400 mb-4">
          <span class="category-icon">🛡️</span>
          Defensive Impact
        </h3>
        <div class="player-stats-list">
          <div *ngFor="let player of players" class="player-stat-row">
            <div class="player-name">{{ player.name }}</div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ player.rebounds }}</span>
                <span class="stat-label">REB</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ player.steals }}</span>
                <span class="stat-label">STL</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ player.blocks }}</span>
                <span class="stat-label">BLK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shooting Efficiency -->
      <div class="stat-category glass-card p-6">
        <h3 class="category-title text-green-400 mb-4">
          <span class="category-icon">🎯</span>
          Shooting Precision
        </h3>
        <div class="player-stats-list">
          <div *ngFor="let player of players" class="player-stat-row">
            <div class="player-name">{{ player.name }}</div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ (player.fieldGoalPercentage * 100).toFixed(1) }}%</span>
                <span class="stat-label">FG%</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ (player.threePointPercentage * 100).toFixed(1) }}%</span>
                <span class="stat-label">3P%</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ (player.trueShootingPercentage * 100).toFixed(1) }}%</span>
                <span class="stat-label">TS%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Metrics -->
      <div class="stat-category glass-card p-6">
        <h3 class="category-title text-purple-400 mb-4">
          <span class="category-icon">📊</span>
          Advanced Analytics
        </h3>
        <div class="player-stats-list">
          <div *ngFor="let player of players" class="player-stat-row">
            <div class="player-name">{{ player.name }}</div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ player.playerEfficiencyRating }}</span>
                <span class="stat-label">PER</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ player.plusMinus > 0 ? '+' : '' }}{{ player.plusMinus }}</span>
                <span class="stat-label">+/-</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ player.efficiencyRating }}</span>
                <span class="stat-label">EFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .stat-category {
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
    }

    .category-title {
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .category-icon {
      font-size: 1.5rem;
    }

    .player-stat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-secondary);
    }

    .player-stat-row:last-child {
      border-bottom: none;
    }

    .player-name {
      font-weight: 600;
      color: var(--text-primary);
      min-width: 140px;
      font-size: 0.875rem;
    }

    .stats-grid {
      display: flex;
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 50px;
    }

    .stat-value {
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .stat-label {
      font-size: 0.625rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .category-stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .player-stat-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .stats-grid {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class CategoryStatsComponent {
  @Input() players: Player[] = [];
}