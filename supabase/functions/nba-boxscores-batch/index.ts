// Supabase Edge Function: NBA Box Scores Batch Processor
// Processes box scores in small batches to avoid timeouts
// Tracks progress in database for resumable processing

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const NBA_API_BASE = "https://stats.nba.com/stats"
const RATE_LIMIT_DELAY = 1000 // 1 second between API calls for safety
const BATCH_SIZE = 20 // Process max 20 games per invocation (safe for 5-minute timeout)
const MAX_EXECUTION_TIME = 4 * 60 * 1000 // 4 minutes (leave 1 min buffer)

// Headers required for NBA API
const NBA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://www.nba.com/',
  'Origin': 'https://www.nba.com',
}

// Utility functions
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const safeInt = (value: any): number | null => {
  if (value === null || value === '' || value === undefined) return null
  const num = parseInt(value)
  return isNaN(num) ? null : num
}

// NBA API fetch with retry
const fetchNBAAPI = async (endpoint: string, params: Record<string, string>, retries = 3): Promise<any> => {
  const url = new URL(endpoint, NBA_API_BASE)
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  
  for (let i = 0; i < retries; i++) {
    try {
      if (i > 0) {
        const backoff = Math.min(2 ** i * 1000, 8000) // Max 8s backoff
        await sleep(backoff)
      }
      
      const response = await fetch(url.toString(), {
        headers: NBA_HEADERS,
        signal: AbortSignal.timeout(30000), // 30s timeout per request
      })
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - wait longer
          console.warn(`Rate limited on attempt ${i + 1}, waiting...`)
          await sleep(5000)
          continue
        }
        throw new Error(`NBA API error: ${response.status}`)
      }
      
      const data = await response.json()
      await sleep(RATE_LIMIT_DELAY) // Consistent rate limiting
      
      return data
    } catch (error) {
      if (i === retries - 1) throw error
      console.warn(`Attempt ${i + 1} failed:`, error)
    }
  }
}

// Fetch box score for a single game
const getBoxScoreForGame = async (nbaGameId: string) => {
  try {
    const data = await fetchNBAAPI('/boxscoretraditionalv2', {
      GameID: nbaGameId,
      StartPeriod: '0',
      EndPeriod: '10',
      StartRange: '0',
      EndRange: '28800',
      RangeType: '0',
    })
    
    const playerStats = data.resultSets.find((rs: any) => rs.name === 'PlayerStats')
    if (!playerStats || !playerStats.rowSet.length) {
      return null
    }
    
    const headers = playerStats.headers
    const rows = playerStats.rowSet
    
    return { headers, rows }
  } catch (error) {
    console.error(`Failed to fetch box score for game ${nbaGameId}:`, error)
    return null
  }
}

