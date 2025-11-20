import time
import datetime
import logging
import psycopg2
from psycopg2.extras import execute_batch
import pandas as pd
from nba_api.stats.endpoints import leaguestandings, playergamelog, leaguegamefinder, commonplayerinfo, leaguedashplayerstats, commonteamroster, boxscoretraditionalv2
from nba_api.stats.static import teams, players

# ----------------------------------------------------------------------
# CONFIGURATION
# ----------------------------------------------------------------------
import os

DB_NAME = os.environ.get("DB_NAME", "postgres")
DB_USER = os.environ.get("DB_USER", "postgres.hbsdjlaogfdcjlghjuct")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "1738")  # TODO: replace with your actual password
DB_HOST = os.environ.get("DB_HOST", "aws-1-us-east-1.pooler.supabase.com")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_SSLMODE = os.environ.get("DB_SSLMODE", "require")  # Supabase requires SSL

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("nba_scraper")

# ----------------------------------------------------------------------
# HELPER: Get most recently completed season_end_year
# ----------------------------------------------------------------------
def get_current_season_end_year():
    """
    Get the most recently completed NBA season's end year.
    NBA seasons end in April, so:
    - If current month is Jan-June: last completed season ended in current year
    - If current month is July-Dec: last completed season ended in current year
    
    For October 2025: season 2024-25 ended in April 2025, so return 2025
    """
    today = datetime.date.today()
    year = today.year
    # If we're in the early part of the year (before the season ends in April),
    # we want the previous year's completed season
    if today.month <= 6:
        # Jan-June: The season ending this year hasn't finished yet,
        # so use last year's completed season
        return year - 1
    else:
        # July-Dec: The season that ended in April of this year is complete
        return year

SEASON_END_YEAR = get_current_season_end_year()
logger.info(f"Using season ending in {SEASON_END_YEAR}")

# ----------------------------------------------------------------------
# DATABASE CONNECTION
# ----------------------------------------------------------------------
def get_connection():
    """Create and return a database connection with error handling."""
    try:
        return psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            sslmode=DB_SSLMODE,
            connect_timeout=10
        )
    except psycopg2.Error as e:
        logger.error(f"Database connection failed: {e}")
        logger.error(f"Connection details: host={DB_HOST}, port={DB_PORT}, dbname={DB_NAME}, user={DB_USER}, sslmode={DB_SSLMODE}")
        raise

# ----------------------------------------------------------------------
# VALIDATION HELPERS
# ----------------------------------------------------------------------
def safe_float(value):
    """Safely convert a value to float, returning None if conversion fails."""
    if value is None or value == '' or pd.isna(value):
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def safe_int(value):
    """Safely convert a value to int, returning None if conversion fails."""
    if value is None or value == '' or pd.isna(value):
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None

def normalize_position(position):
    """Normalize position names to standard format: C, F, G, F-C, G-F"""
    if not position or pd.isna(position):
        return None
    
    # Convert to uppercase and strip whitespace
    pos = str(position).upper().strip()
    
    # Map full names to abbreviations
    position_map = {
        'CENTER': 'C',
        'FORWARD': 'F',
        'GUARD': 'G',
        'C-F': 'F-C',  # Standardize to F-C
        'F-G': 'G-F',  # Standardize to G-F
        'CENTER-FORWARD': 'F-C',
        'FORWARD-CENTER': 'F-C',
        'FORWARD-GUARD': 'G-F',
        'GUARD-FORWARD': 'G-F',
    }
    
    # Return mapped value or original if already in standard format
    return position_map.get(pos, pos if pos in ['C', 'F', 'G', 'F-C', 'G-F'] else None)

