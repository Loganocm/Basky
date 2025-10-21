import psycopg2

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

# Check Killian Hayes
cur.execute("SELECT name, jersey_number, team_id FROM players WHERE name LIKE '%Killian%Hayes%'")
result = cur.fetchall()

print('Killian Hayes in database:')
for row in result:
    print(f'  Name: {row[0]}, Jersey: {row[1]}, Team ID: {row[2]}')

if not result:
    print('  Not found!')
    
    # Check for similar names
    cur.execute("SELECT name FROM players WHERE name LIKE '%Hayes%'")
    hayes_players = cur.fetchall()
    print('\nPlayers with "Hayes" in name:')
    for row in hayes_players:
        print(f'  {row[0]}')

conn.close()
