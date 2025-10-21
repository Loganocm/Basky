import psycopg2

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

cur.execute('SELECT COUNT(*) FROM games')
count = cur.fetchone()[0]
print(f'Games in database: {count}')

if count > 0:
    cur.execute('SELECT * FROM games LIMIT 5')
    print('\nSample games:')
    for row in cur.fetchall():
        print(row)
else:
    print('\nNo games found in database!')

conn.close()