def calculate_advanced_metrics(row):
    """Calculate advanced metrics from basic stats"""
    
    # Extract all stats safely
    pts = safe_float(row.get('PTS')) or 0
    reb = safe_float(row.get('REB')) or 0
    ast = safe_float(row.get('AST')) or 0
    stl = safe_float(row.get('STL')) or 0
    blk = safe_float(row.get('BLK')) or 0
    tov = safe_float(row.get('TOV')) or 0.1  # Avoid division by zero
    
    fgm = safe_float(row.get('FGM')) or 0
    fga = safe_float(row.get('FGA')) or 1  # Avoid division by zero
    fg3m = safe_float(row.get('FG3M')) or 0
    ftm = safe_float(row.get('FTM')) or 0
    fta = safe_float(row.get('FTA')) or 0
    
    gp = safe_int(row.get('GP')) or 1  # Avoid division by zero
    
    # True Shooting Percentage: PTS / (2 * (FGA + 0.44 * FTA))
    ts_pct = pts / (2 * (fga + 0.44 * fta)) if (fga + fta) > 0 else 0
    
    # Effective Field Goal Percentage: (FGM + 0.5 * 3PM) / FGA
    efg_pct = (fgm + 0.5 * fg3m) / fga if fga > 0 else 0
    
    # Assist to Turnover Ratio
    ast_to_ratio = ast / tov if tov > 0.1 else ast
    
    # Efficiency Rating (simplified): (PTS + REB + AST + STL + BLK - TOV) / GP
    efficiency = (pts + reb + ast + stl + blk - tov) / gp if gp > 0 else 0
    
    # Impact Score: PTS + REB + AST + (STL * 2) + (BLK * 2) - TOV
    impact = pts + reb + ast + (stl * 2) + (blk * 2) - tov
    
    # Usage Rate approximation (would need team stats for accurate calculation)
    # Simplified: FGA + 0.44 * FTA + TOV) / GP
    usage = ((fga + 0.44 * fta + tov) / gp) if gp > 0 else 0
    
    # Player Efficiency Rating (simplified)
    # Full formula is complex, this is an approximation
    per = (pts + reb + ast + stl + blk - (fga - fgm) - (fta - ftm) - tov) / gp if gp > 0 else 0
    
    return {
        'true_shooting_percentage': round(ts_pct, 4) if ts_pct else None,
        'effective_field_goal_percentage': round(efg_pct, 4) if efg_pct else None,
        'assist_to_turnover_ratio': round(ast_to_ratio, 2) if ast_to_ratio else None,
        'efficiency_rating': round(efficiency, 2) if efficiency else None,
        'impact_score': round(impact, 2) if impact else None,
        'usage_rate': round(usage, 2) if usage else None,
        'player_efficiency_rating': round(per, 2) if per else None,
    }

def validate_team_data(teams_data):
    """Validate team data before insertion."""
    validated_data = []
    for team in teams_data:
        if len(team) != 3:  # Now expects (name, city, abbreviation)
            logger.warning(f"Invalid team data format: {team}")
            continue
        name, city, abbrev = team
        if not name or not abbrev:
            logger.warning(f"Missing team name or abbreviation: {team}")
            continue
        validated_data.append(team)
    return validated_data

def validate_player_data(players_data):
    """Validate player data before insertion."""
    validated_data = []
    for player in players_data:
        # Expected 38 fields now (extended with advanced stats and calculated metrics)
        if len(player) < 14:  # At minimum must have the basic 14 fields
            logger.warning(f"Invalid player data format (too few fields): {player}")
            continue
        name = player[0]
        if not name or not isinstance(name, str):
            logger.warning(f"Invalid player name: {player}")
            continue
        validated_data.append(player)
    return validated_data

# ----------------------------------------------------------------------
# INSERT HELPERS
# ----------------------------------------------------------------------
def insert_teams(conn, teams_data):
    """Insert team data with validation."""
    validated_data = validate_team_data(teams_data)
    if not validated_data:
        logger.warning("No valid team data to insert")
        return
        
    query = """
        INSERT INTO teams (name, city, abbreviation)
        VALUES (%s, %s, %s)
        ON CONFLICT (abbreviation) DO UPDATE SET
            name = EXCLUDED.name,
            city = EXCLUDED.city;
    """
    try:
        with conn.cursor() as cur:
            execute_batch(cur, query, validated_data)
        logger.info(f"Inserted/Updated {len(validated_data)} teams")
    except psycopg2.Error as e:
        logger.error(f"Error inserting teams: {e}")
        raise

def insert_players(conn, players_data):
    """Insert player data with validation."""
    validated_data = validate_player_data(players_data)
    if not validated_data:
        logger.warning("No valid player data to insert")
        return
        
    query = """
        INSERT INTO players (
            name, position, jersey_number, team_id, is_starter, games_played, minutes_per_game, 
            points, rebounds, assists, steals, blocks, turnovers,
            field_goal_percentage, three_point_percentage, free_throw_percentage,
            offensive_rebounds, defensive_rebounds,
            field_goals_made, field_goals_attempted,
            three_pointers_made, three_pointers_attempted,
            free_throws_made, free_throws_attempted,
            plus_minus, fantasy_points, double_doubles, triple_doubles, personal_fouls,
            age, height, weight,
            efficiency_rating, true_shooting_percentage, effective_field_goal_percentage,
            assist_to_turnover_ratio, impact_score, usage_rate, player_efficiency_rating
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (name) DO UPDATE SET
            position = EXCLUDED.position,
            jersey_number = EXCLUDED.jersey_number,
            team_id = EXCLUDED.team_id,
            is_starter = EXCLUDED.is_starter,
            games_played = EXCLUDED.games_played,
            minutes_per_game = EXCLUDED.minutes_per_game,
            points = EXCLUDED.points,
            rebounds = EXCLUDED.rebounds,
            assists = EXCLUDED.assists,
            steals = EXCLUDED.steals,
            blocks = EXCLUDED.blocks,
            turnovers = EXCLUDED.turnovers,
            field_goal_percentage = EXCLUDED.field_goal_percentage,
            three_point_percentage = EXCLUDED.three_point_percentage,
            free_throw_percentage = EXCLUDED.free_throw_percentage,
            offensive_rebounds = EXCLUDED.offensive_rebounds,
            defensive_rebounds = EXCLUDED.defensive_rebounds,
            field_goals_made = EXCLUDED.field_goals_made,
            field_goals_attempted = EXCLUDED.field_goals_attempted,
            three_pointers_made = EXCLUDED.three_pointers_made,
            three_pointers_attempted = EXCLUDED.three_pointers_attempted,
            free_throws_made = EXCLUDED.free_throws_made,
            free_throws_attempted = EXCLUDED.free_throws_attempted,
            plus_minus = EXCLUDED.plus_minus,
            fantasy_points = EXCLUDED.fantasy_points,
            double_doubles = EXCLUDED.double_doubles,
            triple_doubles = EXCLUDED.triple_doubles,
            personal_fouls = EXCLUDED.personal_fouls,
            age = EXCLUDED.age,
            height = EXCLUDED.height,
            weight = EXCLUDED.weight,
            efficiency_rating = EXCLUDED.efficiency_rating,
            true_shooting_percentage = EXCLUDED.true_shooting_percentage,
            effective_field_goal_percentage = EXCLUDED.effective_field_goal_percentage,
            assist_to_turnover_ratio = EXCLUDED.assist_to_turnover_ratio,
            impact_score = EXCLUDED.impact_score,
            usage_rate = EXCLUDED.usage_rate,
            player_efficiency_rating = EXCLUDED.player_efficiency_rating;
    """
    try:
        with conn.cursor() as cur:
            execute_batch(cur, query, validated_data)
        logger.info(f"Inserted/Updated {len(validated_data)} players")
    except psycopg2.Error as e:
        logger.error(f"Error inserting players: {e}")
        raise

