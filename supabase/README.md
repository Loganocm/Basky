# 🏀 Basky - Supabase NBA Data Pipeline

Production-ready serverless functions for automated NBA statistics synchronization.

## 📋 What's Inside

This directory contains the complete Supabase implementation for fetching, processing, and storing NBA data without timeouts or manual intervention.

### 🗂️ Directory Structure

```
supabase/
├── functions/
│   ├── nba-data-sync/              # Main sync function
│   │   ├── index.ts                # Teams, players, games sync
│   │   ├── deno.json               # Deno config
│   │   └── README.md               # Documentation
│   │
│   ├── nba-boxscores-batch/        # Batch processor
│   │   ├── index.ts                # Box score sync (timeout-safe)
│   │   └── README.md               # Usage guide
│   │
│   └── README.md                   # Functions overview
│
├── migrations/
│   └── add_box_score_tracking.sql  # Database setup
│
├── scripts/
│   └── process-all-boxscores.ps1   # Automation script
│
├── SUMMARY.md                      # ⭐ START HERE - Overview
├── DEPLOYMENT_GUIDE.md             # Step-by-step deployment
├── QUICK_REFERENCE.md              # Common commands cheat sheet
├── ARCHITECTURE.md                 # System architecture diagram
└── README.md                       # This file
```

## 🚀 Quick Start (5 Minutes)

### 1. Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login
```

### 2. Deploy

```bash
# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push

# Deploy functions
supabase functions deploy
```

### 3. Sync Data

```powershell
# Process all historical box scores (one-time)
.\supabase\scripts\process-all-boxscores.ps1 `
  -ProjectRef "YOUR_REF" `
  -ApiKey "YOUR_KEY"
```

### 4. Automate (Optional)

```sql
-- Daily sync at 6 AM
SELECT cron.schedule('nba-daily-sync', '0 6 * * *', $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/nba-data-sync',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
$$);
```

**Done!** 🎉 Your NBA data pipeline is live.

## 📚 Documentation

| Document                                         | Purpose                | When to Use        |
| ------------------------------------------------ | ---------------------- | ------------------ |
| **[SUMMARY.md](./SUMMARY.md)**                   | 📖 Overview & features | Start here         |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | 🚀 Step-by-step setup  | First deployment   |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**   | ⚡ Common commands     | Daily operations   |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)**         | 🏗️ System design       | Understanding flow |
| **[functions/\*/README.md](./functions/)**       | 🔧 Function details    | Development        |

## 🎯 What It Does

### nba-data-sync (Daily Updates)

```
✅ Syncs 30 NBA teams
✅ Syncs 450+ players with advanced stats
✅ Syncs all season games
⏱️  Runtime: ~45 seconds
📅 Schedule: Daily at 6 AM UTC
```

### nba-boxscores-batch (Historical Data)

```
✅ Processes 20 games per batch
✅ Never times out (2-4 min per batch)
✅ Resumable from any point
✅ Progress tracking
📊 Total: ~1,230 games = ~24,600 box scores
⏱️  Complete season: ~2-4 hours (automated)
```

## 💡 Key Features

| Feature                | Description                            |
| ---------------------- | -------------------------------------- |
| **Timeout-Safe**       | Batched processing ensures no timeouts |
| **Resumable**          | Crashes? Pick up where you left off    |
| **Serverless**         | No infrastructure to manage            |
| **Free Tier Friendly** | ~125 invocations/month (500k limit)    |
| **Progress Tracking**  | Real-time % complete                   |
| **Rate Limited**       | Respects NBA API limits                |
| **Automated**          | Set and forget with cron jobs          |

## 🔄 Data Flow

```
NBA API → nba-data-sync → Supabase DB → Your Frontend
            (daily)

NBA API → nba-boxscores-batch → Supabase DB
            (batched)
```

## 📊 Performance

| Metric                 | Value                    |
| ---------------------- | ------------------------ |
| Daily sync runtime     | 30-60 seconds            |
| Batch processing       | 2-4 minutes per 20 games |
| Full season backfill   | 2-4 hours (automated)    |
| API calls per day      | ~3 (daily sync)          |
| API calls for backfill | ~1,230 (one-time)        |
| Memory usage           | ~128 MB per function     |
| **Monthly cost**       | **$0** (free tier)       |

## 🛠️ Common Operations

### Deploy Functions

```bash
supabase functions deploy
```

### Check Progress

```sql
SELECT
  COUNT(*) FILTER (WHERE box_score_synced = true) as done,
  COUNT(*) FILTER (WHERE box_score_synced = false) as todo
FROM games;
```

### View Logs

```bash
supabase functions logs nba-data-sync --tail
```

### Manual Trigger

```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/nba-data-sync" \
  -H "Authorization: Bearer YOUR_KEY"
```

## 🎓 Migration from Python Script

| Python Script           | Supabase Functions             |
| ----------------------- | ------------------------------ |
| Runs 5-6 hours          | Runs in batches (2-4 min each) |
| Not resumable           | Fully resumable                |
| Manual execution        | Automated cron jobs            |
| Server required         | Serverless                     |
| No progress tracking    | Real-time progress             |
| Single point of failure | Batch-level resilience         |

**Keep both:** Use Supabase for automation, Python for one-off operations.

## 🔍 Monitoring

### Database Queries

```sql
-- Overall stats
SELECT
  (SELECT COUNT(*) FROM teams) as teams,
  (SELECT COUNT(*) FROM players) as players,
  (SELECT COUNT(*) FROM games) as games,
  (SELECT COUNT(*) FROM box_scores) as box_scores;

-- Sync progress
SELECT
  ROUND(100.0 * COUNT(*) FILTER (WHERE box_score_synced = true) / COUNT(*)) as pct_complete
FROM games;
```

### Function Logs

- **Dashboard**: Edge Functions → Function Name → Logs
- **CLI**: `supabase functions logs <function-name> --tail`

## 🆘 Troubleshooting

| Issue             | Solution                          |
| ----------------- | --------------------------------- |
| Function timeout  | Reduce batch size to 10-15 games  |
| Rate limit errors | Increase delay in function code   |
| Missing data      | Check function logs for errors    |
| Deploy fails      | Verify `supabase link` is correct |

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

## 🔗 Resources

- **Supabase Dashboard**: [app.supabase.com](https://app.supabase.com)
- **NBA API Docs**: [github.com/swar/nba_api](https://github.com/swar/nba_api)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Deno Manual**: [deno.land/manual](https://deno.land/manual)

## 🎯 Next Steps

1. ✅ Read [SUMMARY.md](./SUMMARY.md) for overview
2. ✅ Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to deploy
3. ✅ Run initial data sync
4. ✅ Set up automation
5. ✅ Monitor and enjoy! 🏀

## 💰 Cost Breakdown

**Supabase Free Tier:**

- ✅ 500,000 function invocations/month
- ✅ 500 MB database
- ✅ 2 GB bandwidth

**Your Usage:**

- Daily sync: 30 invocations/month
- Box score batches: ~95 invocations/month (initial + ongoing)
- **Total: ~125/month** (well within limits)

**Production Ready:** Free tier is sufficient for NBA stats.

## 📝 License

Part of the Basky project. See root LICENSE file.

---

**Questions?** Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) or open an issue!
