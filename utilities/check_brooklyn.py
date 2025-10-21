import psycopg2

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

# Get Brooklyn team ID
cur.execute("SELECT id, name FROM teams WHERE abbreviation = 'BKN'")
bkn_team = cur.fetchone()

if bkn_team:
    print(f"Brooklyn Nets team ID: {bkn_team[0]} - {bkn_team[1]}")
    
    # Get all BKN players
    cur.execute("SELECT name, jersey_number FROM players WHERE team_id = %s ORDER BY name", (bkn_team[0],))
    bkn_players = cur.fetchall()
    
    print(f"\nBrooklyn Nets roster ({len(bkn_players)} players):")
    for name, jersey in bkn_players:
        print(f"  {name} - #{jersey if jersey is not None else 'N/A'}")
else:
    print("Brooklyn Nets not found in database")

conn.close()