def insert_games(conn, games_data):
    """Insert game data with validation."""
    if not games_data:
        logger.warning("No game data to insert")
        return
        
    query = """
        INSERT INTO games (game_date, home_team_id, away_team_id, home_score, away_score)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (game_date, home_team_id, away_team_id) DO UPDATE SET
            home_score = EXCLUDED.home_score,
            away_score = EXCLUDED.away_score
        RETURNING id;
    """
    game_ids = []
    nba_game_ids = []
    try:
        with conn.cursor() as cur:
            for game_data in games_data:
                # game_data is (nba_game_id, game_date, home_team_id, away_team_id, home_score, away_score)
                nba_game_ids.append(game_data[0])
                # Insert only the database fields (skip nba_game_id)
                cur.execute(query, game_data[1:])
                game_id = cur.fetchone()[0]
                game_ids.append(game_id)
        conn.commit()
        logger.info(f"Inserted/Updated {len(games_data)} games")
        return game_ids, nba_game_ids
    except psycopg2.Error as e:
        logger.error(f"Error inserting games: {e}")
        raise

def insert_box_scores(conn, box_scores_data):
    """Insert box score data with validation."""
    if not box_scores_data:
        logger.warning("No box score data to insert")
        return
        
    query = """
        INSERT INTO box_scores (
            game_id, player_id, team_id, minutes_played, points, rebounds, assists,
            steals, blocks, turnovers, field_goals_made, field_goals_attempted,
            three_pointers_made, three_pointers_attempted, free_throws_made,
            free_throws_attempted, plus_minus, is_starter
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (game_id, player_id) DO UPDATE SET
            minutes_played = EXCLUDED.minutes_played,
            points = EXCLUDED.points,
            rebounds = EXCLUDED.rebounds,
            assists = EXCLUDED.assists,
            steals = EXCLUDED.steals,
            blocks = EXCLUDED.blocks,
            turnovers = EXCLUDED.turnovers,
            field_goals_made = EXCLUDED.field_goals_made,
            field_goals_attempted = EXCLUDED.field_goals_attempted,
            three_pointers_made = EXCLUDED.three_pointers_made,
            three_pointers_attempted = EXCLUDED.three_pointers_attempted,
            free_throws_made = EXCLUDED.free_throws_made,
            free_throws_attempted = EXCLUDED.free_throws_attempted,
            plus_minus = EXCLUDED.plus_minus,
            is_starter = EXCLUDED.is_starter;
    """
    try:
        with conn.cursor() as cur:
            execute_batch(cur, query, box_scores_data)
        conn.commit()
        logger.info(f"Inserted/Updated {len(box_scores_data)} box score entries")
    except psycopg2.Error as e:
        logger.error(f"Error inserting box scores: {e}")
        raise

