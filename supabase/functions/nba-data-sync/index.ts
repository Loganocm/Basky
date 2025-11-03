// Supabase Edge Function: NBA Data Sync
// Fetches NBA stats and syncs to Supabase database
// Can be triggered via HTTP request or scheduled cron job

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const NBA_API_BASE = "https://stats.nba.com/stats"
const RATE_LIMIT_DELAY = 800 // ms between API calls

// Headers required for NBA API
const NBA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://www.nba.com/',
  'Origin': 'https://www.nba.com',
}

// Types
interface Team {
  name: string
  city: string | null
  abbreviation: string
}

interface Player {
  name: string
  position: string | null
  jersey_number: number | null
  team_id: number | null
  is_starter: boolean
  games_played: number | null
  minutes_per_game: number | null
  points: number | null
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
  field_goal_percentage: number | null
  three_point_percentage: number | null
  free_throw_percentage: number | null
  offensive_rebounds: number | null
  defensive_rebounds: number | null
  field_goals_made: number | null
  field_goals_attempted: number | null
  three_pointers_made: number | null
  three_pointers_attempted: number | null
  free_throws_made: number | null
  free_throws_attempted: number | null
  plus_minus: number | null
  fantasy_points: number | null
  double_doubles: number | null
  triple_doubles: number | null
  personal_fouls: number | null
  age: number | null
  height: string | null
  weight: number | null
  efficiency_rating: number | null
  true_shooting_percentage: number | null
  effective_field_goal_percentage: number | null
  assist_to_turnover_ratio: number | null
  impact_score: number | null
  usage_rate: number | null
  player_efficiency_rating: number | null
}

// Utility functions
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const safeFloat = (value: any): number | null => {
  if (value === null || value === '' || value === undefined) return null
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}

const safeInt = (value: any): number | null => {
  if (value === null || value === '' || value === undefined) return null
  const num = parseInt(value)
  return isNaN(num) ? null : num
}

const normalizePosition = (position: any): string | null => {
  if (!position) return null
  const pos = String(position).toUpperCase().trim()
  
  const positionMap: Record<string, string> = {
    'CENTER': 'C',
    'FORWARD': 'F',
    'GUARD': 'G',
    'C-F': 'F-C',
    'F-G': 'G-F',
    'CENTER-FORWARD': 'F-C',
    'FORWARD-CENTER': 'F-C',
    'FORWARD-GUARD': 'G-F',
    'GUARD-FORWARD': 'G-F',
  }
  
  return positionMap[pos] || (['C', 'F', 'G', 'F-C', 'G-F'].includes(pos) ? pos : null)
}

const getCurrentSeasonEndYear = (): number => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1 // 0-indexed
  
  // If Jan-June, last completed season ended previous year
  // If July-Dec, last completed season ended this year
  return month <= 6 ? year - 1 : year
}

const calculateAdvancedMetrics = (stats: any) => {
  const pts = safeFloat(stats.PTS) || 0
  const reb = safeFloat(stats.REB) || 0
  const ast = safeFloat(stats.AST) || 0
  const stl = safeFloat(stats.STL) || 0
  const blk = safeFloat(stats.BLK) || 0
  const tov = safeFloat(stats.TOV) || 0.1
  
  const fgm = safeFloat(stats.FGM) || 0
  const fga = safeFloat(stats.FGA) || 1
  const fg3m = safeFloat(stats.FG3M) || 0
  const ftm = safeFloat(stats.FTM) || 0
  const fta = safeFloat(stats.FTA) || 0
  
  const gp = safeInt(stats.GP) || 1
  
  const ts_pct = (fga + fta) > 0 ? pts / (2 * (fga + 0.44 * fta)) : 0
  const efg_pct = fga > 0 ? (fgm + 0.5 * fg3m) / fga : 0
  const ast_to_ratio = tov > 0.1 ? ast / tov : ast
  const efficiency = gp > 0 ? (pts + reb + ast + stl + blk - tov) / gp : 0
  const impact = pts + reb + ast + (stl * 2) + (blk * 2) - tov
  const usage = gp > 0 ? (fga + 0.44 * fta + tov) / gp : 0
  const per = gp > 0 ? (pts + reb + ast + stl + blk - (fga - fgm) - (fta - ftm) - tov) / gp : 0
  
  return {
    true_shooting_percentage: ts_pct ? Math.round(ts_pct * 10000) / 10000 : null,
    effective_field_goal_percentage: efg_pct ? Math.round(efg_pct * 10000) / 10000 : null,
    assist_to_turnover_ratio: ast_to_ratio ? Math.round(ast_to_ratio * 100) / 100 : null,
    efficiency_rating: efficiency ? Math.round(efficiency * 100) / 100 : null,
    impact_score: impact ? Math.round(impact * 100) / 100 : null,
    usage_rate: usage ? Math.round(usage * 100) / 100 : null,
    player_efficiency_rating: per ? Math.round(per * 100) / 100 : null,
  }
}

