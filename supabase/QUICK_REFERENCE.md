# NBA Data Sync - Quick Reference

## 🚀 Common Commands

### Deploy Functions

```bash
# Deploy all
supabase functions deploy

# Deploy specific
supabase functions deploy nba-data-sync
supabase functions deploy nba-boxscores-batch
```

### Test Functions

```powershell
# Main sync
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/nba-data-sync" `
  -H "Authorization: Bearer YOUR_KEY"

# Box score batch
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/nba-boxscores-batch" `
  -H "Authorization: Bearer YOUR_KEY"
```

### Process All Box Scores

```powershell
.\supabase\scripts\process-all-boxscores.ps1 `
  -ProjectRef "YOUR_REF" `
  -ApiKey "YOUR_KEY"
```

## 📊 Monitoring Queries

### Check Progress

```sql
SELECT
  COUNT(*) FILTER (WHERE box_score_synced = true) as done,
  COUNT(*) FILTER (WHERE box_score_synced = false) as todo,
  ROUND(100.0 * COUNT(*) FILTER (WHERE box_score_synced = true) / COUNT(*), 1) as pct
FROM games WHERE home_score IS NOT NULL;
```

### View Recent Games

```sql
SELECT game_date, home_score, away_score, box_score_synced
FROM games
ORDER BY game_date DESC
LIMIT 10;
```

### Count Records

```sql
SELECT
  (SELECT COUNT(*) FROM teams) as teams,
  (SELECT COUNT(*) FROM players) as players,
  (SELECT COUNT(*) FROM games) as games,
  (SELECT COUNT(*) FROM box_scores) as box_scores;
```

## ⏰ Cron Jobs

### Daily Sync (6 AM UTC)

```sql
SELECT cron.schedule('nba-daily-sync', '0 6 * * *', $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/nba-data-sync',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
$$);
```

### Box Score Catchup (Every 6 Hours)

```sql
SELECT cron.schedule('nba-boxscore-catchup', '0 */6 * * *', $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/nba-boxscores-batch',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
$$);
```

### List & Remove Cron Jobs

```sql
-- List all jobs
SELECT * FROM cron.job;

-- Remove a job
SELECT cron.unschedule('job-name');
```

## 🔧 Troubleshooting

### View Logs

```bash
supabase functions logs nba-data-sync --tail
supabase functions logs nba-boxscores-batch --tail
```

### Reset Box Score Sync

```sql
-- Mark all as unsynced (to reprocess)
UPDATE games SET box_score_synced = false;

-- Mark specific games as unsynced
UPDATE games
SET box_score_synced = false
WHERE game_date >= '2024-10-01';
```

### Clear Box Scores

```sql
-- Delete all box scores
TRUNCATE box_scores;

-- Delete box scores for specific games
DELETE FROM box_scores
WHERE game_id IN (
  SELECT id FROM games WHERE game_date >= '2024-10-01'
);
```

## 📁 File Locations

```
supabase/
├── functions/
│   ├── nba-data-sync/
│   │   └── index.ts           # Main sync function
│   └── nba-boxscores-batch/
│       └── index.ts           # Box score batch processor
├── migrations/
│   └── add_box_score_tracking.sql  # Database setup
├── scripts/
│   └── process-all-boxscores.ps1   # Automation script
└── DEPLOYMENT_GUIDE.md        # Full deployment guide
```

## ⚙️ Configuration

### Environment Variables (Auto-configured by Supabase)

- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key
- `SUPABASE_ANON_KEY` - Public key

### Function Parameters

**nba-data-sync**: No parameters needed

**nba-boxscores-batch**:

```json
{
  "batchSize": 20 // Optional: 1-50 games per batch
}
```

## 📈 Performance

| Task                       | Time    | API Calls |
| -------------------------- | ------- | --------- |
| Teams sync                 | ~5s     | 1         |
| Players sync               | ~30s    | 1-2       |
| Games sync                 | ~10s    | 1         |
| Box score batch (20 games) | ~2-4min | 20        |
| Full season box scores     | ~2-4hrs | ~1,230    |

## 🎯 Best Practices

1. **Initial Setup**: Run full sync once, then schedule daily updates
2. **Box Scores**: Process in batches of 15-20 for safety
3. **Monitoring**: Check logs after first few runs
4. **Rate Limiting**: Don't reduce delays below 600ms
5. **Backups**: Keep Python script as fallback

## 🔗 Resources

- [Supabase Dashboard](https://app.supabase.com)
- [NBA API Docs](https://github.com/swar/nba_api)
- [Function Logs](https://app.supabase.com/project/_/functions)
- [SQL Editor](https://app.supabase.com/project/_/sql)
