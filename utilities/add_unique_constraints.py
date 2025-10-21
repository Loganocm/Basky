"""
Add unique constraints to the database tables
"""

import psycopg2

DB_NAME = "nba_stats_db"
DB_USER = "postgres"
DB_PASSWORD = "1738"
DB_HOST = "localhost"
DB_PORT = "5432"

def add_constraints():
    """Add unique constraints to tables"""
    
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
        
        print("Adding unique constraints...")
        
        # Add unique constraint on players.name
        try:
            cur.execute("""
                ALTER TABLE players 
                ADD CONSTRAINT players_name_unique UNIQUE (name);
            """)
            print("✅ Added unique constraint on players.name")
        except psycopg2.Error as e:
            if "already exists" in str(e):
                print("⚠️  Unique constraint on players.name already exists")
            else:
                print(f"❌ Error adding constraint on players.name: {e}")
        
        # Add unique constraint on teams.abbreviation
        try:
            cur.execute("""
                ALTER TABLE teams 
                ADD CONSTRAINT teams_abbreviation_unique UNIQUE (abbreviation);
            """)
            print("✅ Added unique constraint on teams.abbreviation")
        except psycopg2.Error as e:
            if "already exists" in str(e):
                print("⚠️  Unique constraint on teams.abbreviation already exists")
            else:
                print(f"❌ Error adding constraint on teams.abbreviation: {e}")
        
        # Add unique constraint on games to prevent duplicate games
        try:
            cur.execute("""
                ALTER TABLE games 
                ADD CONSTRAINT games_unique UNIQUE (game_date, home_team_id, away_team_id);
            """)
            print("✅ Added unique constraint on games (date, home_team, away_team)")
        except psycopg2.Error as e:
            if "already exists" in str(e):
                print("⚠️  Unique constraint on games already exists")
            else:
                print(f"❌ Error adding constraint on games: {e}")
        
        print("\n✨ Constraints added successfully!")
        
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
    print("🔧 Adding Database Constraints")
    print("="*60)
    add_constraints()
