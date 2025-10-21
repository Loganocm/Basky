"""
Add is_starter column to players table
Run this to add the starter status field
"""

import psycopg2

DB_CONFIG = {
    'dbname': 'nba_stats_db',
    'user': 'postgres',
    'password': '1738',
    'host': 'localhost',
    'port': '5432'
}

def add_is_starter_column():
    """Add is_starter column to players table"""
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("\n" + "="*80)
        print("🔧 ADDING IS_STARTER COLUMN TO PLAYERS TABLE")
        print("="*80)
        
        # Add is_starter column
        print("\n📊 Adding is_starter column...")
        try:
            cur.execute("""
                ALTER TABLE players 
                ADD COLUMN IF NOT EXISTS is_starter BOOLEAN DEFAULT FALSE;
            """)
            print("  ✅ Added is_starter column")
        except Exception as e:
            print(f"  ⚠️  is_starter: {e}")
        
        # Verify new schema
        print("\n" + "="*80)
        print("✅ COLUMN ADDITION COMPLETE")
        print("="*80)
        
        cur.execute("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name='players' AND column_name='is_starter'
        """)
        
        result = cur.fetchone()
        if result:
            print(f"\n📋 Column Added:")
            print(f"  Name: {result[0]}")
            print(f"  Type: {result[1]}")
            print(f"  Default: {result[2]}")
        else:
            print("\n⚠️  Column not found!")
        
        print("\n" + "="*80 + "\n")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    add_is_starter_column()
