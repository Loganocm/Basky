"""
Alternative approach: Update jersey numbers using player IDs instead of names
"""
import psycopg2
from nba_api.stats.endpoints import commonplayerinfo
import time

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

# Get all players from database who have stats (which means they have team_id)
cur.execute("""
    SELECT id, name, team_id 
    FROM players 
    WHERE team_id IS NOT NULL AND jersey_number IS NULL
    LIMIT 50
""")

players = cur.fetchall()
print(f"Found {len(players)} players without jersey numbers\n")

# For each player, try to find their jersey number using CommonPlayerInfo
updated = 0
for player_id, name, team_id in players:
    print(f"Checking {name}...")
    # Unfortunately, we don't have player_id stored in database
    # This approach won't work without major refactoring
    
print(f"\nThis approach requires storing player_id in database first")
conn.close()
