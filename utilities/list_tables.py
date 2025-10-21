import psycopg2

conn = psycopg2.connect(
    dbname='nba_stats_db',
    user='postgres',
    password='1738',
    host='localhost',
    port='5432'
)

cur = conn.cursor()

cur.execute("""
    SELECT tablename, 
           (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as column_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename
""")

tables = cur.fetchall()

print("\n" + "="*60)
print(f"📊 Tables in nba_stats_db database:")
print("="*60)

if tables:
    for table, col_count in tables:
        print(f"  ✓ {table} ({col_count} columns)")
        
        # Show columns for each table
        cur.execute(f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='{table}' 
            ORDER BY ordinal_position
        """)
        columns = cur.fetchall()
        for col, dtype in columns[:5]:  # Show first 5 columns
            print(f"      - {col}: {dtype}")
        if len(columns) > 5:
            print(f"      ... and {len(columns) - 5} more columns")
        print()
else:
    print("  ❌ No tables found!")

print("="*60)

conn.close()
