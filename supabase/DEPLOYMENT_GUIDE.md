# Supabase Edge Functions - Complete Deployment Guide

This guide walks you through deploying the NBA data synchronization system to Supabase.

## Overview

The system consists of two Edge Functions:

1. **`nba-data-sync`**: Syncs teams, players, and games (runs daily)
2. **`nba-boxscores-batch`**: Processes box scores in batches (runs until complete)

## Prerequisites

- ✅ Supabase project created
- ✅ Node.js and npm installed
- ✅ Git installed
- ✅ Database schema already set up (tables: teams, players, games, box_scores)

## Step 1: Install Supabase CLI

### Windows (PowerShell)

```powershell
# Using npm
npm install -g supabase

# Or using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Verify Installation

```bash
supabase --version
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

## Step 3: Link Your Project

```bash
# Navigate to your project directory
cd c:\Users\Logan\Desktop\Github\Basky

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project ref:**

- Go to your Supabase dashboard
- Settings → General → Project Settings
- Copy the "Reference ID"

## Step 4: Run Database Migration

This adds the `box_score_synced` tracking column:

```bash
# Apply the migration
supabase db push
```

Or manually run this SQL in the Supabase SQL Editor:

```sql
-- Add tracking column
ALTER TABLE games
ADD COLUMN IF NOT EXISTS box_score_synced BOOLEAN DEFAULT FALSE;

-- Add NBA game ID column
ALTER TABLE games
ADD COLUMN IF NOT EXISTS nba_game_id VARCHAR(20);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_games_box_score_synced
ON games(box_score_synced)
WHERE box_score_synced = FALSE OR box_score_synced IS NULL;

CREATE INDEX IF NOT EXISTS idx_games_nba_game_id
ON games(nba_game_id);

-- Add unique constraint on nba_game_id
ALTER TABLE games
ADD CONSTRAINT unique_nba_game_id UNIQUE (nba_game_id);

-- Helper function
CREATE OR REPLACE FUNCTION check_column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    AND column_name = $2
  );
END;
$$ LANGUAGE plpgsql;
```

## Step 5: Deploy Edge Functions

### Deploy Both Functions

```bash
supabase functions deploy nba-data-sync
supabase functions deploy nba-boxscores-batch
```

### Deploy Individual Functions

```bash
# Just the main sync
supabase functions deploy nba-data-sync

# Just the box scores
supabase functions deploy nba-boxscores-batch
```

## Step 6: Test the Functions

### Get Your API Keys

1. Go to Supabase Dashboard
2. Settings → API
3. Copy your `anon` key (public) or `service_role` key (admin)

### Test Main Sync

```powershell
$projectRef = "YOUR_PROJECT_REF"
$anonKey = "YOUR_ANON_KEY"

Invoke-RestMethod `
  -Uri "https://$projectRef.supabase.co/functions/v1/nba-data-sync" `
  -Method Post `
  -Headers @{
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
  }
```

Expected response:

```json
{
  "success": true,
  "season": "2024-25",
  "teams": 30,
  "players": 450,
  "games": 1230,
  "boxScores": 0,
  "errors": [],
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

### Test Box Score Batch

```powershell
Invoke-RestMethod `
  -Uri "https://$projectRef.supabase.co/functions/v1/nba-boxscores-batch" `
  -Method Post `
  -Headers @{
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
  } `
  -Body (@{batchSize = 5} | ConvertTo-Json)
```

## Step 7: Process All Box Scores

### Option A: Automated Script (Recommended)

```powershell
# Run the PowerShell automation script
.\supabase\scripts\process-all-boxscores.ps1 `
  -ProjectRef "YOUR_PROJECT_REF" `
  -ApiKey "YOUR_ANON_KEY" `
  -BatchSize 20 `
  -DelaySeconds 5
```

This will:

- Process 20 games per batch
- Wait 5 seconds between batches
- Show progress in real-time
- Stop when all games are complete

### Option B: Manual Batches

Run this repeatedly until `remainingGames` is 0:

```powershell
$response = Invoke-RestMethod `
  -Uri "https://$projectRef.supabase.co/functions/v1/nba-boxscores-batch" `
  -Method Post `
  -Headers @{"Authorization" = "Bearer $anonKey"}

Write-Host "Remaining: $($response.remainingGames)"
```