// NBA API fetch wrapper with retry
const fetchNBAAPI = async (endpoint: string, params: Record<string, string>, retries = 3): Promise<any> => {
  const url = new URL(endpoint, NBA_API_BASE)
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  
  for (let i = 0; i < retries; i++) {
    try {
      if (i > 0) await sleep(2 ** i * 1000) // Exponential backoff
      
      const response = await fetch(url.toString(), {
        headers: NBA_HEADERS,
        signal: AbortSignal.timeout(45000), // 45s timeout
      })
      
      if (!response.ok) {
        throw new Error(`NBA API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      await sleep(RATE_LIMIT_DELAY) // Rate limiting
      
      return data
    } catch (error) {
      if (i === retries - 1) throw error
      console.warn(`Attempt ${i + 1} failed, retrying...`, error)
    }
  }
}

// Get team standings and basic info
const getTeamStandings = async (seasonYear: number): Promise<Team[]> => {
  const seasonStr = `${seasonYear - 1}-${String(seasonYear).slice(-2)}`
  console.log(`Fetching team standings for ${seasonStr}...`)
  
  const data = await fetchNBAAPI('/leaguestandings', {
    LeagueID: '00',
    Season: seasonStr,
    SeasonType: 'Regular Season',
  })
  
  const standings = data.resultSets[0]
  const headers = standings.headers
  const rows = standings.rowSet
  
  // Map known team info (NBA API doesn't always return city/abbreviation consistently)
  const knownTeams: Record<string, { city: string, abbrev: string }> = {
    'Atlanta Hawks': { city: 'Atlanta', abbrev: 'ATL' },
    'Boston Celtics': { city: 'Boston', abbrev: 'BOS' },
    'Brooklyn Nets': { city: 'Brooklyn', abbrev: 'BKN' },
    'Charlotte Hornets': { city: 'Charlotte', abbrev: 'CHA' },
    'Chicago Bulls': { city: 'Chicago', abbrev: 'CHI' },
    'Cleveland Cavaliers': { city: 'Cleveland', abbrev: 'CLE' },
    'Dallas Mavericks': { city: 'Dallas', abbrev: 'DAL' },
    'Denver Nuggets': { city: 'Denver', abbrev: 'DEN' },
    'Detroit Pistons': { city: 'Detroit', abbrev: 'DET' },
    'Golden State Warriors': { city: 'Golden State', abbrev: 'GSW' },
    'Houston Rockets': { city: 'Houston', abbrev: 'HOU' },
    'Indiana Pacers': { city: 'Indiana', abbrev: 'IND' },
    'LA Clippers': { city: 'Los Angeles', abbrev: 'LAC' },
    'Los Angeles Lakers': { city: 'Los Angeles', abbrev: 'LAL' },
    'Memphis Grizzlies': { city: 'Memphis', abbrev: 'MEM' },
    'Miami Heat': { city: 'Miami', abbrev: 'MIA' },
    'Milwaukee Bucks': { city: 'Milwaukee', abbrev: 'MIL' },
    'Minnesota Timberwolves': { city: 'Minnesota', abbrev: 'MIN' },
    'New Orleans Pelicans': { city: 'New Orleans', abbrev: 'NOP' },
    'New York Knicks': { city: 'New York', abbrev: 'NYK' },
    'Oklahoma City Thunder': { city: 'Oklahoma City', abbrev: 'OKC' },
    'Orlando Magic': { city: 'Orlando', abbrev: 'ORL' },
    'Philadelphia 76ers': { city: 'Philadelphia', abbrev: 'PHI' },
    'Phoenix Suns': { city: 'Phoenix', abbrev: 'PHX' },
    'Portland Trail Blazers': { city: 'Portland', abbrev: 'POR' },
    'Sacramento Kings': { city: 'Sacramento', abbrev: 'SAC' },
    'San Antonio Spurs': { city: 'San Antonio', abbrev: 'SAS' },
    'Toronto Raptors': { city: 'Toronto', abbrev: 'TOR' },
    'Utah Jazz': { city: 'Utah', abbrev: 'UTA' },
    'Washington Wizards': { city: 'Washington', abbrev: 'WAS' },
  }
  
  const teamNameIdx = headers.indexOf('TeamName')
  
  return rows.map((row: any[]) => {
    const teamName = row[teamNameIdx]
    const teamInfo = knownTeams[teamName] || {
      city: teamName.split(' ')[0],
      abbrev: teamName.substring(0, 3).toUpperCase()
    }
    
    return {
      name: teamName,
      city: teamInfo.city,
      abbreviation: teamInfo.abbrev,
    }
  })
}

// Main sync function
serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const seasonYear = getCurrentSeasonEndYear()
    console.log(`Starting NBA data sync for season ending ${seasonYear}...`)
    
    const results = {
      season: `${seasonYear - 1}-${seasonYear}`,
      teams: 0,
      players: 0,
      games: 0,
      boxScores: 0,
      errors: [] as string[],
    }
    
    // 1. Sync Teams
    try {
      const teams = await getTeamStandings(seasonYear)
      
      for (const team of teams) {
        const { error } = await supabase
          .from('teams')
          .upsert(team, { onConflict: 'abbreviation' })
        
        if (error) throw error
      }
      
      results.teams = teams.length
      console.log(`✅ Synced ${teams.length} teams`)
    } catch (error) {
      const msg = `Team sync failed: ${error.message}`
      console.error(msg)
      results.errors.push(msg)
    }
    
    // 2. Sync Players
    try {
      const seasonStr = `${seasonYear - 1}-${String(seasonYear).slice(-2)}`
      
      // Get player stats
      const statsData = await fetchNBAAPI('/leaguedashplayerstats', {
        Season: seasonStr,
        SeasonType: 'Regular Season',
        PerMode: 'PerGame',
        MeasureType: 'Base',
      })
      
      const statsHeaders = statsData.resultSets[0].headers
      const statsRows = statsData.resultSets[0].rowSet
      
      // Get team mapping
      const { data: dbTeams } = await supabase
        .from('teams')
        .select('id, abbreviation')
      
      const teamMap = new Map(dbTeams?.map(t => [t.abbreviation, t.id]) || [])
      
      // TODO: Fetch roster data for positions, jersey numbers, physical stats
      // This would require multiple API calls per team
      
      for (const row of statsRows) {
        const stats: Record<string, any> = {}
        statsHeaders.forEach((header: string, idx: number) => {
          stats[header] = row[idx]
        })
        
        const advanced = calculateAdvancedMetrics(stats)
        
        const player: Partial<Player> = {
          name: stats.PLAYER_NAME,
          team_id: teamMap.get(stats.TEAM_ABBREVIATION) || null,
          is_starter: false, // Updated separately
          games_played: safeInt(stats.GP),
          minutes_per_game: safeFloat(stats.MIN),
          points: safeFloat(stats.PTS),
          rebounds: safeFloat(stats.REB),
          assists: safeFloat(stats.AST),
          steals: safeFloat(stats.STL),
          blocks: safeFloat(stats.BLK),
          turnovers: safeFloat(stats.TOV),
          field_goal_percentage: safeFloat(stats.FG_PCT),
          three_point_percentage: safeFloat(stats.FG3_PCT),
          free_throw_percentage: safeFloat(stats.FT_PCT),
          offensive_rebounds: safeFloat(stats.OREB),
          defensive_rebounds: safeFloat(stats.DREB),
          field_goals_made: safeFloat(stats.FGM),
          field_goals_attempted: safeFloat(stats.FGA),
          three_pointers_made: safeFloat(stats.FG3M),
          three_pointers_attempted: safeFloat(stats.FG3A),
          free_throws_made: safeFloat(stats.FTM),
          free_throws_attempted: safeFloat(stats.FTA),
          plus_minus: safeFloat(stats.PLUS_MINUS),
          fantasy_points: safeFloat(stats.NBA_FANTASY_PTS),
          double_doubles: safeInt(stats.DD2),
          triple_doubles: safeInt(stats.TD3),
          personal_fouls: safeFloat(stats.PF),
          age: safeInt(stats.AGE),
          ...advanced,
        }
        
        const { error } = await supabase
          .from('players')
          .upsert(player, { onConflict: 'name' })
        
        if (error) throw error
        results.players++
      }
      
      console.log(`✅ Synced ${results.players} players`)
    } catch (error) {
      const msg = `Player sync failed: ${error.message}`
      console.error(msg)
      results.errors.push(msg)
    }
    
    // 3. Sync Recent Games (last 30 days)
    try {
      const seasonStr = `${seasonYear - 1}-${String(seasonYear).slice(-2)}`
      
      const gamesData = await fetchNBAAPI('/leaguegamefinder', {
        LeagueID: '00',
        Season: seasonStr,
        SeasonType: 'Regular Season',
      })
      
      const gamesHeaders = gamesData.resultSets[0].headers
      const gamesRows = gamesData.resultSets[0].rowSet
      
      // Get team mapping
      const { data: dbTeams } = await supabase
        .from('teams')
        .select('id, abbreviation')
      
      const teamMap = new Map(dbTeams?.map((t: any) => [t.abbreviation, t.id]) || [])
      
      // Process games (deduplicate by GAME_ID since each team appears as a row)
      const gameMap = new Map()
      
      for (const row of gamesRows) {
        const game: Record<string, any> = {}
        gamesHeaders.forEach((header: string, idx: number) => {
          game[header] = row[idx]
        })
        
        const gameId = game['GAME_ID']
        const teamAbbrev = game['TEAM_ABBREVIATION']
        const matchup = game['MATCHUP'] || ''
        const pts = safeInt(game['PTS'])
        const gameDate = game['GAME_DATE']
        
        if (!gameMap.has(gameId)) {
          gameMap.set(gameId, {
            nba_game_id: gameId,
            game_date: gameDate,
            teams: [],
          })
        }
        
        gameMap.get(gameId).teams.push({
          abbreviation: teamAbbrev,
          points: pts,
          isHome: !matchup.includes('@'), // @ indicates away game
        })
      }
      
      // Insert games
      for (const [nbaGameId, gameData] of gameMap) {
        if (gameData.teams.length < 2) continue
        
        const homeTeam = gameData.teams.find((t: any) => t.isHome)
        const awayTeam = gameData.teams.find((t: any) => !t.isHome)
        
        if (!homeTeam || !awayTeam) continue
        
        const homeTeamId = teamMap.get(homeTeam.abbreviation)
        const awayTeamId = teamMap.get(awayTeam.abbreviation)
        
        if (!homeTeamId || !awayTeamId) continue
        
        const { error } = await supabase
          .from('games')
          .upsert({
            nba_game_id: nbaGameId,
            game_date: gameData.game_date,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            home_score: homeTeam.points,
            away_score: awayTeam.points,
            box_score_synced: false, // Mark for box score processing
          }, { 
            onConflict: 'nba_game_id',
            ignoreDuplicates: false 
          })
        
        if (error) {
          console.error(`Failed to insert game ${nbaGameId}:`, error)
        } else {
          results.games++
        }
      }
      
      console.log(`✅ Synced ${results.games} games`)
    } catch (error: any) {
      const msg = `Game sync failed: ${error.message}`
      console.error(msg)
      results.errors.push(msg)
    }
    
    return new Response(
      JSON.stringify({
        success: results.errors.length === 0,
        ...results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: results.errors.length > 0 ? 207 : 200, // 207 Multi-Status
      }
    )
  } catch (error) {
    console.error('Fatal error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
