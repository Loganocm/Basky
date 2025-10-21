import psycopg2

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

# Find Giannis
cur.execute("SELECT id, name FROM players WHERE name LIKE '%Giannis%' OR name LIKE '%Antetokounmpo%'")
print("Giannis Antetokounmpo:")
for row in cur.fetchall():
    print(f"  ID: {row[0]}, Name: {row[1]}")

conn.close()
