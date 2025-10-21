"""
Database Recreation Script - Simple 3-Table Schema
Creates clean tables for: teams, players, games
Run this to reset your database to the new structure.
"""

import psycopg2

# Database connection parameters - matches Spring Boot application.properties
DB_NAME = "nba_stats_db"
DB_USER = "postgres"
DB_PASSWORD = "1738"
DB_HOST = "localhost"
DB_PORT = "5432"

def recreate_database():
    """Drop all tables and recreate with new schema"""
    
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        print("🗑️  Dropping all existing tables...")
        
        # Drop all tables (including any old player_* tables)
        cur.execute("""
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        """)
        
        print("✅ All old tables dropped")
        
        print("\n📋 Creating new schema...")
        
        # Create teams table
        cur.execute("""
            CREATE TABLE teams (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                city VARCHAR(100),
                abbreviation VARCHAR(10)
            );
        """)
        print("✅ Created 'teams' table")
        
        # Create players table with stats
        cur.execute("""
            CREATE TABLE players (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                position VARCHAR(50),
                jersey_number INTEGER,
                team_id BIGINT,
                is_starter BOOLEAN DEFAULT FALSE,
                games_played INTEGER,
                minutes_per_game DOUBLE PRECISION,
                points DOUBLE PRECISION,
                rebounds DOUBLE PRECISION,
                assists DOUBLE PRECISION,
                steals DOUBLE PRECISION,
                blocks DOUBLE PRECISION,
                turnovers DOUBLE PRECISION,
                field_goal_percentage DOUBLE PRECISION,
                three_point_percentage DOUBLE PRECISION,
                free_throw_percentage DOUBLE PRECISION,
                FOREIGN KEY (team_id) REFERENCES teams(id)
            );
        """)
        print("✅ Created 'players' table with stats columns")
        
        # Create games table
        cur.execute("""
            CREATE TABLE games (
                id BIGSERIAL PRIMARY KEY,
                game_date DATE NOT NULL,
                home_team_id BIGINT,
                away_team_id BIGINT,
                home_score INTEGER,
                away_score INTEGER,
                FOREIGN KEY (home_team_id) REFERENCES teams(id),
                FOREIGN KEY (away_team_id) REFERENCES teams(id)
            );
        """)
        print("✅ Created 'games' table")
        
        # Create box_scores table for individual player game stats
        cur.execute("""
            CREATE TABLE box_scores (
                id BIGSERIAL PRIMARY KEY,
                game_id BIGINT NOT NULL,
                player_id BIGINT NOT NULL,
                team_id BIGINT NOT NULL,
                minutes_played VARCHAR(10),
                points INTEGER,
                rebounds INTEGER,
                assists INTEGER,
                steals INTEGER,
                blocks INTEGER,
                turnovers INTEGER,
                field_goals_made INTEGER,
                field_goals_attempted INTEGER,
                three_pointers_made INTEGER,
                three_pointers_attempted INTEGER,
                free_throws_made INTEGER,
                free_throws_attempted INTEGER,
                plus_minus INTEGER,
                is_starter BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                FOREIGN KEY (team_id) REFERENCES teams(id),
                UNIQUE (game_id, player_id)
            );
        """)
        print("✅ Created 'box_scores' table")
        
        print("\n" + "="*60)
        print("✨ Database recreated successfully!")
        print("="*60)
        print("\nNew schema:")
        print("  📊 teams (id, name, city, abbreviation)")
        print("  🏀 players (id, name, position, team_id, + stats)")
        print("  🎮 games (id, game_date, home_team_id, away_team_id, scores)")
        print("  📋 box_scores (id, game_id, player_id, team_id, + game stats)")
        print("\n💡 Next steps:")
        print("  1. Start your Spring Boot app to seed sample data")
        print("  2. Or run the NBA scraper to populate with real data")
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("="*60)
    print("🔄 NBA Database Recreation Script")
    print("="*60)
    print(f"\nConnecting to database: {DB_NAME}")
    print(f"Host: {DB_HOST}:{DB_PORT}")
    print("\n⚠️  WARNING: This will DELETE ALL existing data!")
    
    response = input("\nAre you sure you want to continue? (yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        recreate_database()
    else:
        print("\n❌ Operation cancelled")
