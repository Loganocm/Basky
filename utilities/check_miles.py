import psycopg2

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

# Check Miles Bridges
cur.execute("SELECT name, jersey_number, team_id FROM players WHERE name LIKE '%Miles%Bridges%'")
result = cur.fetchall()

print('Miles Bridges in database:')
for row in result:
    print(f'  Name: {row[0]}, Jersey: {row[1]}, Team ID: {row[2]}')

# Also check total jersey numbers now
cur.execute('SELECT COUNT(*) FROM players WHERE jersey_number IS NOT NULL')
with_jersey = cur.fetchone()[0]

cur.execute('SELECT COUNT(*) FROM players')
total = cur.fetchone()[0]

print(f'\nTotal players with jersey numbers: {with_jersey}/{total}')

# Show a few samples
cur.execute('SELECT name, jersey_number FROM players WHERE jersey_number IS NOT NULL LIMIT 10')
print('\nSample players WITH jersey numbers:')
for row in cur.fetchall():
    print(f'  {row[0]}: #{row[1]}')

conn.close()
