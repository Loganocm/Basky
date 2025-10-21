# Quick Start Guide - Recreated Database

## What Changed

Your database has been restructured to use **only 3 simple tables**:

- **`teams`** - Team info (name, city, abbreviation)
- **`players`** - Player info with basic stats (points, rebounds, assists, etc.) and `team_id` FK
- **`games`** - Game info with `home_team_id` and `away_team_id` FKs

All the old `player_*` tables and `team_rosters` have been removed.

## Step-by-Step Setup

### Option 1: Let Spring Boot Handle Everything (Recommended)

1. **Your Spring Boot app is configured to auto-recreate the database**

   The `application.properties` is set to:

   ```properties
   spring.jpa.hibernate.ddl-auto=create-drop
   ```

2. **Just start the backend:**

   ```bash
   cd baskyapp
   .\mvnw.cmd clean spring-boot:run
   ```

3. **What happens automatically:**

   - ✅ Drops all existing tables
   - ✅ Creates 3 new tables (teams, players, games)
   - ✅ Seeds 8 teams
   - ✅ Seeds 7 players with full stats
   - ✅ Seeds 5 recent games

4. **After first successful run**, change `application.properties` back to:
   ```properties
   spring.jpa.hibernate.ddl-auto=update
   ```
   This prevents data loss on future restarts.

### Option 2: Manual Database Recreation (If you prefer)

1. **Run the Python script:**

   ```bash
   cd utilities
   python recreate_database.py
   ```

2. **Then start Spring Boot:**
   ```bash
   cd baskyapp
   .\mvnw.cmd spring-boot:run
   ```

## Verify the Setup

### Check the tables were created:

```bash
cd utilities
python check_all_schemas.py
```

You should see:

```
TEAMS TABLE:
  id: bigint
  name: character varying
  city: character varying
  abbreviation: character varying

PLAYERS TABLE:
  id: bigint
  name: character varying
  position: character varying
  team_id: bigint
  games_played: integer
  minutes_per_game: double precision
  points: double precision
  rebounds: double precision
  assists: double precision
  steals: double precision
  blocks: double precision
  turnovers: double precision
  field_goal_percentage: double precision
  three_point_percentage: double precision
  free_throw_percentage: double precision

GAMES TABLE:
  id: bigint
  game_date: date
  home_team_id: bigint
  away_team_id: bigint
  home_score: integer
  away_score: integer
```

### Test the API:

**Get all players:**

```bash
curl http://localhost:8080/api/players
```

**Get players on a specific team (e.g., Lakers = team_id 1):**

```bash
curl "http://localhost:8080/api/players/search?teamId=1"
```

**Get all teams:**

```bash
curl http://localhost:8080/api/teams
```

**Get all games:**

```bash
curl http://localhost:8080/api/games
```

## Sample Data Seeded

### Teams (8 teams)

1. Lakers (LAL)
2. Warriors (GSW)
3. Celtics (BOS)
4. Heat (MIA)
5. Nuggets (DEN)
6. Mavericks (DAL)
7. Suns (PHX)
8. Bucks (MIL)

### Players (7 players with full stats)

- LeBron James (Lakers) - 25.7 PPG, 7.3 RPG, 7.3 APG
- Anthony Davis (Lakers) - 24.7 PPG, 12.6 RPG
- Stephen Curry (Warriors) - 26.4 PPG, 4.5 RPG, 5.1 APG
- Jayson Tatum (Celtics) - 30.1 PPG, 8.8 RPG
- Nikola Jokic (Nuggets) - 26.4 PPG, 12.4 RPG, 9.0 APG
- Luka Doncic (Mavericks) - 28.4 PPG, 9.1 RPG, 8.7 APG
- Giannis Antetokounmpo (Bucks) - 31.1 PPG, 11.8 RPG

### Games (5 games)

- Recent games between these teams

## Frontend Integration

The Angular frontend is already configured to connect to:

```
http://localhost:8080/api/players
http://localhost:8080/api/teams
http://localhost:8080/api/games
```

Just start the frontend after the backend is running:

```bash
npm start
```

Open http://localhost:4200 and you should see the data!

## Adding More Data

### Via Python Scraper (Real NBA Data)

```bash
cd utilities
python nba_scrape_to_postgres.py
```

### Via API (Manual)

```bash
curl -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kevin Durant",
    "position": "SF",
    "teamId": 7,
    "gamesPlayed": 75,
    "minutesPerGame": 37.0,
    "points": 29.1,
    "rebounds": 6.7,
    "assists": 5.0,
    "steals": 0.9,
    "blocks": 1.1,
    "turnovers": 3.3,
    "fieldGoalPercentage": 0.561,
    "threePointPercentage": 0.413,
    "freeThrowPercentage": 0.885
  }'
```

## Troubleshooting

### "Tables already exist" error

- The Spring Boot app will handle this automatically with `create-drop`
- Or manually drop tables: run `recreate_database.py`

### "Foreign key constraint" errors

- Make sure teams are created before players
- Make sure team IDs exist when creating players
- The DataSeeder handles this order correctly

### No data showing in frontend

- Check backend is running: `curl http://localhost:8080/api/players`
- Check CORS is enabled (it is in the code)
- Check browser console for errors

## Next Steps

1. ✅ Database is recreated with 3 simple tables
2. ✅ Backend entities updated
3. ✅ Sample data seeded
4. ✅ API endpoints working
5. 🔄 Now start your frontend and test!

Remember to change `spring.jpa.hibernate.ddl-auto=update` after first successful run to preserve your data!
