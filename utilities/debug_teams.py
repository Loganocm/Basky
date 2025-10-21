import psycopg2
from nba_api.stats.static import teams

# Check database teams
conn = psycopg2.connect(
    dbname='nba_stats_db',
    user='postgres',
    password='1738',
    host='localhost',
    port='5432'
)

cur = conn.cursor()
cur.execute("SELECT id, abbreviation, team_name FROM teams LIMIT 5")
print("Database teams (sample):")
for row in cur.fetchall():
    print(f"  ID: {row[0]}, Abbrev: {row[1]}, Name: {row[2]}")

conn.close()

print("\n" + "="*60 + "\n")

# Check NBA API teams
all_teams = teams.get_teams()
print("NBA API teams (sample 5):")
for team in all_teams[:5]:
    print(f"  ID: {team['id']}, Abbrev: {team['abbreviation']}, Full Name: {team['full_name']}")