// Process box scores for a batch of games
const processBatch = async (supabase: any, games: any[], startTime: number) => {
  const results = {
    processed: 0,
    inserted: 0,
    failed: 0,
    skipped: 0,
  }
  
  // Get player name to ID mapping (cached for batch)
  const { data: players } = await supabase
    .from('players')
    .select('id, name')
  
  const playerMap = new Map(players?.map((p: any) => [p.name, p.id]) || [])
  
  // Get team abbreviation to ID mapping (cached for batch)
  const { data: teams } = await supabase
    .from('teams')
    .select('id, abbreviation')
  
  const teamMap = new Map(teams?.map((t: any) => [t.abbreviation, t.id]) || [])
  
  for (const game of games) {
    // Check if we're approaching timeout
    const elapsed = Date.now() - startTime
    if (elapsed > MAX_EXECUTION_TIME) {
      console.log(`⏱️  Approaching timeout at ${elapsed}ms, stopping batch early`)
      break
    }
    
    try {
      const boxScoreData = await getBoxScoreForGame(game.nba_game_id)
      
      if (!boxScoreData) {
        results.skipped++
        // Mark game as processed even if no data
        await supabase
          .from('games')
          .update({ box_score_synced: true })
          .eq('id', game.id)
        continue
      }
      
      const { headers, rows } = boxScoreData
      const boxScores: any[] = []
      
      for (const row of rows) {
        const stats: Record<string, any> = {}
        headers.forEach((header: string, idx: number) => {
          stats[header] = row[idx]
        })
        
        const playerName = stats.PLAYER_NAME
        const playerId = playerMap.get(playerName)
        
        if (!playerId) {
          console.debug(`Player not found: ${playerName}`)
          continue
        }
        
        const teamId = teamMap.get(stats.TEAM_ABBREVIATION)
        if (!teamId) {
          console.debug(`Team not found: ${stats.TEAM_ABBREVIATION}`)
          continue
        }
        
        const isStarter = stats.START_POSITION && stats.START_POSITION.trim() !== ''
        
        boxScores.push({
          game_id: game.id,
          player_id: playerId,
          team_id: teamId,
          minutes_played: stats.MIN || null,
          points: safeInt(stats.PTS),
          rebounds: safeInt(stats.REB),
          assists: safeInt(stats.AST),
          steals: safeInt(stats.STL),
          blocks: safeInt(stats.BLK),
          turnovers: safeInt(stats.TO),
          field_goals_made: safeInt(stats.FGM),
          field_goals_attempted: safeInt(stats.FGA),
          three_pointers_made: safeInt(stats.FG3M),
          three_pointers_attempted: safeInt(stats.FG3A),
          free_throws_made: safeInt(stats.FTM),
          free_throws_attempted: safeInt(stats.FTA),
          plus_minus: safeInt(stats.PLUS_MINUS),
          is_starter: isStarter,
        })
      }
      
      if (boxScores.length > 0) {
        // Insert box scores
        const { error: insertError } = await supabase
          .from('box_scores')
          .upsert(boxScores, { 
            onConflict: 'game_id,player_id',
            ignoreDuplicates: false 
          })
        
        if (insertError) {
          console.error(`Failed to insert box scores for game ${game.id}:`, insertError)
          results.failed++
        } else {
          results.inserted += boxScores.length
          results.processed++
        }
      }
      
      // Mark game as processed
      await supabase
        .from('games')
        .update({ box_score_synced: true })
        .eq('id', game.id)
      
    } catch (error) {
      console.error(`Error processing game ${game.id}:`, error)
      results.failed++
    }
  }
  
  return results
}

serve(async (req) => {
  const startTime = Date.now()
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log(`🏀 Starting box score batch processing...`)
    
    // Get batch size from request (optional override)
    let batchSize = BATCH_SIZE
    try {
      const body = await req.json()
      if (body.batchSize && body.batchSize > 0 && body.batchSize <= 50) {
        batchSize = body.batchSize
      }
    } catch {
      // No body or invalid JSON, use default
    }
    
    // First, ensure the box_score_synced column exists
    // This is done via migration, but we check for clarity
    const { error: schemaError } = await supabase.rpc('check_column_exists', {
      table_name: 'games',
      column_name: 'box_score_synced'
    }).catch(() => ({ error: null })) // Ignore if function doesn't exist
    
    // Get games that need box score processing
    // Prioritize completed games (with scores) that haven't been synced
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, game_date, home_team_id, away_team_id, home_score, away_score, nba_game_id')
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)
      .or('box_score_synced.is.null,box_score_synced.eq.false')
      .order('game_date', { ascending: false }) // Most recent first
      .limit(batchSize)
    
    if (gamesError) {
      throw new Error(`Failed to fetch games: ${gamesError.message}`)
    }
    
    if (!games || games.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No games to process - all caught up!',
          processed: 0,
          inserted: 0,
          failed: 0,
          skipped: 0,
          remainingGames: 0,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    console.log(`📊 Processing ${games.length} games...`)
    
    // Process the batch
    const results = await processBatch(supabase, games, startTime)
    
    // Count remaining games to process
    const { count: remainingCount } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)
      .or('box_score_synced.is.null,box_score_synced.eq.false')
    
    const executionTime = Date.now() - startTime
    const remainingGames = (remainingCount || 0)
    
    console.log(`✅ Batch complete: ${results.processed} processed, ${results.inserted} box scores inserted`)
    console.log(`⏱️  Execution time: ${executionTime}ms`)
    console.log(`📋 Remaining games: ${remainingGames}`)
    
    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        remainingGames,
        executionTime,
        batchSize: games.length,
        percentComplete: remainingGames === 0 ? 100 : 
          Math.round(((results.processed / (results.processed + remainingGames)) * 100)),
        estimatedBatchesRemaining: Math.ceil(remainingGames / batchSize),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Fatal error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