# ----------------------------------------------------------------------
# NBA API DATA FETCHING FUNCTIONS
# ----------------------------------------------------------------------
def get_team_standings(season_year):
    """Fetch team standings using NBA API."""
    # NBA API uses season format like "2024-25"
    season_str = f"{season_year-1}-{str(season_year)[-2:]}"
    logger.info(f"Fetching standings for season {season_str}...")
    
    standings = leaguestandings.LeagueStandings(season=season_str, timeout=120)
    standings_df = standings.get_data_frames()[0]
    
    # Get team abbreviations from static teams - this has the CORRECT abbreviations
    all_teams = teams.get_teams()
    # Create mapping from team name to full team info
    team_name_to_info = {}
    for team in all_teams:
        team_name_to_info[team['full_name']] = team
        team_name_to_info[team['nickname']] = team
    
    teams_data = []
    for _, row in standings_df.iterrows():
        team_name = row['TeamName']
        
        # Try to find the matching team info
        team_info = None
        # First try exact match on full name
        if team_name in team_name_to_info:
            team_info = team_name_to_info[team_name]
        else:
            # Try to find by matching any part of the name
            for api_team in all_teams:
                if api_team['nickname'] in team_name or team_name in api_team['full_name']:
                    team_info = api_team
                    break
        
        if team_info:
            name = team_info['full_name']
            city = team_info['city']
            abbrev = team_info['abbreviation']
        else:
            # Fallback
            name = team_name
            city = None
            abbrev = team_name[:3].upper()
            logger.warning(f"Could not find full info for {team_name}, using defaults")
        
        teams_data.append((
            name,      # Full team name
            city,      # City
            abbrev     # Team abbreviation
        ))
    
    return teams_data

def get_player_positions(season_year, player_ids_dict=None):
    """Get player positions and physical stats by fetching all team rosters, with fallback to CommonPlayerInfo."""
    season_str = f"{season_year-1}-{str(season_year)[-2:]}"
    logger.info(f"Fetching player positions from team rosters...")
    
    all_teams = teams.get_teams()
    player_positions = {}
    player_physical_stats = {}  # Store height, weight, age
    
    for i, team in enumerate(all_teams):
        try:
            # Rate limiting - wait between API calls
            if i > 0:
                time.sleep(0.6)  # NBA API rate limit
            
            roster = commonteamroster.CommonTeamRoster(
                season=season_str,
                team_id=team['id'],
                timeout=120
            )
            roster_df = roster.get_data_frames()[0]
            
            for _, player_row in roster_df.iterrows():
                player_name = player_row.get('PLAYER')
                position = normalize_position(player_row.get('POSITION'))
                if player_name and position:
                    player_positions[player_name] = position
                
                # Store physical stats if available
                if player_name:
                    # Store with original name AND normalized name (without periods/spaces)
                    stats_dict = {
                        'height': player_row.get('HEIGHT'),
                        'weight': safe_int(player_row.get('WEIGHT')),
                        'age': safe_int(player_row.get('AGE')),
                        'jersey_number': safe_int(player_row.get('NUM'))
                    }
                    player_physical_stats[player_name] = stats_dict
                    # Also store with normalized name for better matching
                    normalized_name = player_name.replace('.', '').replace(' ', '').lower()
                    player_physical_stats[normalized_name] = stats_dict
            
            logger.debug(f"Fetched roster for {team['abbreviation']} ({len(roster_df)} players)")
            
        except Exception as e:
            logger.warning(f"Failed to fetch roster for {team['full_name']}: {e}")
            continue
    
    logger.info(f"Retrieved positions for {len(player_positions)} players from rosters")
    
    # Fallback: Use CommonPlayerInfo for players not in rosters
    if player_ids_dict:
        missing_count = 0
        logger.info(f"Fetching positions for players not in current rosters...")
        
        for player_name, player_id in player_ids_dict.items():
            if player_name not in player_positions:
                try:
                    time.sleep(0.6)  # Rate limiting
                    player_info = commonplayerinfo.CommonPlayerInfo(player_id=player_id, timeout=120)
                    info_df = player_info.get_data_frames()[0]
                    
                    if not info_df.empty:
                        position = normalize_position(info_df.iloc[0].get('POSITION'))
                        if position:
                            player_positions[player_name] = position
                            missing_count += 1
                        
                        # Also get physical stats
                        player_physical_stats[player_name] = {
                            'height': info_df.iloc[0].get('HEIGHT'),
                            'weight': safe_int(info_df.iloc[0].get('WEIGHT')),
                            'age': None  # Age not reliably available in CommonPlayerInfo
                        }
                            
                except Exception as e:
                    logger.debug(f"Could not fetch position for {player_name}: {e}")
                    continue
        
        if missing_count > 0:
            logger.info(f"Retrieved {missing_count} additional positions using CommonPlayerInfo")
    
    logger.info(f"Total positions retrieved: {len(player_positions)}")
    return player_positions, player_physical_stats

