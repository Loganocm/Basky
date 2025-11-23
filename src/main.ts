import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { BasketballDataService } from './services/basketball-data.service';
import { HomeComponent } from './components/home/home.component';
import { StatDetailComponent } from './components/stat-detail.component';
import './global_styles.css';

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
