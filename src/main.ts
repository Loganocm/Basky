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
              <h1>NBA Player Statistics</h1>
            </div>
            <p class="header-subtitle">
              Statistical leaders across all categories
            </p>
          </div>
        </div>
      </header>

      <main class="main-content" [style]="backgroundStyle">
        <div class="main-overlay"></div>
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
    .app-container {
      min-height: 100vh;
      background: #0a0a0a;
      position: relative;
      display: flex;
      flex-direction: column;
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
      font-weight: 700;
      letter-spacing: -0.5px;
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
      position: relative;
      z-index: 1;
      padding: 40px 0;
      flex: 1;
    }

    .content-area {
      flex: 1;
      min-width: 0;
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

    @media (max-width: 768px) {
      .header {
        padding: 30px 0;
      }

      .header-content {
        padding: 0 20px;
      }

      .main-content {
        padding: 20px 0;
      }

      .main-layout {
        padding: 0;
      }

      .content-area {
        display: flex;
        justify-content: center;
      }

      .sidebar-area {
        display: none;
      }
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

  constructor(private sanitizer: DomSanitizer) {
    this.backgroundStyle = this.sanitizer.bypassSecurityTrustStyle(
      'background-image: url(assets/basketball-court.png); background-size: cover; background-position: center; background-repeat: no-repeat; position: relative; padding: 40px 0; flex: 1; display: flex; flex-direction: column;'
    );
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