def get_all_players_info(season_year, conn):
    """Get list of all NBA players with their stats."""
    season_str = f"{season_year-1}-{str(season_year)[-2:]}"
    logger.info(f"Fetching player stats for season {season_str}...")
    
    try:
        # Get team ID mapping
        team_id_map = get_team_id_mapping(conn)
        
        # Get all NBA teams to map API team IDs to abbreviations
        all_teams = teams.get_teams()
        nba_team_id_to_abbrev = {team['id']: team['abbreviation'] for team in all_teams}
        
        # Fetch player stats from NBA API first to get player IDs
        player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season_str,
            season_type_all_star='Regular Season',
            per_mode_detailed='PerGame',
            timeout=120
        )
        stats_df = player_stats.get_data_frames()[0]
        
        if stats_df.empty:
            logger.warning("No player stats found")
            return []
        
        # Create a mapping of player names to IDs for fallback position lookup
        player_ids_dict = {row['PLAYER_NAME']: row['PLAYER_ID'] for _, row in stats_df.iterrows()}
        
        # Get player positions and physical stats from team rosters with fallback to CommonPlayerInfo
        player_positions, player_physical_stats = get_player_positions(season_year, player_ids_dict)
        
        players_data = []
        
        for _, row in stats_df.iterrows():
            # Get player basic info
            player_name = row['PLAYER_NAME']
            
            # Map team ID to database team ID
            nba_team_id = row.get('TEAM_ID')
            team_abbrev = nba_team_id_to_abbrev.get(nba_team_id)
            db_team_id = team_id_map.get(team_abbrev) if team_abbrev else None
            
            # Get position from roster data or fallback
            position = player_positions.get(player_name)
            
            # Extract basic stats with safe conversion
            games_played = safe_int(row.get('GP'))
            minutes_per_game = safe_float(row.get('MIN'))
            points = safe_float(row.get('PTS'))
            rebounds = safe_float(row.get('REB'))
            assists = safe_float(row.get('AST'))
            steals = safe_float(row.get('STL'))
            blocks = safe_float(row.get('BLK'))
            turnovers = safe_float(row.get('TOV'))
            field_goal_pct = safe_float(row.get('FG_PCT'))
            three_point_pct = safe_float(row.get('FG3_PCT'))
            free_throw_pct = safe_float(row.get('FT_PCT'))
            
            # Extract shooting details
            offensive_rebounds = safe_float(row.get('OREB'))
            defensive_rebounds = safe_float(row.get('DREB'))
            field_goals_made = safe_float(row.get('FGM'))
            field_goals_attempted = safe_float(row.get('FGA'))
            three_pointers_made = safe_float(row.get('FG3M'))
            three_pointers_attempted = safe_float(row.get('FG3A'))
            free_throws_made = safe_float(row.get('FTM'))
            free_throws_attempted = safe_float(row.get('FTA'))
            
            # Extract advanced metrics
            plus_minus = safe_float(row.get('PLUS_MINUS'))
            fantasy_points = safe_float(row.get('NBA_FANTASY_PTS'))
            double_doubles = safe_int(row.get('DD2'))
            triple_doubles = safe_int(row.get('TD3'))
            personal_fouls = safe_float(row.get('PF'))
            
            # Extract player info (age from API, height/weight from cached roster data)
            age = safe_int(row.get('AGE'))
            
            # Get height and weight from cached physical stats (already fetched during roster calls)
            # Try exact match first, then try normalized name
            physical_stats = player_physical_stats.get(player_name, {})
            if not physical_stats:
                # Try normalized name (remove periods and spaces, lowercase)
                normalized_name = player_name.replace('.', '').replace(' ', '').lower()
                physical_stats = player_physical_stats.get(normalized_name, {})
            
            height = physical_stats.get('height')
            weight = physical_stats.get('weight')
            jersey_number = physical_stats.get('jersey_number')
            # If age not in API stats, use roster age
            if age is None:
                age = physical_stats.get('age')
            
            # Calculate advanced metrics
            calculated_metrics = calculate_advanced_metrics(row)
            
            players_data.append((
                player_name,
                position,
                jersey_number,
                db_team_id,
                False,  # is_starter - will be updated by update_starter_status.py
                games_played,
                minutes_per_game,
                points,
                rebounds,
                assists,
                steals,
                blocks,
                turnovers,
                field_goal_pct,
                three_point_pct,
                free_throw_pct,
                offensive_rebounds,
                defensive_rebounds,
                field_goals_made,
                field_goals_attempted,
                three_pointers_made,
                three_pointers_attempted,
                free_throws_made,
                free_throws_attempted,
                plus_minus,
                fantasy_points,
                double_doubles,
                triple_doubles,
                personal_fouls,
                age,
                height,
                weight,
                calculated_metrics['efficiency_rating'],
                calculated_metrics['true_shooting_percentage'],
                calculated_metrics['effective_field_goal_percentage'],
                calculated_metrics['assist_to_turnover_ratio'],
                calculated_metrics['impact_score'],
                calculated_metrics['usage_rate'],
                calculated_metrics['player_efficiency_rating']
            ))
        
        logger.info(f"Found {len(players_data)} players with stats")
        return players_data
        
    except Exception as e:
        logger.error(f"Error fetching player stats: {e}")
        return []

def get_team_id_mapping(conn):
    """Get mapping of team abbreviations to database IDs."""
    team_map = {}
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, abbreviation, name FROM teams")
            for row in cur.fetchall():
                team_id, abbrev, name = row
                if abbrev:
                    team_map[abbrev] = team_id
                if name:
                    team_map[name] = team_id  # Also map full name
    except Exception as e:
        logger.error(f"Error fetching team mapping: {e}")
    return team_map

