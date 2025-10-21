# Angular Frontend & Spring Boot Backend Integration Fixes

## Summary

Successfully fixed all TypeScript compilation errors and integrated the Angular frontend with the PostgreSQL database via Spring Boot backend.

## Changes Made

### 1. Fixed Test File Compilation Errors

**Problem:** The test file `basketball-data.service.spec.ts` was using Jasmine test framework functions (`describe`, `beforeEach`, `afterEach`, `it`, `expect`) but the type definitions were not installed.

**Solution:**

- Installed Jasmine type definitions: `@types/jasmine` and `jasmine-core`
- Updated `tsconfig.json` to include jasmine types:
  ```json
  "types": ["jasmine"]
  ```
- Updated `tsconfig.app.json` to exclude spec files from production build:
  ```json
  "exclude": ["src/**/*.spec.ts"]
  ```

### 2. Connected Frontend to Backend

**Problem:** The Angular service had an empty `baseUrl` which meant it was trying to fetch from the same origin as the frontend.

**Solution:**

- Updated `src/services/basketball-data.service.ts`:

  ```typescript
  // Changed from:
  private readonly baseUrl = '';

  // To:
  private readonly baseUrl = 'http://localhost:8080';
  ```

This connects to the Spring Boot backend which runs on port 8080 by default.

### 3. Backend API Endpoints

The Spring Boot backend already has the following REST endpoints configured:

#### Players API (`/api/players`)

- `GET /api/players` - Get all players
- `GET /api/players/{id}` - Get player by ID
- `GET /api/players/search?name={name}&team={team}` - Search players
- `POST /api/players` - Create new player
- `PUT /api/players/{id}` - Update player
- `DELETE /api/players/{id}` - Delete player

#### Teams API (`/api/teams`)

- `GET /api/teams` - Get all teams
- `GET /api/teams/{id}` - Get team by ID
- `GET /api/teams/search?name={name}&abbr={abbr}` - Search teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/{id}` - Update team
- `DELETE /api/teams/{id}` - Delete team

#### Games API (`/api/games`)

- `GET /api/games` - Get all games
- `GET /api/games/{id}` - Get game by ID
- `GET /api/games/search?date={date}&team={team}` - Search games
- `POST /api/games` - Create new game
- `PUT /api/games/{id}` - Update game
- `DELETE /api/games/{id}` - Delete game

### 4. Data Flow

The Angular service now properly:

1. **Fetches Players**: `refreshPlayers()` calls `GET http://localhost:8080/api/players`
   - Maps backend `{id, name, team, position}` to `ExtendedPlayer` with stats defaults
2. **Fetches Teams**: `refreshTeams()` calls `GET http://localhost:8080/api/teams`
   - Caches team data for UI components
3. **Fetches Games**: `refreshGames()` calls `GET http://localhost:8080/api/games`
   - Maps to `RecentGame` interface for display

### 5. Updated Test File

Updated `basketball-data.service.spec.ts` to:

- Expect full URLs with baseUrl (e.g., `http://localhost:8080/api/players`)
- Handle all three HTTP calls made during service construction (players, teams, games)
- Properly flush mock responses for each endpoint

## How to Run

### Start the Backend (Spring Boot)

```bash
cd baskyapp
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080` and connect to PostgreSQL database at `localhost:5432/nba_data`.

### Start the Frontend (Angular)

```bash
npm start
```

The frontend will start on `http://localhost:4200` and will automatically fetch data from the backend.

### Build for Production

```bash
npm run build
```

Output will be in `dist/demo/` directory.

## Database Configuration

The backend connects to PostgreSQL with these settings (from `application.properties`):

- **URL**: `jdbc:postgresql://localhost:5432/nba_data`
- **Username**: `postgres`
- **Password**: `1738`
- **JPA**: Hibernate with auto DDL update enabled

## CORS Configuration

All backend controllers are configured with `@CrossOrigin(origins = "*")` to allow requests from the Angular frontend running on a different port.

## Testing the Integration

1. Ensure PostgreSQL is running with the `nba_data` database
2. Start the Spring Boot backend
3. Start the Angular frontend
4. Open browser to `http://localhost:4200`
5. The app should load players, teams, and games from the backend

## Known Issues & Notes

- **Node.js Version Warning**: You're using Node.js v23.6.1 (odd-numbered, non-LTS). This is just a warning and doesn't affect functionality, but consider using Node.js v22 or v24 LTS for production.
- **Mock Data Fallback**: The service maintains mock data as fallback if backend requests fail
- **Stats Mapping**: Backend Player entity only has basic fields (id, name, team, position). Extended stats fields default to 0 until backend is enhanced to store them.

## Next Steps (Optional Enhancements)

1. **Add more player stats to backend**: Extend the Player entity to include stats like points, rebounds, assists, etc.
2. **Add loading states**: Show loading indicators while fetching data
3. **Error handling**: Display user-friendly error messages if backend is unavailable
4. **Add authentication**: Secure the API endpoints if needed
5. **Add pagination**: For large datasets, implement pagination on both frontend and backend
