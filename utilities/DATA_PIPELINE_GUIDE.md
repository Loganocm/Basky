# NBA Stats Data Pipeline Guide

## Architecture Overview

```
NBA API → Python Script → PostgreSQL Database → Spring Boot API → Angular Frontend
```

### Why This Approach?

✅ **Direct Python → Database** (Current Implementation)

- **Fast**: Direct database access, no HTTP overhead
- **Reliable**: No dependency on backend being running
- **Scalable**: Easy to schedule as cron jobs
- **Industry Standard**: Common pattern for data ingestion pipelines

❌ **Python → Spring Boot API** (Not Recommended for Bulk Operations)

- Slower due to HTTP overhead
- Requires backend to be running
- Not ideal for bulk inserts
- Better suited for individual record updates

---

## Single Source of Truth: `nba_scrape_to_postgres.py`

This is your **ONE AND ONLY** data scraper. It handles:

1. ✅ Team data (standings, info)
2. ✅ Player data (stats, positions, physical info)
3. ✅ Game data (scores, dates)
4. ✅ **Starter status** (integrated - analyzes boxscores)

### What Changed?

**Before:**

- Multiple scripts: `nba_scrape_to_postgres.py` + `update_starter_status.py`
- Manual two-step process

**Now:**

- Single script does everything
- Starter status automatically updated after player data loads
- Analyzes recent boxscores to determine starters (70%+ games started)

---

## How to Use

### Initial Database Setup

```bash
# 1. Create/recreate database schema
cd utilities
python recreate_database.py

# 2. Scrape ALL data (teams, players, games, starters)
python nba_scrape_to_postgres.py
```

### Daily Updates

```bash
# Just run the scraper - it updates everything
python nba_scrape_to_postgres.py
```

### Add Missing Column to Existing Database

```bash
# If you already have data and just need to add is_starter column
python add_is_starter_column.py
python nba_scrape_to_postgres.py  # Re-run to populate starter data
```

---

## Starter Status Logic

The scraper automatically:

1. Fetches recent 50 games from NBA API
2. Analyzes boxscore `START_POSITION` field for each player
   - **Non-empty** (F, C, G) = Started that game
   - **Empty** = Came off bench
3. Calculates percentage of games started
4. Marks as starter if:
   - Started **≥70%** of games
   - Played **≥3** games minimum

**Result:** ~150-160 starters identified (5 starters × 30 teams + rotation players)

---

## Data Flow

```mermaid
NBA API (Real-time Data)
    ↓
Python Scraper (nba_scrape_to_postgres.py)
    ↓
PostgreSQL Database (nba_stats_db)
    ↓
Spring Boot API (REST endpoints)
    ↓
Angular Frontend (UI)
```

### Database Schema Sync

**Python** and **Java/JPA** both define the schema:

- Python: SQL CREATE statements in `recreate_database.py`
- Java: JPA entities in `Player.java`, `Team.java`, `Game.java`

⚠️ **Keep them in sync!** When adding fields:

1. Update `recreate_database.py` (SQL)
2. Update JPA entity (Java)
3. Update DTO if needed (Java)
4. Update frontend interface (TypeScript)

---

## Best Practices

### ✅ DO

- Use `nba_scrape_to_postgres.py` for all data collection
- Run scraper when backend is NOT running (faster, independent)
- Use Spring Boot API for frontend data access
- Schedule scraper with cron for daily updates

### ❌ DON'T

- Don't create multiple scraper scripts
- Don't have Python call Spring Boot API for bulk operations
- Don't manually update database (use the scraper)
- Don't run scraper while doing heavy backend operations

---

## Troubleshooting

### All players show `is_starter = FALSE`

**Cause:** Scraper ran without starter status update, or data was reset

**Fix:**

```bash
python nba_scrape_to_postgres.py  # Re-run full scraper
```

### Schema mismatch errors

**Cause:** Database schema doesn't match JPA entities

**Fix:**

```bash
python recreate_database.py  # Reset database
python extend_player_schema.py  # Add extended fields
python nba_scrape_to_postgres.py  # Populate data
```

### NBA API rate limiting

**Cause:** Too many requests too fast

**Solution:** Already handled in scraper with `time.sleep()` delays

- 0.6 seconds between most calls
- 2 seconds every 10 games in starter analysis

---

## Future Enhancements

Consider adding to `nba_scrape_to_postgres.py`:

- Team roster changes tracking
- Injury status updates
- Advanced stats calculations
- Historical data backfilling

All in ONE centralized, rock-solid script! 🎯
