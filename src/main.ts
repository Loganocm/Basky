import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CategoryLeaderboardsComponent } from './components/category-leaderboards.component';
import { RecentGamesComponent } from './components/recent-games.component';
import { StatDetailComponent } from './components/stat-detail.component';
import { BasketballDataService } from './services/basketball-data.service';
import { provideHttpClient } from '@angular/common/http';
import './global_styles.css';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CategoryLeaderboardsComponent, RecentGamesComponent],
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
              <div class="team-name">{{ team.name }}</div>
            </div>
          </div>
        </div>

        <div class="container main-layout">
          <div class="content-area">
            <app-category-leaderboards></app-category-leaderboards>
          </div>
          <div class="sidebar-area">
            <app-recent-games></app-recent-games>
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
export class HomeComponent {
  backgroundStyle: SafeStyle;
  selectedTeam: any = null;
  carouselOffset: number = 0;
  currentIndex: number = 0;
  private touchStartY: number = 0;
  private touchStartOffset: number = 0;

  teams = [
    { name: 'Lakers', abbreviation: 'LAL' },
    { name: 'Warriors', abbreviation: 'GSW' },
    { name: 'Celtics', abbreviation: 'BOS' },
    { name: 'Heat', abbreviation: 'MIA' },
    { name: 'Bucks', abbreviation: 'MIL' },
    { name: 'Suns', abbreviation: 'PHX' },
    { name: 'Nets', abbreviation: 'BKN' },
    { name: 'Clippers', abbreviation: 'LAC' },
    { name: '76ers', abbreviation: 'PHI' },
    { name: 'Nuggets', abbreviation: 'DEN' },
    { name: 'Mavericks', abbreviation: 'DAL' },
    { name: 'Grizzlies', abbreviation: 'MEM' },
    { name: 'Hawks', abbreviation: 'ATL' },
    { name: 'Cavaliers', abbreviation: 'CLE' },
    { name: 'Bulls', abbreviation: 'CHI' },
    { name: 'Knicks', abbreviation: 'NYK' },
    { name: 'Raptors', abbreviation: 'TOR' },
    { name: 'Timberwolves', abbreviation: 'MIN' },
    { name: 'Pelicans', abbreviation: 'NOP' },
    { name: 'Kings', abbreviation: 'SAC' },
    { name: 'Trail Blazers', abbreviation: 'POR' },
    { name: 'Jazz', abbreviation: 'UTA' },
    { name: 'Spurs', abbreviation: 'SAS' },
    { name: 'Thunder', abbreviation: 'OKC' },
    { name: 'Pacers', abbreviation: 'IND' },
    { name: 'Wizards', abbreviation: 'WAS' },
    { name: 'Hornets', abbreviation: 'CHA' },
    { name: 'Magic', abbreviation: 'ORL' },
    { name: 'Pistons', abbreviation: 'DET' },
    { name: 'Rockets', abbreviation: 'HOU' }
  ];

  constructor(private sanitizer: DomSanitizer) {
    this.backgroundStyle = this.sanitizer.bypassSecurityTrustStyle(
      'background-image: url(assets/basketball-court.png); background-size: cover; background-position: center; background-repeat: no-repeat; position: relative; padding: 40px 0; flex: 1; display: flex; flex-direction: column;'
    );
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

  selectTeam(team: any) {
    this.selectedTeam = team;
    // Here you can add logic to filter stats by team
    console.log('Selected team:', team);
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