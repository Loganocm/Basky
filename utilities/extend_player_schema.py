"""
Extend Players Table Schema with Advanced Stats
Run this to add all new columns for comprehensive player analytics
"""

import psycopg2

DB_CONFIG = {
    'dbname': 'nba_stats_db',
    'user': 'postgres',
    'password': '1738',
    'host': 'localhost',
    'port': '5432'
}

def extend_schema():
    """Add new columns to players table"""
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("\n" + "="*80)
        print("🔧 EXTENDING PLAYERS TABLE SCHEMA")
        print("="*80)
        
        # Shooting Stats (from API)
        print("\n📊 Adding Shooting Stats...")
        shooting_stats = [
            ('offensive_rebounds', 'DOUBLE PRECISION'),
            ('defensive_rebounds', 'DOUBLE PRECISION'),
            ('field_goals_made', 'DOUBLE PRECISION'),
            ('field_goals_attempted', 'DOUBLE PRECISION'),
            ('three_pointers_made', 'DOUBLE PRECISION'),
            ('three_pointers_attempted', 'DOUBLE PRECISION'),
            ('free_throws_made', 'DOUBLE PRECISION'),
            ('free_throws_attempted', 'DOUBLE PRECISION'),
        ]
        
        for col_name, col_type in shooting_stats:
            try:
                cur.execute(f"ALTER TABLE players ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
                print(f"  ✅ Added {col_name}")
            except Exception as e:
                print(f"  ⚠️  {col_name}: {e}")
        
        # Advanced Metrics (from API)
        print("\n⭐ Adding Advanced Metrics...")
        advanced_stats = [
            ('plus_minus', 'DOUBLE PRECISION'),
            ('fantasy_points', 'DOUBLE PRECISION'),
            ('double_doubles', 'INTEGER'),
            ('triple_doubles', 'INTEGER'),
            ('personal_fouls', 'DOUBLE PRECISION'),
        ]
        
        for col_name, col_type in advanced_stats:
            try:
                cur.execute(f"ALTER TABLE players ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
                print(f"  ✅ Added {col_name}")
            except Exception as e:
                print(f"  ⚠️  {col_name}: {e}")
        
        # Player Info
        print("\n👤 Adding Player Info...")
        player_info = [
            ('age', 'INTEGER'),
            ('height', 'VARCHAR(10)'),
            ('weight', 'INTEGER'),
        ]
        
        for col_name, col_type in player_info:
            try:
                cur.execute(f"ALTER TABLE players ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
                print(f"  ✅ Added {col_name}")
            except Exception as e:
                print(f"  ⚠️  {col_name}: {e}")
        
        # Calculated Metrics
        print("\n🧮 Adding Calculated Metrics...")
        calculated_stats = [
            ('efficiency_rating', 'DOUBLE PRECISION'),
            ('true_shooting_percentage', 'DOUBLE PRECISION'),
            ('effective_field_goal_percentage', 'DOUBLE PRECISION'),
            ('assist_to_turnover_ratio', 'DOUBLE PRECISION'),
            ('impact_score', 'DOUBLE PRECISION'),
            ('usage_rate', 'DOUBLE PRECISION'),
            ('player_efficiency_rating', 'DOUBLE PRECISION'),
        ]
        
        for col_name, col_type in calculated_stats:
            try:
                cur.execute(f"ALTER TABLE players ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
                print(f"  ✅ Added {col_name}")
            except Exception as e:
                print(f"  ⚠️  {col_name}: {e}")
        
        # Verify new schema
        print("\n" + "="*80)
        print("✅ SCHEMA EXTENSION COMPLETE")
        print("="*80)
        
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='players' 
            ORDER BY ordinal_position
        """)
        
        print("\n📋 Current Players Table Schema:")
        print("-" * 80)
        for row in cur.fetchall():
            print(f"  {row[0]:40} {row[1]}")
        
        cur.execute("SELECT COUNT(*) FROM information_schema.columns WHERE table_name='players'")
        total_columns = cur.fetchone()[0]
        print(f"\n📊 Total Columns: {total_columns}")
        
        print("\n" + "="*80 + "\n")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    extend_schema()
