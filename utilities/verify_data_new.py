import psycopg2

conn = psycopg2.connect(
    dbname='nba_stats_db',
    user='postgres',
    password='1738',
    host='localhost',
    port='5432'
)

cur = conn.cursor()

print("\n" + "="*60)
print("📊 DATABASE VERIFICATION - Updated Schema")
print("="*60)

# Check Teams
print("\n🏀 TEAMS (Sample 5):")
print("-" * 60)
cur.execute("SELECT name, city, abbreviation FROM teams LIMIT 5")
teams = cur.fetchall()
for team in teams:
    print(f"  {team[1]} {team[0]} ({team[2]})")
    
cur.execute("SELECT COUNT(*) FROM teams")
team_count = cur.fetchone()[0]
print(f"\n  Total Teams: {team_count}")

# Check Players with Stats
print("\n👥 PLAYERS (Top 5 by Points Per Game):")
print("-" * 60)
cur.execute("""
    SELECT p.name, points, rebounds, assists, games_played, t.abbreviation as team
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE points IS NOT NULL
    ORDER BY points DESC 
    LIMIT 5
""")
players = cur.fetchall()
for player in players:
    name, pts, reb, ast, gp, team = player
    team_str = f" ({team})" if team else ""
    print(f"  {name}{team_str}: {pts:.1f} PPG, {reb:.1f} RPG, {ast:.1f} APG in {gp} games")

cur.execute("SELECT COUNT(*) FROM players")
player_count = cur.fetchone()[0]
print(f"\n  Total Players: {player_count}")

# Check Players with complete stats
cur.execute("""
    SELECT COUNT(*) FROM players 
    WHERE points IS NOT NULL 
    AND rebounds IS NOT NULL 
    AND assists IS NOT NULL
""")
players_with_stats = cur.fetchone()[0]
print(f"  Players with Stats: {players_with_stats}")

# Check Players with team assignments
cur.execute("SELECT COUNT(*) FROM players WHERE team_id IS NOT NULL")
players_with_teams = cur.fetchone()[0]
print(f"  Players with Teams: {players_with_teams}")

# Check Games
print("\n🎮 GAMES (Most Recent 5):")
print("-" * 60)
cur.execute("""
    SELECT g.game_date, 
           ht.abbreviation as home_team, 
           at.abbreviation as away_team,
           g.home_score, 
           g.away_score
    FROM games g
    LEFT JOIN teams ht ON g.home_team_id = ht.id
    LEFT JOIN teams at ON g.away_team_id = at.id
    ORDER BY g.game_date DESC 
    LIMIT 5
""")
games = cur.fetchall()
for game in games:
    date, home, away, home_score, away_score = game
    print(f"  {date}: {away} @ {home} - {away_score}-{home_score}")

cur.execute("SELECT COUNT(*) FROM games")
game_count = cur.fetchone()[0]
print(f"\n  Total Games: {game_count}")

# Data Quality Checks
print("\n✅ DATA QUALITY CHECKS:")
print("-" * 60)

# Check for NULL values in important fields
cur.execute("SELECT COUNT(*) FROM teams WHERE name IS NULL OR abbreviation IS NULL")
null_teams = cur.fetchone()[0]
print(f"  Teams with NULL name/abbreviation: {null_teams}")

cur.execute("SELECT COUNT(*) FROM players WHERE name IS NULL")
null_players = cur.fetchone()[0]
print(f"  Players with NULL name: {null_players}")

cur.execute("SELECT COUNT(*) FROM games WHERE game_date IS NULL")
null_games = cur.fetchone()[0]
print(f"  Games with NULL date: {null_games}")

# Check percentage fields are in valid range (0-1)
cur.execute("""
    SELECT COUNT(*) FROM players 
    WHERE field_goal_percentage > 1 
    OR three_point_percentage > 1 
    OR free_throw_percentage > 1
""")
invalid_percentages = cur.fetchone()[0]
print(f"  Players with invalid percentage values: {invalid_percentages}")

# Sample player with complete stats
print("\n📋 SAMPLE PLAYER DATA (Full Stats):")
print("-" * 60)
cur.execute("""
    SELECT p.name, t.abbreviation, p.position, p.games_played,
           p.minutes_per_game, p.points, p.rebounds, p.assists,
           p.steals, p.blocks, p.turnovers,
           p.field_goal_percentage, p.three_point_percentage, p.free_throw_percentage
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.points IS NOT NULL
    ORDER BY p.points DESC
    LIMIT 1
""")
sample = cur.fetchone()
if sample:
    print(f"  Player: {sample[0]}")
    print(f"  Team: {sample[1] or 'N/A'}")
    print(f"  Position: {sample[2] or 'N/A'}")
    print(f"  Games: {sample[3] or 'N/A'}")
    print(f"  Minutes/Game: {sample[4]:.1f}" if sample[4] else "  Minutes/Game: N/A")
    print(f"  Points/Game: {sample[5]:.1f}" if sample[5] else "  Points/Game: N/A")
    print(f"  Rebounds/Game: {sample[6]:.1f}" if sample[6] else "  Rebounds/Game: N/A")
    print(f"  Assists/Game: {sample[7]:.1f}" if sample[7] else "  Assists/Game: N/A")
    print(f"  Steals/Game: {sample[8]:.1f}" if sample[8] else "  Steals/Game: N/A")
    print(f"  Blocks/Game: {sample[9]:.1f}" if sample[9] else "  Blocks/Game: N/A")
    print(f"  Turnovers/Game: {sample[10]:.1f}" if sample[10] else "  Turnovers/Game: N/A")
    print(f"  FG%: {sample[11]:.1%}" if sample[11] else "  FG%: N/A")
    print(f"  3P%: {sample[12]:.1%}" if sample[12] else "  3P%: N/A")
    print(f"  FT%: {sample[13]:.1%}" if sample[13] else "  FT%: N/A")

print("\n" + "="*60)
print("✨ Verification Complete!")
print("="*60 + "\n")

conn.close()
