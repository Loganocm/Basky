"""
Flask API wrapper for NBA scraper
ZERO CHANGES TO SCRAPING LOGIC - just wraps nba_scrape_to_postgres.py
Deploy this on EC2 alongside your Java backend
"""

from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os

# Import your EXACT existing scraper function - NO LOGIC CHANGES
from nba_scrape_to_postgres import scrape_and_store, get_connection

app = Flask(__name__)
CORS(app)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("nba_api")


@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({"status": "healthy"}), 200


@app.route('/api/nba/sync', methods=['POST'])
def sync():
    """
    Trigger NBA data sync
    Your Java backend calls this: POST http://localhost:5000/api/nba/sync
    """
    try:
        logger.info("🚀 Sync triggered")
        
        # Call your EXACT function - ZERO CHANGES
        scrape_and_store()
        
        logger.info("✅ Sync completed")
        return jsonify({
            "success": True,
            "message": "NBA data sync completed"
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Sync failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/nba/status', methods=['GET'])
def status():
    """Check database status"""
    try:
        conn = get_connection()
        
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM teams")
            teams = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM players")
            players = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM games")
            games = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM box_scores")
            box_scores = cur.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "teams": teams,
                "players": players,
                "games": games,
                "box_scores": box_scores
            },
            "needs_sync": teams == 0
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"🏀 NBA API starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
