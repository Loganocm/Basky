"""
Supabase Database Connection Tester
Tests database connectivity with comprehensive diagnostics
"""

import os
import sys
import psycopg2
from psycopg2 import sql

def test_connection():
    """Test Supabase database connection with detailed diagnostics"""
    
    # Read configuration from environment or use defaults
    db_config = {
        'dbname': os.environ.get('DB_NAME', 'postgres'),
        'user': os.environ.get('DB_USER', 'postgres.hbsdjlaogfdcjlghjuct'),
        'password': os.environ.get('DB_PASSWORD', ''),
        'host': os.environ.get('DB_HOST', 'aws-1-us-east-1.pooler.supabase.com'),
        'port': os.environ.get('DB_PORT', '5432'),
        'sslmode': os.environ.get('DB_SSLMODE', 'require'),
        'connect_timeout': 10
    }
    
    print("=" * 70)
    print("SUPABASE DATABASE CONNECTION TEST")
    print("=" * 70)
    print()
    
    # Display configuration (hide password)
    print("Connection Configuration:")
    print(f"  Host:     {db_config['host']}")
    print(f"  Port:     {db_config['port']}")
    print(f"  Database: {db_config['dbname']}")
    print(f"  User:     {db_config['user']}")
    print(f"  Password: {'*' * len(db_config['password']) if db_config['password'] else '(NOT SET)'}")
    print(f"  SSL Mode: {db_config['sslmode']}")
    print(f"  Timeout:  {db_config['connect_timeout']}s")
    print()
    
    # Check for missing password
    if not db_config['password']:
        print("❌ ERROR: DB_PASSWORD environment variable is not set!")
        print()
        print("Set it using:")
        print("  Windows: $env:DB_PASSWORD='your-password'")
        print("  Linux:   export DB_PASSWORD='your-password'")
        print()
        return False
    
    # Test connection
    print("Attempting connection...")
    print("-" * 70)
    
    conn = None
    try:
        # Try to connect
        conn = psycopg2.connect(**db_config)
        print("✅ CONNECTION SUCCESSFUL!")
        print()
        
        # Get server version
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            version = cur.fetchone()[0]
            print(f"PostgreSQL Version:")
            print(f"  {version[:80]}...")
            print()
            
            # Test SSL connection
            cur.execute("SELECT ssl_is_used();")
            ssl_used = cur.fetchone()[0]
            print(f"SSL Status: {'✅ Enabled' if ssl_used else '❌ Disabled (WARNING!)'}")
            print()
            
            # Check database tables
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cur.fetchall()
            
            if tables:
                print(f"Database Tables ({len(tables)}):")
                for table in tables:
                    print(f"  • {table[0]}")
                print()
                
                # Get row counts for NBA tables
                nba_tables = ['teams', 'players', 'games', 'box_scores']
                print("Table Row Counts:")
                for table_name in nba_tables:
                    try:
                        cur.execute(sql.SQL("SELECT COUNT(*) FROM {}").format(
                            sql.Identifier(table_name)
                        ))
                        count = cur.fetchone()[0]
                        print(f"  {table_name:15} {count:,} rows")
                    except psycopg2.Error as e:
                        print(f"  {table_name:15} (table not found)")
                print()
            else:
                print("⚠️  No tables found in database (empty database)")
                print()
        
        # Test write permissions
        print("Testing write permissions...")
        with conn.cursor() as cur:
            try:
                cur.execute("""
                    CREATE TEMP TABLE test_connection_check (id INTEGER);
                """)
                cur.execute("""
                    INSERT INTO test_connection_check VALUES (1);
                """)
                cur.execute("""
                    SELECT * FROM test_connection_check;
                """)
                result = cur.fetchone()
                cur.execute("""
                    DROP TABLE test_connection_check;
                """)
                conn.commit()
                print("✅ Write permissions: OK")
                print()
            except psycopg2.Error as e:
                print(f"❌ Write permissions: FAILED - {e}")
                print()
                conn.rollback()
                return False
        
        print("=" * 70)
        print("✅ ALL TESTS PASSED - Database connection is fully functional!")
        print("=" * 70)
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ CONNECTION FAILED!")
        print()
        print(f"Error: {e}")
        print()
        print("Common issues:")
        print("  1. Check your password is correct")
        print("  2. Verify host is 'aws-0-us-east-1.pooler.supabase.com' (note: aws-0)")
        print("  3. Port should be 5432 (not 6543)")
        print("  4. SSL mode must be 'require' for Supabase")
        print("  5. Check firewall/network connectivity")
        print()
        return False
        
    except psycopg2.Error as e:
        print(f"❌ DATABASE ERROR!")
        print()
        print(f"Error: {e}")
        print()
        return False
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR!")
        print()
        print(f"Error: {type(e).__name__}: {e}")
        print()
        return False
        
    finally:
        if conn:
            conn.close()
            print("Connection closed.")
            print()


if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
