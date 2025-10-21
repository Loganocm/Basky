import psycopg2

conn = psycopg2.connect(
    dbname='nba_stats_db',
    user='postgres',
    password='1738',
    host='localhost',
    port='5432'
)

cur = conn.cursor()

for table_name in ['teams', 'players', 'games']:
    print(f"\n{'='*60}")
    print(f"Table: {table_name}")
    print('='*60)
    
    cur.execute(f"""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name='{table_name}' 
        ORDER BY ordinal_position
    """)
    
    for row in cur.fetchall():
        col_name, data_type, nullable, default = row
        default_str = f" DEFAULT {default}" if default else ""
        nullable_str = "NULL" if nullable == "YES" else "NOT NULL"
        print(f"  {col_name:25} {data_type:20} {nullable_str:10} {default_str}")

conn.close()
