# NBA Data Sync - Supabase Edge Function

This Supabase Edge Function replaces the Python `nba_scrape_to_postgres.py` script and runs as a serverless function on Supabase's infrastructure.

## What It Does

1. **Teams**: Fetches current NBA team standings and information
2. **Players**: Syncs player stats, advanced metrics, and biographical data
3. **Games**: Fetches game results (optional, can be resource-intensive)
4. **Box Scores**: Individual player game performances (optional)
5. **Starter Status**: Updates which players are starters

## Deployment

### Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Supabase project set up

### Deploy the Function

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy nba-data-sync
```

### Set Environment Variables

The function automatically uses your Supabase connection, but you need to ensure your environment is configured:

```bash
# These are automatically available in Supabase Edge Functions:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_ANON_KEY
```

## Usage

### Manual Trigger (HTTP Request)

```bash
# Using curl
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/nba-data-sync' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'

# Using the Supabase dashboard
# Navigate to: Edge Functions > nba-data-sync > Invoke
```

### Scheduled Trigger (Cron Job)

Set up a scheduled job in your Supabase project:

1. Go to Database > Extensions
2. Enable `pg_cron`
3. Run this SQL:

```sql
-- Run daily at 6 AM UTC
SELECT cron.schedule(
  'nba-daily-sync',
  '0 6 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/nba-data-sync',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
  $$
);
```

### Response Format

```json
{
  "success": true,
  "season": "2024-25",
  "teams": 30,
  "players": 450,
  "games": 0,
  "boxScores": 0,
  "errors": [],
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

## Performance Considerations

### Current Implementation

- **Teams**: ~30 teams, 1 API call
- **Players**: ~450 players, 1 API call + DB upserts
- **Total time**: ~30-60 seconds

### Full Implementation (with games/box scores)

- **Games**: ~1,230 games per season, 1 API call
- **Box Scores**: ~1,230 games × 20 players = ~24,600 API calls
- **Total time**: ~5-6 hours (with rate limiting)

⚠️ **Box scores are commented out** in the current implementation because they would exceed Edge Function timeout limits (30 minutes max).

## Recommendations

### Option 1: Split into Multiple Functions

- `nba-teams-sync`: Teams only (fast, ~10s)
- `nba-players-sync`: Players only (medium, ~30s)
- `nba-games-sync`: Games only (medium, ~2min)
- `nba-boxscores-sync`: Box scores in batches (slow, run multiple times)

### Option 2: Use Supabase Database Functions

Move heavy processing to PostgreSQL functions that can run without timeout constraints:

```sql
CREATE OR REPLACE FUNCTION sync_box_scores_batch(start_game_id INT, end_game_id INT)
RETURNS void AS $$
BEGIN
  -- Call NBA API and insert box scores
  -- Can be called multiple times for different game ranges
END;
$$ LANGUAGE plpgsql;
```

### Option 3: Hybrid Approach (Recommended)

- Use Edge Function for daily updates (teams, players, recent games)
- Use a scheduled database function or external service for historical box score backfill
- Store "last synced" timestamp to track progress

## Migration from Python Script

The Python script handled everything in one run. With Supabase Edge Functions:

| Python Script Feature | Supabase Solution                       |
| --------------------- | --------------------------------------- |
| Team standings        | ✅ Included in Edge Function            |
| Player stats          | ✅ Included in Edge Function            |
| Player positions      | ⚠️ Requires additional roster API calls |
| Jersey numbers        | ⚠️ Requires additional roster API calls |
| All season games      | ⚠️ Need to add game fetching logic      |
| Box scores            | ❌ Too slow, use batched approach       |
| Starter status        | ⚠️ Need to add box score analysis       |

## Next Steps

1. **Test the basic function**: Deploy and test teams + players sync
2. **Add roster data**: Implement position and jersey number fetching
3. **Design batch strategy**: Plan how to handle games and box scores
4. **Set up monitoring**: Use Supabase logs to track function performance
5. **Schedule regular syncs**: Set up cron job for daily updates

## Local Development

```bash
# Start Supabase locally
supabase start

# Serve the function locally
supabase functions serve nba-data-sync

# Test locally
curl -i --location --request POST 'http://localhost:54321/functions/v1/nba-data-sync' \
  --header 'Authorization: Bearer YOUR_LOCAL_ANON_KEY'
```

## Troubleshooting

### Timeout Errors

- Reduce batch size
- Split into multiple functions
- Use database functions for heavy processing

### Rate Limiting from NBA API

- Increase `RATE_LIMIT_DELAY` (default: 800ms)
- Add exponential backoff on retries
- Respect NBA API usage guidelines

### Missing Data

- Check Supabase logs for API errors
- Verify database schema matches expected format
- Ensure team/player name matching works correctly
