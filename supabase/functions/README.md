# Supabase Edge Functions for Basky

This directory contains serverless functions that run on Supabase's infrastructure.

## Available Functions

### `nba-data-sync`

Primary data synchronization function that fetches NBA statistics and updates the database.

**Features:**

- Team standings and information
- Player statistics and advanced metrics
- Season data synchronization
- Automated daily updates via cron

**See:** [nba-data-sync/README.md](./nba-data-sync/README.md)

## Quick Start

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login and Link Project

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Deploy All Functions

```bash
supabase functions deploy
```

### 4. Deploy Specific Function

```bash
supabase functions deploy nba-data-sync
```

## Local Development

```bash
# Start local Supabase (includes Postgres, Auth, etc.)
supabase start

# Serve a specific function locally
supabase functions serve nba-data-sync

# In another terminal, test it
curl -i --location --request POST 'http://localhost:54321/functions/v1/nba-data-sync' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Environment Variables

Edge Functions automatically have access to:

- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (full access)
- `SUPABASE_ANON_KEY` - Anonymous key (public access)

Set additional secrets:

```bash
supabase secrets set MY_SECRET=value
```

## Function Structure

```
functions/
├── nba-data-sync/
│   ├── index.ts          # Main function code
│   ├── deno.json         # Deno configuration
│   ├── import_map.json   # Optional import mapping
│   └── README.md         # Function documentation
└── README.md             # This file
```

## Best Practices

1. **Keep functions focused**: Each function should do one thing well
2. **Handle errors gracefully**: Return meaningful error messages
3. **Use TypeScript**: Better type safety and IDE support
4. **Rate limit API calls**: Respect external API limits
5. **Log appropriately**: Use `console.log()` for debugging (visible in Supabase logs)
6. **Set timeouts**: Edge Functions have a 30-minute max execution time
7. **Test locally first**: Use `supabase functions serve` before deploying

## Monitoring

View function logs in:

- **Supabase Dashboard**: Edge Functions → Function Name → Logs
- **CLI**: `supabase functions logs nba-data-sync`

## Costs

Edge Functions on Supabase:

- **Free tier**: 500,000 invocations/month
- **Pro tier**: Unlimited invocations
- Execution time is included in your plan

NBA API calls are free but rate-limited (~600ms between requests recommended).

## Migration Notes

This replaces the Python `utilities/nba_scrape_to_postgres.py` script with:

- ✅ Serverless architecture (no server management)
- ✅ Automatic scaling
- ✅ Built-in authentication via Supabase
- ✅ Easy scheduling via cron
- ✅ TypeScript/Deno runtime (modern, secure)

The original Python script is still available for:

- One-time historical data backfills
- Local development/testing
- Complex operations that exceed Edge Function limits