def get_recent_games(season_year, conn, limit=None):
    """Get games from the season with team IDs. If limit is None, gets all games."""
    season_str = f"{season_year-1}-{str(season_year)[-2:]}"
    logger.info(f"Fetching games for season {season_str}...")
    
    try:
        # Get team ID mapping from database
        team_id_map = get_team_id_mapping(conn)
        
        # Get all NBA teams to map team IDs to abbreviations
        all_teams = teams.get_teams()
        nba_team_abbrev_map = {team['id']: team['abbreviation'] for team in all_teams}
        
        # Use LeagueGameFinder to get games
        game_finder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season_str,
            season_type_nullable='Regular Season',
            timeout=120
        )
        games_df = game_finder.get_data_frames()[0]
        
        if games_df.empty:
            logger.warning("No games found for this season")
            return []
        
        # Sort by date descending to get most recent games from the season
        games_df['GAME_DATE'] = pd.to_datetime(games_df['GAME_DATE'])
        games_df = games_df.sort_values('GAME_DATE', ascending=False)
        
        # Group by game to get unique games
        games_data = []
        seen_game_ids = set()
        
        for _, row in games_df.iterrows():
            game_id = row['GAME_ID']
            
            if game_id not in seen_game_ids:
                seen_game_ids.add(game_id)
                
                # Get both teams for this game
                game_rows = games_df[games_df['GAME_ID'] == game_id]
                
                if len(game_rows) >= 2:
                    row1 = game_rows.iloc[0]
                    row2 = game_rows.iloc[1]
                    
                    # Map team IDs to database IDs using abbreviations
                    team1_abbrev = nba_team_abbrev_map.get(row1['TEAM_ID'], None)
                    team2_abbrev = nba_team_abbrev_map.get(row2['TEAM_ID'], None)
                    
                    team1_db_id = team_id_map.get(team1_abbrev)
                    team2_db_id = team_id_map.get(team2_abbrev)
                    
                    # Determine home/away based on matchup string if available
                    # In NBA API, the home team is typically the second one or can be inferred from MATCHUP
                    # MATCHUP format is usually "TEAM @ TEAM" where @ indicates away team
                    matchup = row1.get('MATCHUP', '')
                    if '@' in matchup:
                        # row1 is away team, row2 is home team
                        home_team_id = team2_db_id
                        away_team_id = team1_db_id
                        home_score = int(row2['PTS'])
                        away_score = int(row1['PTS'])
                    else:
                        # row1 is home team, row2 is away team
                        home_team_id = team1_db_id
                        away_team_id = team2_db_id
                        home_score = int(row1['PTS'])
                        away_score = int(row2['PTS'])
                    
                    games_data.append((
                        game_id,  # NBA game ID
                        row1['GAME_DATE'].date(),
                        home_team_id,
                        away_team_id,
                        home_score,
                        away_score
                    ))
                
                # Only break if limit is set
                if limit and len(games_data) >= limit:
                    break
        
        logger.info(f"Found {len(games_data)} games from season {season_str}")
        return games_data
    
    except Exception as e:
        logger.error(f"Error fetching games: {e}")
        return []

