import psycopg2

conn = psycopg2.connect(
    dbname='nba_stats_db',
    user='postgres',
    password='1738',
    host='localhost',
    port='5432'
)

cur = conn.cursor()

print("="*60)
print("TEAMS (showing top 5 by wins):")
print("="*60)
cur.execute("SELECT team_name, abbreviation, wins, losses FROM teams ORDER BY wins DESC LIMIT 5")
for row in cur.fetchall():
    print(f"  {row[0]:25} ({row[1]:3}): {row[2]:2}W - {row[3]:2}L")

print("\n" + "="*60)
print("PLAYERS (showing first 5):")
print("="*60)
cur.execute("SELECT player_name FROM players LIMIT 5")
for row in cur.fetchall():
    print(f"  {row[0]}")

print("\n" + "="*60)
print("GAMES (showing most recent 5):")
print("="*60)
cur.execute("""
    SELECT g.game_date, 
           ht.team_name as home_team, 
           at.team_name as away_team,
           g.home_score, 
           g.away_score
    FROM games g
    LEFT JOIN teams ht ON g.home_team_id = ht.id
    LEFT JOIN teams at ON g.away_team_id = at.id
    ORDER BY g.game_date DESC
    LIMIT 5
""")
for row in cur.fetchall():
    home_team = row[1] if row[1] else "Unknown"
    away_team = row[2] if row[2] else "Unknown"
    print(f"  {row[0]}: {home_team} {row[3]} vs {away_team} {row[4]}")

print("\n" + "="*60)
print("SUMMARY:")
print("="*60)
cur.execute("SELECT COUNT(*) FROM teams")
team_count = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM players")
player_count = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM games")
game_count = cur.fetchone()[0]

print(f"  Total Teams: {team_count}")
print(f"  Total Players: {player_count}")
print(f"  Total Games: {game_count}")
print("="*60)

conn.close()
