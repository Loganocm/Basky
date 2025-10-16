import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketballDataService, ExtendedPlayer } from '../services/basketball-data.service';

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="team-page-content">
      <div class="team-page-header">
        <div class="team-header-content">
          <div class="team-logo-large">{{ team.abbreviation }}</div>
          <div class="team-info">
            <h1>{{ teamName }}</h1>
            <p class="team-subtitle">Team Roster & Statistics</p>
          </div>
        </div>
      </div>

      <div class="roster-section">
        <h2>Team Roster</h2>
        <div class="players-grid">
          <div *ngFor="let player of teamPlayers" class="player-card" (click)="viewPlayer(player.name)">
            <div class="player-card-header">
              <div class="player-number">#{{ player.id || '--' }}</div>
              <div class="player-position">{{ player.position || 'N/A' }}</div>
            </div>
            <div class="player-card-body">
              <h3 class="player-card-name">{{ player.name }}</h3>
              <div class="player-stats-grid">
                <div class="stat-item">
                  <span class="stat-label">PPG</span>
                  <span class="stat-value">{{ player.points.toFixed(1) || '--' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">RPG</span>
                  <span class="stat-value">{{ player.rebounds.toFixed(1) || '--' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">APG</span>
                  <span class="stat-value">{{ player.assists.toFixed(1) || '--' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="teamPlayers.length === 0" class="no-data">
          <p>No player data available for this team.</p>
        </div>
      </div>

      <!-- Back button in bottom left corner -->
      <button class="back-button" (click)="onBack()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Stats
      </button>
    </div>
  `,
  styles: [`
    .team-page-content {
      width: 100%;
      position: relative;
      min-height: 500px;
      padding-bottom: 80px;
    }

    .team-page-header {
      margin-bottom: 30px;
    }

    .back-button {
      position: fixed;
      bottom: 40px;
      left: 40px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #9ca3af;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      transform: translateX(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .team-header-content {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .team-logo-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      border: 3px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
    }

    .team-info h1 {
      font-size: 36px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, #ffffff 0%, #9ca3af 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .team-subtitle {
      color: #9ca3af;
      font-size: 16px;
      margin: 0;
    }

    .team-content {
      padding: 40px 0;
    }

    .roster-section h2 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid rgba(59, 130, 246, 0.3);
    }

    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .player-card {
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      cursor: pointer;
    }

    .player-card:hover {
      transform: translateY(-4px);
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    }

    .player-card-header {
      background: rgba(255, 255, 255, 0.05);
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .player-number {
      font-size: 18px;
      font-weight: 700;
      color: #3b82f6;
    }

    .player-position {
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      background: rgba(59, 130, 246, 0.1);
      padding: 4px 12px;
      border-radius: 12px;
    }

    .player-card-body {
      padding: 16px;
    }

    .player-card-name {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 16px 0;
    }

    .player-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-label {
      font-size: 11px;
      font-weight: 500;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }

    .no-data {
      text-align: center;
      padding: 60px 20px;
      color: #9ca3af;
    }

    .no-data p {
      font-size: 16px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    @media (max-width: 768px) {
      .team-header {
        padding: 20px 0;
      }

      .team-header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .team-logo-large {
        width: 60px;
        height: 60px;
        font-size: 18px;
      }

      .team-info h1 {
        font-size: 28px;
      }

      .roster-section h2 {
        font-size: 24px;
      }

      .players-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TeamPageComponent implements OnInit {
  @Input() team: any;
  @Output() back = new EventEmitter<void>();
  @Output() viewPlayerEvent = new EventEmitter<string>();
  
  teamName: string = '';
  teamPlayers: ExtendedPlayer[] = [];

  constructor(private basketballService: BasketballDataService) {}

  ngOnInit() {
    this.loadTeamData();
  }

  onBack() {
    this.back.emit();
  }

  loadTeamData() {
    // Get team name from abbreviation
    const teamMap: { [key: string]: string } = {
      'LAL': 'Los Angeles Lakers',
      'GSW': 'Golden State Warriors',
      'BOS': 'Boston Celtics',
      'MIA': 'Miami Heat',
      'MIL': 'Milwaukee Bucks',
      'PHX': 'Phoenix Suns',
      'BKN': 'Brooklyn Nets',
      'LAC': 'Los Angeles Clippers',
      'PHI': 'Philadelphia 76ers',
      'DEN': 'Denver Nuggets',
      'DAL': 'Dallas Mavericks',
      'MEM': 'Memphis Grizzlies',
      'ATL': 'Atlanta Hawks',
      'CLE': 'Cleveland Cavaliers',
      'CHI': 'Chicago Bulls',
      'NYK': 'New York Knicks',
      'TOR': 'Toronto Raptors',
      'MIN': 'Minnesota Timberwolves',
      'NOP': 'New Orleans Pelicans',
      'SAC': 'Sacramento Kings',
      'POR': 'Portland Trail Blazers',
      'UTA': 'Utah Jazz',
      'SAS': 'San Antonio Spurs',
      'OKC': 'Oklahoma City Thunder',
      'IND': 'Indiana Pacers',
      'WAS': 'Washington Wizards',
      'CHA': 'Charlotte Hornets',
      'ORL': 'Orlando Magic',
      'DET': 'Detroit Pistons',
      'HOU': 'Houston Rockets'
    };

    this.teamName = teamMap[this.team.abbreviation] || this.team.abbreviation;

    // Load team players from the basketball service
    const allPlayers = this.basketballService.getPlayers();
    this.teamPlayers = allPlayers.filter(p => p.team === this.team.abbreviation);
  }

  viewPlayer(playerName: string) {
    this.viewPlayerEvent.emit(playerName);
  }
}
