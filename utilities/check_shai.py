import psycopg2

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

# Find Shai Gilgeous-Alexander
cur.execute("SELECT id, name FROM players WHERE name LIKE '%Gilgeous%'")
print("Shai Gilgeous-Alexander:")
for row in cur.fetchall():
    print(f"  ID: {row[0]}, Name: {row[1]}")
    
    # Check his box scores
    cur.execute("""
        SELECT COUNT(*) FROM box_scores WHERE player_id = %s
    """, (row[0],))
    count = cur.fetchone()[0]
    print(f"  Box scores in DB: {count}")
    
    if count > 0:
        cur.execute("""
            SELECT bs.id, bs.game_id, bs.points, bs.rebounds, bs.assists
            FROM box_scores bs
            WHERE bs.player_id = %s
            ORDER BY bs.game_id DESC
            LIMIT 3
        """, (row[0],))
        print(f"  Last 3 box scores:")
        for bs_row in cur.fetchall():
            print(f"    Box Score ID: {bs_row[0]}, Game ID: {bs_row[1]}, Stats: {bs_row[2]}pts/{bs_row[3]}reb/{bs_row[4]}ast")

conn.close()