def get_box_scores_for_game(nba_game_id, db_game_id, conn, max_retries=3):
    """Fetch box scores for a specific game from NBA API with retry logic."""
    
    for attempt in range(max_retries):
        try:
            # Exponential backoff for rate limiting
            if attempt > 0:
                wait_time = 2 ** attempt  # 2, 4, 8 seconds
                logger.debug(f"Retry {attempt + 1}/{max_retries} for game {nba_game_id}, waiting {wait_time}s")
                time.sleep(wait_time)
            else:
                time.sleep(0.8)  # Increased base rate limit
            
            box_score = boxscoretraditionalv2.BoxScoreTraditionalV2(
                game_id=nba_game_id,
                timeout=120
            )
            player_stats = box_score.get_data_frames()[0]
            
            if player_stats.empty:
                logger.debug(f"No box score data for game {nba_game_id}")
                return []
            
            # Get player name to database ID mapping
            with conn.cursor() as cur:
                cur.execute("SELECT id, name FROM players")
                player_name_to_id = {row[1]: row[0] for row in cur.fetchall()}
                
                # Get team abbreviation to ID mapping
                cur.execute("SELECT id, abbreviation FROM teams")
                team_abbrev_to_id = {row[1]: row[0] for row in cur.fetchall()}
            
            # Get NBA team ID to abbreviation mapping
            all_teams = teams.get_teams()
            nba_team_id_to_abbrev = {team['id']: team['abbreviation'] for team in all_teams}
            
            box_scores_data = []
            
            for _, row in player_stats.iterrows():
                player_name = row['PLAYER_NAME']
                player_db_id = player_name_to_id.get(player_name)
                
                if not player_db_id:
                    logger.debug(f"Player not found in database: {player_name}")
                    continue
                
                # Get team database ID
                nba_team_id = row['TEAM_ID']
                team_abbrev = nba_team_id_to_abbrev.get(nba_team_id)
                team_db_id = team_abbrev_to_id.get(team_abbrev)
                
                if not team_db_id:
                    logger.debug(f"Team not found for player {player_name}")
                    continue
                
                # Extract stats
                minutes = row.get('MIN')
                is_starter = str(row.get('START_POSITION', '')).strip() != ''
                
                box_score_entry = (
                    db_game_id,
                    player_db_id,
                    team_db_id,
                    minutes,
                    safe_int(row.get('PTS')),
                    safe_int(row.get('REB')),
                    safe_int(row.get('AST')),
                    safe_int(row.get('STL')),
                    safe_int(row.get('BLK')),
                    safe_int(row.get('TO')),
                    safe_int(row.get('FGM')),
                    safe_int(row.get('FGA')),
                    safe_int(row.get('FG3M')),
                    safe_int(row.get('FG3A')),
                    safe_int(row.get('FTM')),
                    safe_int(row.get('FTA')),
                    safe_int(row.get('PLUS_MINUS')),
                    is_starter
                )
                box_scores_data.append(box_score_entry)
            
            return box_scores_data
            
        except (ConnectionError, TimeoutError, Exception) as e:
            error_msg = str(e)
            if attempt < max_retries - 1:
                # Retry on connection/timeout errors
                if 'timeout' in error_msg.lower() or 'connection' in error_msg.lower():
                    logger.warning(f"Attempt {attempt + 1} failed for game {nba_game_id}: {error_msg}")
                    continue
            # Final attempt or non-retryable error
            logger.warning(f"Error fetching box score for game {nba_game_id} after {attempt + 1} attempts: {e}")
            return []
    
    return []  # All retries exhausted

# ----------------------------------------------------------------------
# STARTER STATUS UPDATE
# ----------------------------------------------------------------------
def update_starter_status(conn, season_year, num_games=50):
    """
    Determine and update which players are starters based on recent games.
    Uses boxscore START_POSITION field to identify starters.
    """
    logger.info(f"Updating starter status from recent {num_games} games...")
    
    try:
        # Get recent game IDs
        season_str = f"{season_year-1}-{str(season_year)[-2:]}"
        game_finder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season_str,
            season_type_nullable='Regular Season',
            timeout=120
        )
        games_df = game_finder.get_data_frames()[0]
        
        if games_df.empty:
            logger.warning("No games found for starter analysis")
            return
        
        game_ids = games_df['GAME_ID'].unique()[:num_games]
        logger.info(f"Analyzing {len(game_ids)} games for starter information...")
        
        # Track starter counts
        starter_counts = {}
        games_analyzed = 0
        
        for i, game_id in enumerate(game_ids):
            try:
                # Rate limiting
                if i > 0 and i % 10 == 0:
                    logger.info(f"Processed {i}/{len(game_ids)} games...")
                    time.sleep(2)
                elif i > 0:
                    time.sleep(0.6)
                
                # Fetch boxscore
                boxscore = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id, timeout=120)
                player_stats = boxscore.get_data_frames()[0]
                
                if player_stats.empty:
                    continue
                
                games_analyzed += 1
                
                # Check each player's START_POSITION
                for _, row in player_stats.iterrows():
                    player_name = row.get('PLAYER_NAME')
                    start_position = row.get('START_POSITION', '')
                    
                    if player_name:
                        if player_name not in starter_counts:
                            starter_counts[player_name] = {'started': 0, 'total': 0}
                        
                        starter_counts[player_name]['total'] += 1
                        # START_POSITION is non-empty for starters (e.g., 'F', 'C', 'G')
                        if start_position and start_position.strip():
                            starter_counts[player_name]['started'] += 1
                
            except Exception as e:
                logger.warning(f"Error processing game {game_id}: {e}")
                continue
        
        logger.info(f"Analyzed {games_analyzed} games, found data for {len(starter_counts)} players")
        
        # Determine starters (>=70% of games started, min 3 games)
        threshold = 0.7
        min_games = 3
        
        # First, set all players to non-starter
        with conn.cursor() as cur:
            cur.execute("UPDATE players SET is_starter = FALSE")
        
        # Update starters
        starters_to_update = []
        for player_name, counts in starter_counts.items():
            if counts['total'] >= min_games:
                starter_percentage = counts['started'] / counts['total']
                if starter_percentage >= threshold:
                    starters_to_update.append((player_name,))
        
        if starters_to_update:
            with conn.cursor() as cur:
                execute_batch(cur, 
                    "UPDATE players SET is_starter = TRUE WHERE name = %s",
                    starters_to_update
                )
        
        conn.commit()
        
        # Report results
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM players WHERE is_starter = TRUE")
            starter_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM players")
            total_count = cur.fetchone()[0]
        
        logger.info(f"✅ Updated starter status: {starter_count} starters out of {total_count} players")
        
    except Exception as e:
        logger.error(f"Error updating starter status: {e}")
        if conn:
            conn.rollback()
        raise

