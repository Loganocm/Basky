"""
Add box_scores table to existing database without recreating everything
"""
import psycopg2

DB_NAME = "nba_stats_db"
DB_USER = "postgres"
DB_PASSWORD = "1738"
DB_HOST = "localhost"
DB_PORT = "5432"

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
    
    print("Creating box_scores table...")
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS box_scores (
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
    
    print("✅ Created box_scores table successfully!")
    
    cur.close()
    conn.close()
    
except psycopg2.Error as e:
    print(f"❌ Database error: {e}")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
