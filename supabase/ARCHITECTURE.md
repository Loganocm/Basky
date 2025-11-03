# NBA Data Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          NBA Stats API                                  │
│                    (stats.nba.com/stats)                               │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ Rate Limited (1 req/sec)
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────┐                    ┌──────────────────┐
│  nba-data-sync   │                    │ nba-boxscores-   │
│  Edge Function   │                    │ batch Function   │
├──────────────────┤                    ├──────────────────┤
│ • Teams (30)     │                    │ • Box Scores     │
│ • Players (450+) │                    │ • 20 games/batch │
│ • Games (1,230)  │                    │ • Resumable      │
│                  │                    │ • 2-4 min/batch  │
│ Runtime: ~45s    │                    │ • Progress track │
│ Schedule: Daily  │                    │ Schedule: Hourly │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │                                       │
         └───────────────┬───────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Supabase        │
              │  PostgreSQL      │
              ├──────────────────┤
              │ ┌──────────────┐ │
              │ │   teams      │ │ ◄── 30 teams
              │ └──────────────┘ │
              │ ┌──────────────┐ │
              │ │  players     │ │ ◄── 450+ players
              │ └──────────────┘ │
              │ ┌──────────────┐ │
              │ │   games      │ │ ◄── 1,230 games
              │ │ + tracking   │ │     (box_score_synced)
              │ └──────────────┘ │
              │ ┌──────────────┐ │
              │ │  box_scores  │ │ ◄── 24,600+ entries
              │ └──────────────┘ │
              └────────┬─────────┘
                       │
                       │ REST API
                       │
                       ▼
              ┌──────────────────┐
              │  Your Frontend   │
              │   (Angular)      │
              └──────────────────┘
```

## Data Flow

### 1️⃣ Daily Sync (nba-data-sync)

```
NBA API ──┬──> Teams Data ────────┐
          ├──> Player Stats ──────┤
          └──> Season Games ──────┴──> Supabase DB

Runs: Daily at 6 AM UTC
Time: ~45 seconds
Updates: Teams, Players, Games tables
```

### 2️⃣ Box Score Processing (nba-boxscores-batch)

```
Supabase DB ──> Fetch 20 unprocessed games
                    │
                    ├──> Call NBA API (20 times)
                    │
                    ├──> Extract player stats
                    │
                    ├──> Insert box_scores
                    │
                    └──> Mark games as synced

Runs: Every 6 hours (or on-demand)
Time: 2-4 minutes per batch
Processes: 20 games → ~500 box scores
```

### 3️⃣ Progress Tracking

```
games table:
┌────┬────────────┬────────────────────┬──────────────┐
│ id │ game_date  │ nba_game_id        │ synced       │
├────┼────────────┼────────────────────┼──────────────┤
│ 1  │ 2024-10-22 │ 0022400001        │ ✅ true      │
│ 2  │ 2024-10-23 │ 0022400002        │ ✅ true      │
│ 3  │ 2024-10-23 │ 0022400003        │ ⏳ false     │
│ 4  │ 2024-10-24 │ 0022400004        │ ⏳ false     │
└────┴────────────┴────────────────────┴──────────────┘
           ↓
    Next batch processes
    rows where synced = false
```

## Automation Flow

### Initial Deployment

```
1. Deploy Functions
   ├─ supabase functions deploy nba-data-sync
   └─ supabase functions deploy nba-boxscores-batch

2. Run Database Migration
   └─ supabase db push
      ├─ Add box_score_synced column
      └─ Add nba_game_id column

3. Initial Data Load
   ├─ Manual: run nba-data-sync (gets teams, players, games)
   └─ Automated: process-all-boxscores.ps1 (processes all box scores)
```

### Ongoing Operations

```
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Cron Jobs                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Every Day at 6 AM:                                 │
│  ┌────────────────────────────────────────┐        │
│  │ Call nba-data-sync                      │        │
│  │ • Update team records                   │        │
│  │ • Update player stats                   │        │
│  │ • Add new games                         │        │
│  └────────────────────────────────────────┘        │
│                                                      │
│  Every 6 Hours:                                     │
│  ┌────────────────────────────────────────┐        │
│  │ Call nba-boxscores-batch                │        │
│  │ • Process 20 unsynced games             │        │
│  │ • Insert box scores                     │        │
│  │ • Update progress tracking              │        │
│  └────────────────────────────────────────┘        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Batch Processing Timeline

