import psycopg2

conn = psycopg2.connect(
    dbname='nba_data',
    user='postgres',
    password='1738',
    host='localhost',
    port='5432'
)

cur = conn.cursor()

tables = ['teams', 'players', 'games']

for table in tables:
    print(f"\n{table.upper()} TABLE:")
    print("="*50)
    cur.execute(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name='{table}' 
        ORDER BY ordinal_position
    """)
    rows = cur.fetchall()
    if rows:
        for row in rows:
            print(f"  {row[0]}: {row[1]}")
    else:
        print("  (Table not found or empty)")

conn.close()
