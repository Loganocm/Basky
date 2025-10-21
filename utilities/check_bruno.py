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
    SELECT p.name, p.position, p.points, p.games_played, t.abbreviation
    FROM players p 
    LEFT JOIN teams t ON p.team_id = t.id 
    WHERE p.name LIKE '%Fernando%'
""")

print("\n" + "="*60)
print("Bruno Fernando - Updated Data")
print("="*60)

result = cur.fetchone()
if result:
    print(f"\nPlayer: {result[0]}")
    print(f"Position: {result[1]} ✅")
    print(f"Points per Game: {result[2]}")
    print(f"Games Played: {result[3]}")
    print(f"Team: {result[4]}")
else:
    print("Not found")

print("\n" + "="*60 + "\n")

conn.close()