### Full Season Backfill

```
Total Games: 1,230
Batch Size: 20 games
Batches Needed: 62

Timeline:
  Batch 1:  Game 1-20     ▓▓░░░░░░░░░░░░░░░░░░  2%
  Batch 2:  Game 21-40    ▓▓▓░░░░░░░░░░░░░░░░░  3%
  Batch 3:  Game 41-60    ▓▓▓▓░░░░░░░░░░░░░░░░  5%
  ...
  Batch 62: Game 1221-1230 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%

Per Batch: ~3 minutes
Total Time: ~3 hours
```

### Automated Script Output

```
🏀 NBA Box Score Batch Processor
=================================
Endpoint: https://yourproject.supabase.co/functions/v1/nba-boxscores-batch
Batch Size: 20 games

📦 Batch #1 - 12:00:00
  ✅ Processed: 20 games
  📊 Inserted: 487 box scores
  ⏱️  Execution time: 2.3s
  📋 Remaining: 1210 games
  📈 Progress: 2% complete

  Waiting 5 seconds before next batch...

📦 Batch #2 - 12:00:08
  ✅ Processed: 20 games
  📊 Inserted: 502 box scores
  ⏱️  Execution time: 2.5s
  📋 Remaining: 1190 games
  📈 Progress: 3% complete

  Waiting 5 seconds before next batch...

...

✅ All games processed!

Summary:
  Total Batches: 62
  Total Games: 1230
  Total Box Scores: 24,618
  Total Time: 02:54:32

🎉 Box score processing complete!
```

## Error Handling & Recovery

```
┌─────────────────────────────────────────┐
│          Error Scenarios                │
├─────────────────────────────────────────┤
│                                         │
│ 1. API Rate Limit Hit                  │
│    ├─ Wait 2-8 seconds (backoff)       │
│    └─ Retry up to 3 times              │
│                                         │
│ 2. Function Times Out                  │
│    ├─ Stops at 4 minutes (safety)      │
│    ├─ Games processed so far = saved   │
│    └─ Next run continues from there    │
│                                         │
│ 3. Network Error                       │
│    ├─ Log error                        │
│    ├─ Skip game                        │
│    └─ Continue with next game          │
│                                         │
│ 4. Database Error                      │
│    ├─ Rollback transaction             │
│    ├─ Return error response            │
│    └─ Safe to retry                    │
│                                         │
└─────────────────────────────────────────┘
```

## Performance Characteristics

```
Function: nba-data-sync
├─ Cold Start: 1-2 seconds
├─ Warm Start: <500ms
├─ Execution: 30-60 seconds
├─ Memory: ~128 MB
└─ Cost: Free (within limits)

Function: nba-boxscores-batch
├─ Cold Start: 1-2 seconds
├─ Warm Start: <500ms
├─ Execution: 2-4 minutes
├─ Memory: ~128 MB
├─ API Calls: 20 per batch
├─ Rate Limit: 1 second between calls
└─ Cost: Free (within limits)
```

## Monitoring Dashboard Queries

```sql
-- 1. Overall Progress
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE box_score_synced = true) as done,
  ROUND(100.0 * COUNT(*) FILTER (WHERE box_score_synced = true) / COUNT(*)) as pct
FROM games;

-- 2. Recent Activity
SELECT game_date, COUNT(*) as games,
       COUNT(*) FILTER (WHERE box_score_synced = true) as synced
FROM games
GROUP BY game_date
ORDER BY game_date DESC
LIMIT 10;

-- 3. Box Score Counts
SELECT
  (SELECT COUNT(*) FROM box_scores) as total_entries,
  (SELECT COUNT(DISTINCT game_id) FROM box_scores) as games_with_scores,
  (SELECT AVG(cnt) FROM (
    SELECT COUNT(*) as cnt FROM box_scores GROUP BY game_id
  ) sub) as avg_players_per_game;

-- 4. Latest Updates
SELECT
  'Teams' as table_name,
  COUNT(*) as count,
  MAX(COALESCE(updated_at, created_at)) as last_update
FROM teams
UNION ALL
SELECT 'Players', COUNT(*), MAX(COALESCE(updated_at, created_at)) FROM players
UNION ALL
SELECT 'Games', COUNT(*), MAX(COALESCE(updated_at, created_at)) FROM games
UNION ALL
SELECT 'Box Scores', COUNT(*), MAX(COALESCE(updated_at, created_at)) FROM box_scores;
```
