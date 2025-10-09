import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryLeaderboardsComponent } from './components/category-leaderboards.component';
import { RecentGamesComponent } from './components/recent-games.component';
import { StatDetailComponent } from './components/stat-detail.component';
import { BasketballDataService } from './services/basketball-data.service';

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

      <main class="main-content">
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
      background: #f8f9fa;
    }

    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 40px 0;
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

    .header-subtitle {
      color: #6b7280;
      font-size: 16px;
      margin: 0;
    }

    .main-content {
      padding: 40px 0;
    }

    .main-layout {
      display: flex;
      gap: 30px;
      align-items: flex-start;
    }

    .content-area {
      flex: 1;
      min-width: 0;
    }

    .sidebar-area {
      flex-shrink: 0;
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
  `]
})
export class HomeComponent {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class App {}

const routes = [
  { path: '', component: HomeComponent },
  { path: 'stats/:statKey', component: StatDetailComponent }
];

bootstrapApplication(App, {
  providers: [
    BasketballDataService,
    provideRouter(routes)
  ]
});