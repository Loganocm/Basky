"""
Update Starter Status for Players
Determines which players are starters based on recent NBA game data
Uses boxscoretraditionalv2 to check START_POSITION field
"""

import time
import logging
import psycopg2
from psycopg2.extras import execute_batch
from nba_api.stats.endpoints import leaguegamefinder, boxscoretraditionalv2
from nba_api.stats.static import teams

# Database config
DB_CONFIG = {
    'dbname': 'nba_stats_db',
    'user': 'postgres',
    'password': '1738',
    'host': 'localhost',
    'port': '5432'
}

# Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("starter_updater")

def get_connection():
    """Create and return a database connection"""
    try:
        return psycopg2.connect(**DB_CONFIG)
    except psycopg2.Error as e:
        logger.error(f"Database connection failed: {e}")
        raise

def get_recent_games(season_year=2025, limit=100):
    """Get recent game IDs from the current season"""
    season_str = f"{season_year-1}-{str(season_year)[-2:]}"
    logger.info(f"Fetching recent games for season {season_str}...")
    
    try:
        game_finder = leaguegamefinder.LeagueGameFinder(
            season_nullable=season_str,
            season_type_nullable='Regular Season'
        )
        games_df = game_finder.get_data_frames()[0]
        
        if games_df.empty:
            logger.warning("No games found")
            return []
        
        # Get unique game IDs
        game_ids = games_df['GAME_ID'].unique()[:limit]
        logger.info(f"Found {len(game_ids)} recent games")
        return game_ids
        
    except Exception as e:
        logger.error(f"Error fetching games: {e}")
        return []

def analyze_starter_status_from_games(game_ids):
    """
    Analyze boxscores from recent games to determine starter status
    Returns dict: {player_name: starter_count}
    """
    starter_counts = {}
    total_games_analyzed = 0
    
    logger.info(f"Analyzing {len(game_ids)} games for starter information...")
    
    for i, game_id in enumerate(game_ids):
        try:
            # Rate limiting
            if i > 0 and i % 10 == 0:
                logger.info(f"Processed {i}/{len(game_ids)} games...")
                time.sleep(2)
            elif i > 0:
                time.sleep(0.6)
            
            # Fetch boxscore
            boxscore = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
            player_stats = boxscore.get_data_frames()[0]
            
            if player_stats.empty:
                continue
            
            total_games_analyzed += 1
            
            # Check each player's START_POSITION
            for _, row in player_stats.iterrows():
                player_name = row.get('PLAYER_NAME')
                start_position = row.get('START_POSITION', '')
                
                if player_name and start_position:
                    # START_POSITION is non-empty for starters (e.g., 'F', 'C', 'G')
                    if player_name not in starter_counts:
                        starter_counts[player_name] = {'started': 0, 'total': 0}
                    
                    starter_counts[player_name]['total'] += 1
                    if start_position.strip():  # Non-empty = starter
                        starter_counts[player_name]['started'] += 1
            
        except Exception as e:
            logger.warning(f"Error processing game {game_id}: {e}")
            continue
    
    logger.info(f"Analyzed {total_games_analyzed} games successfully")
    logger.info(f"Found starter data for {len(starter_counts)} players")
    
    return starter_counts

def determine_starters(starter_counts, threshold=0.7, min_games=3):
    """
    Determine if a player is a starter based on percentage of games started
    threshold: minimum percentage of games started to be considered a starter
    min_games: minimum number of games played to be considered
    """
    starters = {}
    
    for player_name, counts in starter_counts.items():
        # Require a minimum number of games to determine starter status
        if counts['total'] < min_games:
            continue
            
        if counts['total'] > 0:
            starter_percentage = counts['started'] / counts['total']
            is_starter = starter_percentage >= threshold
            starters[player_name] = is_starter
            
            if is_starter:
                logger.debug(f"{player_name}: Starter ({counts['started']}/{counts['total']} = {starter_percentage:.1%})")
    
    starter_count = sum(1 for is_starter in starters.values() if is_starter)
    logger.info(f"Identified {starter_count} starters out of {len(starters)} players")
    
    return starters

def update_database(starters):
    """Update the is_starter field in the database"""
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        logger.info("Updating database with starter status...")
        
        # First, set all players to non-starter
        cur.execute("UPDATE players SET is_starter = FALSE")
        
        # Update starters
        update_data = [(name,) for name, is_starter in starters.items() if is_starter]
        
        if update_data:
            query = """
                UPDATE players 
                SET is_starter = TRUE 
                WHERE name = %s
            """
            execute_batch(cur, query, update_data)
        
        conn.commit()
        
        # Verify updates
        cur.execute("SELECT COUNT(*) FROM players WHERE is_starter = TRUE")
        starter_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM players")
        total_count = cur.fetchone()[0]
        
        logger.info(f"✅ Updated database: {starter_count} starters out of {total_count} total players")
        
        # Show some examples
        cur.execute("""
            SELECT name, position, is_starter 
            FROM players 
            WHERE is_starter = TRUE 
            ORDER BY name 
            LIMIT 10
        """)
        
        logger.info("Sample starters:")
        for row in cur.fetchall():
            logger.info(f"  {row[0]} ({row[1]}) - Starter: {row[2]}")
        
        cur.close()
        
    except Exception as e:
        logger.error(f"Error updating database: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

def main():
    """Main execution"""
    logger.info("="*80)
    logger.info("🏀 NBA STARTER STATUS UPDATER")
    logger.info("="*80)
    
    try:
        # Step 1: Get recent games
        game_ids = get_recent_games(season_year=2025, limit=50)
        
        if len(game_ids) == 0:
            logger.error("No games found. Cannot determine starter status.")
            return
        
        # Step 2: Analyze boxscores for starter information
        starter_counts = analyze_starter_status_from_games(game_ids)
        
        if len(starter_counts) == 0:
            logger.error("No starter data collected.")
            return
        
        # Step 3: Determine who is a starter (>70% of games started with at least 3 games)
        starters = determine_starters(starter_counts, threshold=0.7, min_games=3)
        
        # Step 4: Update database
        update_database(starters)
        
        logger.info("="*80)
        logger.info("✅ STARTER STATUS UPDATE COMPLETE")
        logger.info("="*80)
        
    except Exception as e:
        logger.error(f"Script failed: {e}")
        raise

if __name__ == "__main__":
    main()
