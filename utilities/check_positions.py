import psycopg2

conn = psycopg2.connect(
    dbname='nba_stats_db',
    user='postgres',
    password='1738',
    host='localhost',
    port='5432'
)

cur = conn.cursor()

# Check position coverage
cur.execute("SELECT COUNT(*) as total, COUNT(position) as has_position FROM players")
result = cur.fetchone()
total, has_position = result

print("\n" + "="*60)
print("📊 POSITION DATA COVERAGE")
print("="*60)
print(f"\nTotal Players: {total}")
print(f"With Position: {has_position} ({has_position/total*100:.1f}%)")
print(f"Without Position: {total - has_position} ({(total - has_position)/total*100:.1f}%)")

# Position breakdown
print("\n📋 POSITION BREAKDOWN:")
print("-" * 60)
cur.execute("""
    SELECT position, COUNT(*) as count 
    FROM players 
    WHERE position IS NOT NULL
    GROUP BY position 
    ORDER BY count DESC
""")
for row in cur.fetchall():
    print(f"  {row[0]:10} {row[1]:3} players")

# Sample players by position
print("\n🏀 SAMPLE PLAYERS BY POSITION (Top scorer in each):")
print("-" * 60)
cur.execute("""
    SELECT DISTINCT ON (position) 
        position, p.name, points, t.abbreviation
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE position IS NOT NULL AND points IS NOT NULL
    ORDER BY position, points DESC
""")
for row in cur.fetchall():
    pos, name, pts, team = row
    print(f"  {pos:10} {name:30} {pts:5.1f} PPG ({team})")

# Players without positions
print("\n⚠️  PLAYERS WITHOUT POSITIONS (Top 5 by points):")
print("-" * 60)
cur.execute("""
    SELECT p.name, points, t.abbreviation
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE position IS NULL AND points IS NOT NULL
    ORDER BY points DESC
    LIMIT 5
""")
no_pos_players = cur.fetchall()
if no_pos_players:
    for row in no_pos_players:
        name, pts, team = row
        print(f"  {name:30} {pts:5.1f} PPG ({team})")
else:
    print("  ✅ All players have positions!")

print("\n" + "="*60 + "\n")

conn.close()
