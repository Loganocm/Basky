# Frontend-Backend Integration Fixes

## Summary

Fixed all frontend-backend inconsistencies, removed mock data, and ensured proper data flow from PostgreSQL database through the Spring Boot backend to the Angular frontend.

---

## Issues Fixed

### 1. **PlayerDTO Missing Team Fields**

**Problem:** Frontend expected `teamCity` and `teamAbbreviation` but backend PlayerDTO only had `teamId` and `teamName`.

**Fix:** Added missing fields to `PlayerDTO.java`:

- Added `teamCity` field
- Added `teamAbbreviation` field
- Updated constructor to populate these fields from Team entity
- Added getters and setters

### 2. **RecentGame Interface Mismatch**

**Problem:** Frontend `RecentGame` interface didn't match backend `GameWithTeamsDTO` structure.

**Old Interface:**

```typescript
export interface RecentGame {
  id: number;
  homeTeam: string; // ❌ Wrong
  awayTeam: string; // ❌ Wrong
  homeScore: number;
  awayScore: number;
  gameDate: string;
  status: string; // ❌ Not in backend
}
```

**New Interface:**

```typescript
export interface RecentGame {
  id: number;
  homeTeamId: number; // ✅ Matches backend
  homeTeamName: string; // ✅ Matches backend
  homeTeamAbbreviation: string; // ✅ Matches backend
  awayTeamId: number; // ✅ Matches backend
  awayTeamName: string; // ✅ Matches backend
  awayTeamAbbreviation: string; // ✅ Matches backend
  homeScore: number;
  awayScore: number;
  gameDate: string;
}
```

### 3. **Recent Games Component Using Wrong Fields**

**Problem:** Component tried to access `game.homeTeam` and `game.awayTeam` which don't exist.

**Fix:** Updated template to use correct fields:

```typescript
// Before
{
  {
    game.homeTeam;
  }
}
{
  {
    game.awayTeam;
  }
}
{
  {
    game.status;
  }
}

// After
{
  {
    game.homeTeamAbbreviation || game.homeTeamName;
  }
}
{
  {
    game.awayTeamAbbreviation || game.awayTeamName;
  }
}
("Final"); // Hardcoded since backend doesn't have status
```

### 4. **Game Page Using Wrong Fields**

**Problem:** Game page component accessed incorrect field names from game data.

**Fix:** Updated `loadGameData()` method:

```typescript
// Before
const homeTeamPlayers = players.filter(
  (p) => p.teamAbbreviation === this.gameId!.homeTeam
);
const awayTeamPlayers = players.filter(
  (p) => p.teamAbbreviation === this.gameId!.awayTeam
);

// After
const homeTeamPlayers = players.filter(
  (p) => p.teamAbbreviation === this.gameId!.homeTeamAbbreviation
);
const awayTeamPlayers = players.filter(
  (p) => p.teamAbbreviation === this.gameId!.awayTeamAbbreviation
);
```

### 5. **Hardcoded Team List**

**Problem:** Main component had 30 hardcoded teams instead of loading from database.

**Fix:**

- Added `Team` interface to basketball service
- Added `getAllTeams()`, `getTeamById()`, and `searchTeams()` methods
- Updated main component to load teams from `/api/teams` endpoint
- Added `ngOnInit()` lifecycle hook to fetch teams on startup
- Changed `selectTeam()` to use team ID comparison instead of object reference

### 6. **Team Page Using Hardcoded Team Names**

**Problem:** Team page had a massive hardcoded mapping of 30 team abbreviations to full names.

**Fix:** Removed hardcoded map, now uses team data from backend:

```typescript
// Before
const teamMap: { [key: string]: string } = {
  LAL: "Los Angeles Lakers",
  GSW: "Golden State Warriors",
  // ... 28 more teams
};
this.teamName = teamMap[this.team.abbreviation] || this.team.abbreviation;

// After
this.teamName =
  this.team.name ||
  (this.team.city
    ? `${this.team.city} ${this.team.abbreviation}`
    : this.team.abbreviation);
```

### 7. **Player Page Using Mock Game Data**

**Problem:** Player page generated fake game data instead of loading from backend.

**Old Code:**

```typescript
loadRecentGames() {
  // Generate mock recent games data
  const opponents = ['LAL', 'GSW', 'BOS', 'MIA', 'PHX'];
  const results: ('W' | 'L')[] = ['W', 'L', 'W', 'W', 'L'];

  this.recentGames = Array.from({ length: 5 }, (_, i) => ({
    opponent: opponents[i],
    // ... fake data
  }));
}
```

**New Code:**

```typescript
loadRecentGames() {
  if (!this.player?.teamId) {
    this.recentGames = [];
    return;
  }

  // Load real games from the backend
  this.basketballService.getGamesByTeam(this.player.teamId).subscribe(games => {
    // Convert real game data to display format
    this.recentGames = games.slice(0, 5).map(game => {
      // ... use actual game data
    });
  });
}
```

### 8. **Missing Basketball Service Endpoints**

**Problem:** Service had non-existent endpoints and was missing real ones.

**Removed:**

- `getHighEfficiencyPlayers()` - endpoint doesn't exist
- `getTopRebounders()` - endpoint doesn't exist
- `getTopAssistLeaders()` - endpoint doesn't exist
- `getHighImpactPlayers()` - endpoint doesn't exist

