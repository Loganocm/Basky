import psycopg2

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

# Check sample players
cur.execute('SELECT name, jersey_number FROM players LIMIT 10')
print('Sample players with jersey numbers:')
for row in cur.fetchall():
    print(f'  {row[0]}: {row[1]}')

# Count players with jersey numbers
cur.execute('SELECT COUNT(*) FROM players WHERE jersey_number IS NOT NULL')
count_with = cur.fetchone()[0]

cur.execute('SELECT COUNT(*) FROM players')
total = cur.fetchone()[0]

print(f'\nPlayers with jersey numbers: {count_with}/{total}')

conn.close()
