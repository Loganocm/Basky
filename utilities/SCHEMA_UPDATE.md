# Database Schema Update Summary

## Changes Made

### 1. **Simplified to 3 Tables**

#### `teams` table

- `id` (BIGSERIAL PRIMARY KEY)
- `name` (VARCHAR 100)
- `city` (VARCHAR 100)
- `abbreviation` (VARCHAR 10)

#### `players` table

- `id` (BIGSERIAL PRIMARY KEY)
- `name` (VARCHAR 100)
- `position` (VARCHAR 50)
- `team_id` (BIGINT, FK to teams.id)
- **Basic Stats:**
  - `games_played` (INTEGER)
  - `minutes_per_game` (DOUBLE PRECISION)
  - `points` (DOUBLE PRECISION)
  - `rebounds` (DOUBLE PRECISION)
  - `assists` (DOUBLE PRECISION)
  - `steals` (DOUBLE PRECISION)
  - `blocks` (DOUBLE PRECISION)
  - `turnovers` (DOUBLE PRECISION)
  - `field_goal_percentage` (DOUBLE PRECISION)
  - `three_point_percentage` (DOUBLE PRECISION)
  - `free_throw_percentage` (DOUBLE PRECISION)

#### `games` table

- `id` (BIGSERIAL PRIMARY KEY)
- `game_date` (DATE)
- `home_team_id` (BIGINT, FK to teams.id)
- `away_team_id` (BIGINT, FK to teams.id)
- `home_score` (INTEGER)
- `away_score` (INTEGER)

### 2. **Removed Tables**

- All `player_*` tables (player_stats, player_advanced_stats, etc.)
- `team_rosters` table (players now have `team_id`)
- Any other fragmented tables

### 3. **Updated Java Entities**

#### Player.java

- Removed `firstName`, `lastName`, `team` (string)
- Added `teamId` (Long) as FK
- Added all basic stat fields

#### Game.java

- Changed from `homeTeamAbbr`, `awayTeamAbbr` (strings)
- To `homeTeamId`, `awayTeamId` (Longs) as FKs
- Simplified date field to just `gameDate`

#### Team.java

- No changes needed (already simple)

### 4. **Updated Controllers & Repositories**

#### PlayerController & PlayerRepository

- Search by `teamId` instead of `team` string
- Update endpoint handles all stat fields

#### GameController & GameRepository

- Search by `teamId` instead of abbreviation
- Query methods updated to use IDs

### 5. **Database Recreation**

Run the script to reset your database:

```bash
cd utilities
python recreate_database.py
```

Then start Spring Boot to auto-seed sample data:

```bash
cd baskyapp
.\mvnw.cmd spring-boot:run
```

## Migration Notes

- Spring Boot is now set to `spring.jpa.hibernate.ddl-auto=create-drop`
- This will automatically drop and recreate tables on startup
- DataSeeder will populate sample data with 8 teams, 7 players with stats, and 5 games
- **Change back to `update` after first run** to preserve data

## API Endpoints Updated

### Players

- `GET /api/players` - Returns players with `teamId` and stats
- `GET /api/players/search?teamId=1` - Search by team ID
- Player JSON now includes all stat fields

### Games

- `GET /api/games` - Returns games with `homeTeamId` and `awayTeamId`
- `GET /api/games/search?teamId=1` - Search by team ID
- Game JSON now uses IDs instead of abbreviations

### Teams

- No changes (already correct)
