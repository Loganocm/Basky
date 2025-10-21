import psycopg2

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

# Check total box scores
cur.execute('SELECT COUNT(*) FROM box_scores')
print(f'Total box scores: {cur.fetchone()[0]}')

# Check players with most games
cur.execute('SELECT player_id, COUNT(*) as games FROM box_scores GROUP BY player_id ORDER BY games DESC LIMIT 5')
print('\nTop 5 players by game count:')
for row in cur.fetchall():
    print(f'  Player ID {row[0]}: {row[1]} games')

# Get a specific player's box scores with game info
cur.execute('''
    SELECT p.id, p.name, COUNT(bs.id) as game_count
    FROM players p
    LEFT JOIN box_scores bs ON p.id = bs.player_id
    GROUP BY p.id, p.name
    HAVING COUNT(bs.id) > 0
    ORDER BY game_count DESC
    LIMIT 5
''')
print('\nTop 5 players (with names):')
for row in cur.fetchall():
    print(f'  {row[1]} (ID: {row[0]}): {row[2]} games')

# Pick first player and show their box scores with game dates
cur.execute('''
    SELECT bs.player_id, COUNT(*) as games
    FROM box_scores bs
    GROUP BY bs.player_id
    ORDER BY games DESC
    LIMIT 1
''')
top_player_id = cur.fetchone()[0]

cur.execute('''
    SELECT bs.id, bs.player_id, bs.game_id, g.game_date, bs.points, bs.rebounds, bs.assists
    FROM box_scores bs
    JOIN games g ON bs.game_id = g.id
    WHERE bs.player_id = %s
    ORDER BY g.game_date DESC
    LIMIT 5
''', (top_player_id,))
print(f'\nLast 5 games for player ID {top_player_id}:')
for row in cur.fetchall():
    print(f'  Box Score ID: {row[0]}, Game ID: {row[2]}, Date: {row[3]}, Stats: {row[4]}pts/{row[5]}reb/{row[6]}ast')

conn.close()
