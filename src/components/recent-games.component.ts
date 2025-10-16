import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketballDataService } from '../services/basketball-data.service';
import { RecentGame } from '../interfaces/recent-game.interface';

@Component({
  selector: 'app-recent-games',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recent-games-sidebar">
      <div class="sidebar-header">
        <h3>Recent Games</h3>
      </div>
      
      <div class="games-list">
        <div *ngFor="let game of recentGames" class="game-card" (click)="viewGame(game)">
          <div class="game-date">
            {{ formatDate(game.date) }}
          </div>
          
          <div class="game-matchup">
            <div class="team-row">
              <span class="team-name">{{ game.awayTeam }}</span>
              <span class="team-score">{{ game.awayScore }}</span>
            </div>
            <div class="team-row">
              <span class="team-name">{{ game.homeTeam }}</span>
              <span class="team-score" [class.winner]="game.homeScore > game.awayScore">{{ game.homeScore }}</span>
            </div>
          </div>
          
          <div class="game-status">
            {{ game.status }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recent-games-sidebar {
      width: 280px;
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      height: fit-content;
      position: sticky;
      top: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }

    .sidebar-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px 8px 0 0;
    }

    .sidebar-header h3 {
      margin: 0;
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
    }

    .games-list {
      padding: 0;
    }

    .game-card {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
    }

    .game-card:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .game-card:last-child {
      border-bottom: none;
    }

    .game-date {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .game-matchup {
      margin-bottom: 8px;
    }

    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .team-row:last-child {
      margin-bottom: 0;
    }

    .team-name {
      font-size: 13px;
      color: #e5e7eb;
      font-weight: 500;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 8px;
    }

    .team-score {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      min-width: 30px;
      text-align: right;
    }

    .team-score.winner {
      color: #ffffff;
      font-weight: 700;
    }

    .game-status {
      font-size: 11px;
      color: #9ca3af;
      text-transform: uppercase;
      font-weight: 500;
      letter-spacing: 0.05em;
    }

    @media (max-width: 1024px) {
      .recent-games-sidebar {
        width: 100%;
        margin-bottom: 20px;
        position: static;
      }
    }
  `]
})
export class RecentGamesComponent implements OnInit {
  @Output() viewGameEvent = new EventEmitter<RecentGame>();
  
  recentGames: RecentGame[] = [];

  constructor(private basketballService: BasketballDataService) {}

  ngOnInit() {
    this.recentGames = this.basketballService.getRecentGames();
  }

  formatDate(date: Date): string {
    const today = new Date();
    const gameDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - gameDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else {
      return gameDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  viewGame(game: RecentGame) {
    this.viewGameEvent.emit(game);
  }
}