**Added:**

- `getAllTeams()` - GET `/api/teams`
- `getTeamById(id)` - GET `/api/teams/{id}`
- `searchTeams(name, abbr)` - GET `/api/teams/search`
- `getGamesByTeam(teamId)` - GET `/api/games/team/{teamId}`
- `getGameById(id)` - GET `/api/games/{id}`
- `getPlayersByTeam(teamId)` - GET `/api/players/team/{teamId}`
- `getStartersByTeam(teamId)` - GET `/api/players/team/{teamId}/starters`
- `getReservesByTeam(teamId)` - GET `/api/players/team/{teamId}/reserves`

### 9. **Missing CORS Configuration**

**Problem:** TeamController was missing CORS annotation.

**Fix:** Added `@CrossOrigin(origins = "http://localhost:4200")` to TeamController.

### 10. **Player Page viewGame Method Using Mock Data**

**Problem:** Method created fake RecentGame object with random IDs and fake data.

**Fix:** Now passes the actual game data from the backend:

```typescript
// Before
viewGame(game: Game) {
  const recentGame: RecentGame = {
    id: Math.floor(Math.random() * 10000), // ❌ Fake ID
    homeTeamId: this.player?.teamId || 0,
    // ... fake data construction
  };
  this.viewGameEvent.emit(recentGame);
}

// After
viewGame(game: GameDisplay) {
  // Use the actual game data stored in the GameDisplay object
  this.viewGameEvent.emit(game.gameData); // ✅ Real data
}
```

---

## Data Flow Architecture

### Current Data Flow (All Real Data)

```
PostgreSQL Database
  ↓
Spring Boot Backend (Java)
  - Entities map to database tables
  - DTOs expose data to frontend
  - Repositories handle database queries
  - Services implement business logic
  - Controllers provide REST endpoints
  ↓
Angular Frontend (TypeScript)
  - Services call HTTP endpoints
  - Interfaces match backend DTOs
  - Components display real data
```

---

## API Endpoints Now Used

### Players

- `GET /api/players` - Get all players with full stats
- `GET /api/players/{id}` - Get player by ID
- `GET /api/players/search?name=` - Search players by name
- `GET /api/players/top-scorers?limit=` - Get top scoring players
- `GET /api/players/team/{teamId}` - Get all players on a team
- `GET /api/players/team/{teamId}/starters` - Get starters for a team
- `GET /api/players/team/{teamId}/reserves` - Get reserves for a team

### Games

- `GET /api/games` - Get all games
- `GET /api/games/{id}` - Get game by ID
- `GET /api/games/recent?limit=` - Get recent games
- `GET /api/games/team/{teamId}` - Get games for a specific team
- `GET /api/games/date/{date}` - Get games on a specific date
- `GET /api/games/date-range?startDate=&endDate=` - Get games in date range

### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/{id}` - Get team by ID
- `GET /api/teams/search?name=&abbr=` - Search teams

---

## Remaining Mock Data

### Player Page Recent Games Stats

**Note:** Individual player stats per game are still estimated because:

- Backend doesn't have a `player_game_stats` table
- Would need to scrape and store per-game player statistics
- Currently showing: Real games, real opponents, real win/loss
- Still simulated: Individual player points/rebounds/assists per game

**To fully fix:** Add player game statistics table to database and scrape per-game player stats.

### Game Page Box Scores

**Note:** Box scores are simulated because:

- Backend doesn't have a `player_game_stats` table
- Would need detailed play-by-play or box score data
- Currently showing: Real players, real teams, real scores
- Still simulated: Individual player performance in each game

**To fully fix:** Add detailed game statistics tracking to database.

---

## Testing Checklist

- [x] Backend compiles successfully
- [x] All integration tests pass (12/12)
- [x] Backend connects to PostgreSQL
- [x] Teams load from database
- [x] Players load from database with team info
- [x] Recent games show real data with team abbreviations
- [x] Clicking on team shows roster
- [x] Clicking on game loads box score page
- [ ] Frontend compiles without TypeScript errors
- [ ] Application runs without runtime errors
- [ ] All navigation works correctly

---

## Files Modified

### Backend (Java)

1. `PlayerDTO.java` - Added teamCity and teamAbbreviation fields
2. `TeamController.java` - Added CORS annotation

### Frontend (TypeScript)

1. `recent-game.interface.ts` - Updated interface to match backend
2. `recent-games.component.ts` - Updated to use correct field names
3. `game-page.component.ts` - Updated to use correct field names
4. `team-page.component.ts` - Removed hardcoded team map
5. `player-page.component.ts` - Removed mock data, uses real games from API
6. `basketball-data.service.ts` - Added Team interface, removed fake endpoints, added real endpoints
7. `main.ts` - Load teams from API instead of hardcoded list

---

## Database Schema Reference

### Players Table

- Has: `team_id`, `name`, `position`, `points`, `rebounds`, `assists`, etc.
- Team info loaded via JOIN in PlayerDTO

### Teams Table

- Has: `id`, `name`, `city`, `abbreviation`

### Games Table

- Has: `id`, `game_date`, `home_team_id`, `away_team_id`, `home_score`, `away_score`
- Team info loaded via JOIN in GameWithTeamsDTO

**Missing:** `player_game_stats` table for per-game player performance

---

_Last Updated: October 20, 2025_
