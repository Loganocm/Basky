import psycopg2

conn = psycopg2.connect(
    dbname='nba_stats_db',
    user='postgres',
    password='1738',
    host='localhost',
    port='5432'
)

cur = conn.cursor()

# Check if table exists
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public'
    ORDER BY table_name
""")
print("All tables in database:")
for row in cur.fetchall():
    print(f"  - {row[0]}")

print("\n" + "="*50 + "\n")

# Check teams table structure
cur.execute("""
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns 
    WHERE table_name='teams' 
    ORDER BY ordinal_position
""")

print("TEAMS TABLE SCHEMA:")
rows = cur.fetchall()
if rows:
    for row in rows:
        max_len = f"({row[2]})" if row[2] else ""
        print(f"  {row[0]}: {row[1]}{max_len}")
else:
    print("  (No columns found - table may not exist)")

print("\n" + "="*50 + "\n")

# Check players table structure
cur.execute("""
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns 
    WHERE table_name='players' 
    ORDER BY ordinal_position
""")

print("PLAYERS TABLE SCHEMA:")
rows = cur.fetchall()
if rows:
    for row in rows:
        max_len = f"({row[2]})" if row[2] else ""
        print(f"  {row[0]}: {row[1]}{max_len}")
else:
    print("  (No columns found - table may not exist)")

print("\n" + "="*50 + "\n")

# Check games table structure
cur.execute("""
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns 
    WHERE table_name='games' 
    ORDER BY ordinal_position
""")

print("GAMES TABLE SCHEMA:")
rows = cur.fetchall()
if rows:
    for row in rows:
        max_len = f"({row[2]})" if row[2] else ""
        print(f"  {row[0]}: {row[1]}{max_len}")
else:
    print("  (No columns found - table may not exist)")

conn.close()
