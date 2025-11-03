# NBA Box Scores Batch Processor

This Edge Function processes NBA box scores in small, manageable batches to avoid timeout issues. It's designed to be called repeatedly until all games are processed.

## Features

✅ **Timeout-Safe**: Processes only 20 games per invocation (completes in ~2-4 minutes)  
✅ **Resumable**: Tracks progress in database, can be called repeatedly  
✅ **Self-Limiting**: Stops early if approaching timeout  
✅ **Rate-Limited**: 1 second between NBA API calls to avoid rate limiting  
✅ **Progress Tracking**: Returns detailed progress and completion estimates

## How It Works

1. **Queries** for up to 20 unprocessed games from the database
2. **Fetches** box score data from NBA API for each game
3. **Inserts** player statistics into `box_scores` table
4. **Marks** each game as `box_score_synced = true`
5. **Returns** progress information (processed count, remaining games, etc.)

## Prerequisites

### Database Migration

Run this migration first to add the tracking column:

```sql
-- See: supabase/migrations/add_box_score_tracking.sql
ALTER TABLE games
ADD COLUMN IF NOT EXISTS box_score_synced BOOLEAN DEFAULT FALSE;

ALTER TABLE games
ADD COLUMN IF NOT EXISTS nba_game_id VARCHAR(20);
```

Or use Supabase CLI:

```bash
supabase db push
```

## Deployment

```bash
# Deploy the function
supabase functions deploy nba-boxscores-batch
```

## Usage

### Manual Single Batch

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/nba-boxscores-batch' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### Custom Batch Size

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/nba-boxscores-batch' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"batchSize": 10}'
```

### Automated Processing (Run Until Complete)

Use this bash script to process all games:

```bash
#!/bin/bash
# process-all-boxscores.sh

ENDPOINT="https://YOUR_PROJECT.supabase.co/functions/v1/nba-boxscores-batch"
AUTH_HEADER="Authorization: Bearer YOUR_ANON_KEY"

while true; do
  echo "Processing batch..."

  RESPONSE=$(curl -s -X POST "$ENDPOINT" -H "$AUTH_HEADER")

  REMAINING=$(echo $RESPONSE | jq -r '.remainingGames')
  PROCESSED=$(echo $RESPONSE | jq -r '.processed')

  echo "Processed: $PROCESSED, Remaining: $REMAINING"

  if [ "$REMAINING" -eq 0 ]; then
    echo "✅ All games processed!"
    break
  fi

  echo "Waiting 5 seconds before next batch..."
  sleep 5
done
```

### Scheduled Processing (PostgreSQL Cron)

Process batches every 5 minutes until complete:

```sql
-- Run every 5 minutes
SELECT cron.schedule(
  'boxscore-batch-processor',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/nba-boxscores-batch',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
  $$
);

-- To remove the schedule when complete:
SELECT cron.unschedule('boxscore-batch-processor');
```

## Response Format

```json
{
  "success": true,
  "processed": 20,
  "inserted": 487,
  "failed": 0,
  "skipped": 0,
  "remainingGames": 1210,
  "executionTime": 142350,
  "batchSize": 20,
  "percentComplete": 2,
  "estimatedBatchesRemaining": 61,
  "timestamp": "2025-11-02T12:34:56.789Z"
}
```

### Response Fields

- `processed`: Games successfully processed in this batch
- `inserted`: Total box score entries inserted
- `failed`: Games that encountered errors
- `skipped`: Games with no available box score data
- `remainingGames`: Total games still needing processing
- `executionTime`: Time taken (milliseconds)
- `percentComplete`: Overall completion percentage
- `estimatedBatchesRemaining`: How many more batches needed

## Performance

### Timing

- **Per Game**: ~4-7 seconds (API call + processing)
- **Batch of 20**: ~2-4 minutes
- **Total (1,230 games)**: ~60-65 batches = 2-4 hours total
- **Safety Buffer**: Stops at 4 minutes to avoid 5-minute timeout

### Rate Limiting

- **Delay**: 1 second between API calls
- **Retries**: Up to 3 attempts with exponential backoff
- **Timeout**: 30 seconds per API request

## Error Handling

### Game-Level Errors

- Failed games are logged but don't stop the batch
- Game is still marked as processed to avoid retry loops
- Check function logs for specific error details

### Function-Level Errors

- Returns 500 status with error details
- Safe to retry - progress is tracked in database
- No data corruption risk

## Monitoring Progress

### Check Completion Status

```sql
-- Count processed vs total
SELECT
  COUNT(*) FILTER (WHERE box_score_synced = true) as processed,
  COUNT(*) FILTER (WHERE box_score_synced = false OR box_score_synced IS NULL) as remaining,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE box_score_synced = true) / COUNT(*), 2) as percent_complete
FROM games
WHERE home_score IS NOT NULL AND away_score IS NOT NULL;
```

### View Recent Processing

```sql
-- Check recently processed games
SELECT id, game_date, home_score, away_score, box_score_synced
FROM games
ORDER BY game_date DESC
LIMIT 20;
```

### Count Box Scores

```sql
-- Verify box scores were inserted
SELECT COUNT(*) as total_box_scores
FROM box_scores;

-- Box scores per game (should be ~20-26 per game)
SELECT
  game_id,
  COUNT(*) as player_count
FROM box_scores
GROUP BY game_id
ORDER BY player_count DESC
LIMIT 10;
```

## Troubleshooting

### "No games to process"

✅ All box scores are synced! You're done.

### High failure rate

- Check NBA API availability
- Verify `nba_game_id` format in database
- Check Supabase logs for specific errors

### Timeouts

- Reduce `batchSize` (try 10 or 15)
- Default is already conservative at 20 games
- Function auto-stops at 4 minutes as safety

### Missing box scores

- Some games may genuinely have no box score data
- Check `skipped` count in response
- Verify game has `home_score` and `away_score` set

## Integration with Main Sync

### Recommended Workflow

1. **Daily**: Run `nba-data-sync` for teams and players
2. **After games**: Run `nba-boxscores-batch` to process recent games
3. **Initial backfill**: Run batch processor repeatedly until complete

### Combined Schedule

```sql
-- Daily full sync at 6 AM
SELECT cron.schedule(
  'nba-daily-sync',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/nba-data-sync',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
  $$
);

-- Box score batch every 6 hours (to catch up gradually)
SELECT cron.schedule(
  'nba-boxscore-catchup',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/nba-boxscores-batch',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
  $$
);
```

## Cost Considerations

### Supabase Edge Functions

- Free tier: 500,000 invocations/month
- Processing 1,230 games = ~65 batches
- Daily updates = ~1 batch/day
- Well within free tier limits

### Database Operations

- Each batch: ~20 game lookups + ~500 box score inserts
- Indexed queries for fast performance
- Minimal database load

## Local Development

```bash
# Start local Supabase
supabase start

# Apply migration
supabase db push

# Serve function
supabase functions serve nba-boxscores-batch

# Test with sample
curl -X POST 'http://localhost:54321/functions/v1/nba-boxscores-batch' \
  -H 'Authorization: Bearer YOUR_LOCAL_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"batchSize": 5}'
```

## Next Steps

1. ✅ Deploy the function
2. ✅ Run the database migration
3. ✅ Test with a small batch (`batchSize: 5`)
4. ✅ Process all historical games (run repeatedly or use automation script)
5. ✅ Set up daily/hourly cron for ongoing updates