### Option C: PostgreSQL Cron (Set and Forget)

Enable pg_cron extension:

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule batch processing every 5 minutes
SELECT cron.schedule(
  'boxscore-batch-processor',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/nba-boxscores-batch',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

**Monitor progress:**

```sql
SELECT
  COUNT(*) FILTER (WHERE box_score_synced = true) as processed,
  COUNT(*) FILTER (WHERE box_score_synced = false OR box_score_synced IS NULL) as remaining,
  ROUND(100.0 * COUNT(*) FILTER (WHERE box_score_synced = true) / COUNT(*), 2) as percent_complete
FROM games
WHERE home_score IS NOT NULL;
```

**When complete, remove the cron job:**

```sql
SELECT cron.unschedule('boxscore-batch-processor');
```

## Step 8: Set Up Daily Automation

### Daily Full Sync (6 AM UTC)

```sql
SELECT cron.schedule(
  'nba-daily-sync',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/nba-data-sync',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### Daily Box Score Catchup (Every 6 Hours)

After initial backfill, run periodically to catch new games:

```sql
SELECT cron.schedule(
  'nba-boxscore-catchup',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/nba-boxscores-batch',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

## Step 9: Monitor and Verify

### View Function Logs

In Supabase Dashboard:

- Edge Functions → Function Name → Logs

Or via CLI:

```bash
supabase functions logs nba-data-sync
supabase functions logs nba-boxscores-batch
```

### Check Data

```sql
-- Verify teams
SELECT COUNT(*) FROM teams;  -- Should be 30

-- Verify players
SELECT COUNT(*) FROM players;  -- Should be 450+

-- Verify games
SELECT COUNT(*) FROM games;  -- Should match season games

-- Verify box scores
SELECT COUNT(*) FROM box_scores;  -- Should be ~24,600 for full season

-- Check completion status
SELECT
  COUNT(*) as total_games,
  COUNT(*) FILTER (WHERE box_score_synced = true) as synced,
  COUNT(*) FILTER (WHERE box_score_synced = false OR box_score_synced IS NULL) as pending
FROM games;
```

## Troubleshooting

### Function Deploy Fails

```bash
# Check if you're logged in
supabase login

# Verify project link
supabase projects list

# Re-link if needed
supabase link --project-ref YOUR_PROJECT_REF
```

### Migration Fails

```bash
# Check current migrations
supabase db remote commit

# Force push
supabase db push --include-all
```

### Function Timeouts

- Default batch size (20 games) should complete in 2-4 minutes
- Reduce batch size if needed: `{"batchSize": 10}`
- Check Supabase status page for API issues

### Missing Data

```sql
-- Check for games without nba_game_id
SELECT COUNT(*) FROM games WHERE nba_game_id IS NULL;

-- Fix manually if needed
UPDATE games
SET nba_game_id = 'GENERATED_ID'
WHERE id = X;
```

### Rate Limiting

- Functions include 1-second delays between API calls
- If you still hit rate limits, increase `RATE_LIMIT_DELAY` in the function code

## Cost Estimates

### Free Tier (Hobby)

- ✅ Edge Functions: 500,000 invocations/month
- ✅ Database: 500 MB (should be sufficient)
- ✅ Bandwidth: 2 GB/month

**Your Usage:**

- Daily sync: 1 invocation/day = 30/month
- Box score batches: ~65 for initial backfill + ~1/day ongoing = ~95/month
- **Total: ~125 invocations/month** ✅ Well within limits

### Pro Tier ($25/month)

- Unlimited function invocations
- 8 GB database
- 50 GB bandwidth
- Recommended if scaling to multiple sports/leagues

## Next Steps

1. ✅ Deploy functions
2. ✅ Run initial box score backfill
3. ✅ Set up daily cron jobs
4. ✅ Monitor logs for first few days
5. 🚀 Integrate with your frontend!

## Support

- **Supabase Docs**: https://supabase.com/docs
- **NBA API**: https://github.com/swar/nba_api
- **Function Logs**: Check Supabase dashboard for errors
- **Database Issues**: Use Supabase SQL Editor for debugging

---

**Pro Tip**: Keep the original Python script (`utilities/nba_scrape_to_postgres.py`) as a backup for:

- Local development
- One-time historical data loads
- Testing before deploying changes
