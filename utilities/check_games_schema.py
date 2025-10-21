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
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='games' 
    ORDER BY ordinal_position
""")

print("GAMES TABLE COLUMNS:")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

conn.close()
