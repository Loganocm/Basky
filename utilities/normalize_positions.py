"""
Normalize all existing positions in the database to standard format
"""
import psycopg2

def normalize_position(position):
    """Normalize position names to standard format: C, F, G, F-C, G-F"""
    if not position:
        return None
    
    # Convert to uppercase and strip whitespace
    pos = str(position).upper().strip()
    
    # Map full names to abbreviations
    position_map = {
        'CENTER': 'C',
        'FORWARD': 'F',
        'GUARD': 'G',
        'C-F': 'F-C',  # Standardize to F-C
        'F-G': 'G-F',  # Standardize to G-F
        'CENTER-FORWARD': 'F-C',
        'FORWARD-CENTER': 'F-C',
        'FORWARD-GUARD': 'G-F',
        'GUARD-FORWARD': 'G-F',
    }
    
    # Return mapped value or original if already in standard format
    return position_map.get(pos, pos if pos in ['C', 'F', 'G', 'F-C', 'G-F'] else None)

conn = psycopg2.connect('postgresql://postgres:1738@localhost:5432/nba_stats_db')
cur = conn.cursor()

# Get all unique positions
cur.execute('SELECT DISTINCT position FROM players WHERE position IS NOT NULL ORDER BY position')
positions = cur.fetchall()

print("Current positions in database:")
for pos in positions:
    print(f"  {pos[0]}")

# Update each position
print("\nNormalizing positions...")
updated_count = 0

for pos in positions:
    old_pos = pos[0]
    new_pos = normalize_position(old_pos)
    
    if new_pos and new_pos != old_pos:
        cur.execute('UPDATE players SET position = %s WHERE position = %s', (new_pos, old_pos))
        count = cur.rowcount
        print(f"  Updated {count} players: '{old_pos}' -> '{new_pos}'")
        updated_count += count

conn.commit()

# Show final positions
cur.execute('SELECT DISTINCT position FROM players WHERE position IS NOT NULL ORDER BY position')
final_positions = cur.fetchall()

print(f"\nUpdated {updated_count} players")
print("\nFinal positions in database:")
for pos in final_positions:
    print(f"  {pos[0]}")

conn.close()
