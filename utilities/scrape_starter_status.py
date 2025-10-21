"""
NBA Starter Status Scraper
===========================
A dedicated scraper to fetch and update NBA player starter information.

This script:
1. Fetches recent NBA games from the current season
2. Analyzes box scores to identify which players are starters
3. Updates the is_starter boolean field in the players table

A player is considered a starter if they started in >= 70% of their recent games
(minimum 3 games played to be considered).
"""

import time
import datetime
import logging
import psycopg2
from psycopg2.extras import execute_batch
from nba_api.stats.endpoints import leaguegamefinder, boxscoretraditionalv2
from nba_api.stats.static import teams

# ============================================================================
# CONFIGURATION
# ============================================================================
DB_CONFIG = {
    'dbname': 'nba_stats_db',
    'user': 'postgres',
    'password': '1738',
    'host': 'localhost',
    'port': '5432'
}

# Starter determination thresholds
STARTER_THRESHOLD = 0.70  # 70% of games must be started
MIN_GAMES_THRESHOLD = 3   # Minimum games to determine starter status
NUM_GAMES_TO_ANALYZE = 50 # Number of recent games to analyze

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("starter_scraper")

# ============================================================================
# DATABASE CONNECTION
# ============================================================================
def get_connection():
    """Create and return a database connection with error handling."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        logger.info("✅ Database connection established")
        return conn
    except psycopg2.Error as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise

# ============================================================================
# SEASON HELPER
# ============================================================================
def get_current_season_year():
    """
    Get the most recently completed NBA season's end year.
    NBA seasons run from October to April.
    
    For example:
    - In October 2025: The 2024-25 season just ended in April 2025 (returns 2025)
    - In November 2025: The 2024-25 season is most recent completed (returns 2025)
    
    We always look at the most recently completed season to ensure we have data.
    """
    today = datetime.date.today()
    year = today.year
    month = today.month
    
    # If we're before July (season ended in April), the completed season is this year
    # If we're July or later (offseason), the completed season ended earlier this year
    if month <= 6:
        return year
    else:
        # During offseason (July-December), use the season that ended in the spring of this year
        return year

# ============================================================================
# NBA API DATA FETCHING
# ============================================================================
def fetch_recent_game_ids(season_year, limit=NUM_GAMES_TO_ANALYZE):
    """
    Fetch recent game IDs from the current NBA season.
    
    Args:
        season_year: The year the season ends (e.g., 2025 for 2024-25 season)
        limit: Maximum number of games to fetch
        
    Returns:
        List of NBA game IDs (strings)
    """
    season_str = f"{season_year-1}-{str(season_year)[-2:]}"
    logger.info(f"📅 Fetching games for season {season_str}...")
    
    try:
        # Fetch games using NBA API
        game_finder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season_str,
            season_type_nullable='Regular Season'
        )
        games_df = game_finder.get_data_frames()[0]
        
        if games_df.empty:
            logger.warning("⚠️  No games found for this season")
            return []
        
        # Get unique game IDs and limit the number
        game_ids = games_df['GAME_ID'].unique()[:limit]
        logger.info(f"✅ Found {len(game_ids)} games to analyze")
        
        return list(game_ids)
        
    except Exception as e:
        logger.error(f"❌ Error fetching games: {e}")
        return []

def fetch_box_score_starter_info(game_id):
    """
    Fetch box score for a single game and extract starter information.
    
    Args:
        game_id: NBA game ID string
        
    Returns:
        List of tuples: [(player_name, is_starter), ...]
    """
    try:
        # Fetch box score from NBA API
        boxscore = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
        player_stats = boxscore.get_data_frames()[0]
        
        if player_stats.empty:
            logger.debug(f"No box score data for game {game_id}")
            return []
        
        starter_info = []
        
        for _, row in player_stats.iterrows():
            player_name = row.get('PLAYER_NAME')
            start_position = row.get('START_POSITION', '')
            
            if not player_name:
                continue
            
            # START_POSITION contains position abbreviation (e.g., 'F', 'C', 'G') for starters
            # Empty or None for bench players
            is_starter = bool(start_position and str(start_position).strip())
            
            starter_info.append((player_name, is_starter))
        
        return starter_info
        
    except Exception as e:
        logger.warning(f"⚠️  Error fetching box score for game {game_id}: {e}")
        return []

def analyze_starter_status_from_games(game_ids):
    """
    Analyze multiple games to determine which players are regular starters.
    
    Args:
        game_ids: List of NBA game ID strings
        
    Returns:
        Dictionary: {player_name: {'started': int, 'total': int}}
    """
    starter_counts = {}
    games_analyzed = 0
    
    logger.info(f"🔍 Analyzing {len(game_ids)} games for starter information...")
    logger.info("This may take a few minutes due to API rate limiting...")
    
    for i, game_id in enumerate(game_ids):
        # Rate limiting to respect NBA API guidelines
        if i > 0:
            if i % 10 == 0:
                logger.info(f"  Progress: {i}/{len(game_ids)} games analyzed ({games_analyzed} successful)")
                time.sleep(2)  # Longer pause every 10 games
            else:
                time.sleep(0.6)  # Standard pause between requests
        
        # Fetch and process box score
        starter_info = fetch_box_score_starter_info(game_id)
        
        if not starter_info:
            continue
        
        games_analyzed += 1
        
        # Update starter counts for each player
        for player_name, is_starter in starter_info:
            if player_name not in starter_counts:
                starter_counts[player_name] = {'started': 0, 'total': 0}
            
            starter_counts[player_name]['total'] += 1
            if is_starter:
                starter_counts[player_name]['started'] += 1
    
    logger.info(f"✅ Successfully analyzed {games_analyzed} games")
    logger.info(f"✅ Found data for {len(starter_counts)} unique players")
    
    return starter_counts

# ============================================================================
# STARTER DETERMINATION
# ============================================================================
def determine_starters(starter_counts, threshold=STARTER_THRESHOLD, min_games=MIN_GAMES_THRESHOLD):
    """
    Determine which players should be classified as starters.
    
    Args:
        starter_counts: Dictionary with player game counts
        threshold: Minimum percentage of games started to be a starter (0.0-1.0)
        min_games: Minimum number of games to be considered
        
    Returns:
        Dictionary: {player_name: bool (is_starter)}
    """
    starters = {}
    stats_summary = []
    
    for player_name, counts in starter_counts.items():
        # Skip players who haven't played enough games
        if counts['total'] < min_games:
            logger.debug(f"  {player_name}: Not enough games ({counts['total']} < {min_games})")
            continue
        
        # Calculate starter percentage
        starter_percentage = counts['started'] / counts['total']
        is_starter = starter_percentage >= threshold
        
        starters[player_name] = is_starter
        
        # Track for summary
        if is_starter:
            stats_summary.append({
                'name': player_name,
                'started': counts['started'],
                'total': counts['total'],
                'percentage': starter_percentage
            })
    
    # Summary statistics
    total_evaluated = len(starters)
    total_starters = sum(1 for is_starter in starters.values() if is_starter)
    
    logger.info(f"📊 Evaluation complete:")
    logger.info(f"   • Players evaluated: {total_evaluated}")
    logger.info(f"   • Identified as starters: {total_starters}")
    logger.info(f"   • Threshold: {threshold:.0%} of games started")
    logger.info(f"   • Minimum games: {min_games}")
    
    # Show top starters by percentage
    if stats_summary:
        stats_summary.sort(key=lambda x: x['percentage'], reverse=True)
        logger.info("\n📋 Sample of identified starters:")
        for player in stats_summary[:10]:
            logger.info(f"   • {player['name']}: {player['started']}/{player['total']} games ({player['percentage']:.1%})")
    
    return starters

# ============================================================================
# DATABASE UPDATE
# ============================================================================
def update_database_starter_status(starters):
    """
    Update the is_starter field in the players table.
    
    Args:
        starters: Dictionary of {player_name: is_starter (bool)}
    """
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        logger.info("💾 Updating database with starter status...")
        
        # Step 1: Reset all players to non-starter
        logger.info("   Resetting all players to non-starter...")
        cur.execute("UPDATE players SET is_starter = FALSE")
        
        # Step 2: Update identified starters
        starter_names = [(name,) for name, is_starter in starters.items() if is_starter]
        
        if starter_names:
            logger.info(f"   Updating {len(starter_names)} players to starter status...")
            query = """
                UPDATE players 
                SET is_starter = TRUE 
                WHERE name = %s
            """
            execute_batch(cur, query, starter_names)
        
        # Commit the transaction
        conn.commit()
        logger.info("   ✅ Changes committed to database")
        
        # Step 3: Verify the updates
        cur.execute("SELECT COUNT(*) FROM players WHERE is_starter = TRUE")
        updated_starters = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM players")
        total_players = cur.fetchone()[0]
        
        logger.info(f"\n📊 Database Update Summary:")
        logger.info(f"   • Total players in database: {total_players}")
        logger.info(f"   • Players marked as starters: {updated_starters}")
        logger.info(f"   • Players marked as bench: {total_players - updated_starters}")
        
        # Step 4: Show sample of updated starters
        cur.execute("""
            SELECT name, position, team_id, games_played
            FROM players 
            WHERE is_starter = TRUE 
            ORDER BY games_played DESC 
            LIMIT 15
        """)
        
        logger.info("\n📋 Sample of players marked as starters:")
        for row in cur.fetchall():
            name, position, team_id, games = row
            pos_str = position if position else "N/A"
            logger.info(f"   • {name:25} Pos: {pos_str:5} Games: {games}")
        
        cur.close()
        
        logger.info("\n✅ Database update completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error updating database: {e}")
        if conn:
            conn.rollback()
            logger.info("🔄 Changes rolled back")
        raise
    finally:
        if conn:
            conn.close()

# ============================================================================
# MAIN EXECUTION
# ============================================================================
def main():
    """Main execution function."""
    logger.info("="*80)
    logger.info("🏀 NBA STARTER STATUS SCRAPER")
    logger.info("="*80)
    logger.info("")
    
    start_time = time.time()
    
    try:
        # Determine current season
        season_year = get_current_season_year()
        season_str = f"{season_year-1}-{str(season_year)[-2:]}"
        logger.info(f"Current season: {season_str} (ending in {season_year})")
        logger.info("")
        
        # Step 1: Fetch recent game IDs
        logger.info("STEP 1: Fetching recent games")
        logger.info("-" * 80)
        game_ids = fetch_recent_game_ids(season_year, limit=NUM_GAMES_TO_ANALYZE)
        
        if not game_ids:
            logger.error("❌ No games found. Cannot proceed.")
            return
        logger.info("")
        
        # Step 2: Analyze box scores for starter information
        logger.info("STEP 2: Analyzing box scores")
        logger.info("-" * 80)
        starter_counts = analyze_starter_status_from_games(game_ids)
        
        if not starter_counts:
            logger.error("❌ No starter data collected. Cannot proceed.")
            return
        logger.info("")
        
        # Step 3: Determine who is a starter
        logger.info("STEP 3: Determining starter status")
        logger.info("-" * 80)
        starters = determine_starters(
            starter_counts, 
            threshold=STARTER_THRESHOLD,
            min_games=MIN_GAMES_THRESHOLD
        )
        logger.info("")
        
        # Step 4: Update database
        logger.info("STEP 4: Updating database")
        logger.info("-" * 80)
        update_database_starter_status(starters)
        logger.info("")
        
        # Calculate execution time
        elapsed_time = time.time() - start_time
        minutes = int(elapsed_time // 60)
        seconds = int(elapsed_time % 60)
        
        # Final summary
        logger.info("="*80)
        logger.info("✅ SCRAPER COMPLETED SUCCESSFULLY")
        logger.info("="*80)
        logger.info(f"⏱️  Total execution time: {minutes}m {seconds}s")
        logger.info(f"📊 Games analyzed: {len(game_ids)}")
        logger.info(f"👥 Players evaluated: {len(starters)}")
        logger.info(f"🌟 Starters identified: {sum(1 for is_starter in starters.values() if is_starter)}")
        logger.info("="*80)
        
    except Exception as e:
        logger.error("="*80)
        logger.error("❌ SCRAPER FAILED")
        logger.error("="*80)
        logger.error(f"Error: {e}")
        raise
    
    logger.info("\n🏁 Script execution finished")

if __name__ == "__main__":
    main()