# ----------------------------------------------------------------------
# MAIN SCRAPER LOGIC
# ----------------------------------------------------------------------
def scrape_and_store():
    """Main scraping function with comprehensive error handling."""
    conn = None
    try:
        conn = get_connection()
        
        # --- 1. Team standings (for records) ---
        logger.info("Fetching team standings...")
        try:
            teams_data = get_team_standings(SEASON_END_YEAR)
            insert_teams(conn, teams_data)
            conn.commit()
            logger.info(f"✅ Team records updated - {len(teams_data)} teams")
        except Exception as e:
            logger.error(f"Failed to fetch/insert team standings: {e}")
            if conn:
                conn.rollback()
            raise

        # --- 2. Player information ---
        logger.info("Fetching player information...")
        try:
            players_data = get_all_players_info(SEASON_END_YEAR, conn)
            insert_players(conn, players_data)
            conn.commit()
            logger.info(f"✅ Inserted {len(players_data)} players")
        except Exception as e:
            logger.error(f"Failed to fetch/insert players: {e}")
            if conn:
                conn.rollback()
            # Continue without failing completely
            logger.warning("Continuing without complete player data...")

        # --- 3. All games from the season ---
        logger.info("Fetching all games from the season...")
        try:
            games_data = get_recent_games(SEASON_END_YEAR, conn, limit=None)  # No limit = all games
            if games_data:
                game_ids, nba_game_ids = insert_games(conn, games_data)
                conn.commit()
                logger.info(f"✅ Inserted {len(games_data)} games")
                
                # Filter to only completed games (where home_score and away_score are not None)
                completed_games = [
                    (db_id, nba_id) for db_id, nba_id, game_tuple in zip(game_ids, nba_game_ids, games_data)
                    if game_tuple[4] is not None and game_tuple[5] is not None  # home_score and away_score
                ]
                
                # --- 3a. Fetch box scores for each completed game ---
                # RESUME FROM SPECIFIC GAME (set to 0 to start from beginning)
                START_FROM_GAME = 1356  # Resume from game 1357 (0-indexed, so 1356)
                
                logger.info(f"Fetching box scores for {len(completed_games)} completed games (out of {len(games_data)} total)...")
                if START_FROM_GAME > 0:
                    logger.info(f"⚠️  RESUMING from game {START_FROM_GAME + 1} (skipping first {START_FROM_GAME} games)")
                logger.info(f"⏱️  This will take approximately {(len(completed_games) - START_FROM_GAME) * 1.5 / 60:.1f} minutes with rate limiting...")
                box_scores_inserted = 0
                failed_games = 0
                
                for i, (db_game_id, nba_game_id) in enumerate(completed_games):
                    # Skip games before START_FROM_GAME
                    if i < START_FROM_GAME:
                        continue
                    
                    try:
                        # Progress indicator every 50 games
                        if i > 0 and i % 50 == 0:
                            logger.info(f"  Progress: {i}/{len(completed_games)} games processed ({box_scores_inserted} box scores inserted, {failed_games} failures)")
                        
                        box_scores = get_box_scores_for_game(nba_game_id, db_game_id, conn, max_retries=3)
                        if box_scores:
                            insert_box_scores(conn, box_scores)
                            conn.commit()
                            box_scores_inserted += len(box_scores)
                            if (i + 1) % 10 == 0:  # Log every 10th successful game
                                logger.info(f"  Game {i+1}/{len(completed_games)}: Inserted {len(box_scores)} box scores")
                        else:
                            failed_games += 1
                            if (i + 1) % 20 == 0:  # Log failures less frequently
                                logger.debug(f"  Game {i+1}/{len(completed_games)}: No box scores found")
                    except Exception as e:
                        failed_games += 1
                        logger.error(f"  Game {i+1}/{len(completed_games)} (NBA ID: {nba_game_id}): Failed to fetch box scores - {e}")
                        if conn:
                            conn.rollback()
                        continue
                
                logger.info(f"✅ Inserted {box_scores_inserted} total box scores across {len(completed_games)} completed games")
            else:
                logger.warning("No games found for this season")
        except Exception as e:
            logger.error(f"Failed to fetch/insert games: {e}")
            if conn:
                conn.rollback()
            # Continue without failing completely
            logger.warning("Continuing without game data...")

        # --- 4. Update starter status ---
        logger.info("Updating player starter status...")
        try:
            update_starter_status(conn, SEASON_END_YEAR, num_games=50)
        except Exception as e:
            logger.error(f"Failed to update starter status: {e}")
            if conn:
                conn.rollback()
            # Continue without failing completely
            logger.warning("Continuing without starter status updates...")

        logger.info("✅ All core data loaded successfully.")

    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

# ----------------------------------------------------------------------
if __name__ == "__main__":
    try:
        scrape_and_store()
    except Exception as e:
        logger.error(f"Script failed: {e}")
