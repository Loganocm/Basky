"""
Flask API wrapper for NBA scraper
ZERO CHANGES TO SCRAPING LOGIC - just wraps nba_scrape_to_postgres.py
Deploy this on EC2 alongside your Java backend
"""

from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os
from dotenv import load_dotenv
import threading
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Configure environment variables for database connection
# These should match what's in nba_scrape_to_postgres.py
if not os.environ.get("DB_HOST"):
    # Set defaults if not already set
    os.environ.setdefault("DB_NAME", "postgres")
    os.environ.setdefault("DB_USER", "postgres.hbsdjlaogfdcjlghjuct")
    os.environ.setdefault("DB_HOST", "aws-1-us-east-1.pooler.supabase.com")
    os.environ.setdefault("DB_PORT", "5432")
    os.environ.setdefault("DB_SSLMODE", "require")
    # DB_PASSWORD must be set in environment or .env file for security

# Import your EXACT existing scraper function - NO LOGIC CHANGES
from nba_scrape_to_postgres import scrape_and_store, get_connection

app = Flask(__name__)
CORS(app)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("nba_api")

# Track sync status
sync_status = {
    "is_running": False,
    "last_sync": None,
    "last_error": None,
    "last_success": None
}

def run_sync_background():
    """Run sync in background thread"""
    global sync_status
    try:
        sync_status["is_running"] = True
        sync_status["last_error"] = None
        logger.info("🚀 Background sync started")
        
        scrape_and_store()
        
        sync_status["last_success"] = datetime.now().isoformat()
        logger.info("✅ Background sync completed successfully")
        
    except Exception as e:
        sync_status["last_error"] = str(e)
        logger.error(f"❌ Background sync failed: {e}")
    finally:
        sync_status["is_running"] = False
        sync_status["last_sync"] = datetime.now().isoformat()


@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({"status": "healthy"}), 200


@app.route('/api/nba/sync', methods=['POST'])
def sync():
    """
    Trigger NBA data sync (runs in background)
    Your Java backend calls this: POST http://localhost:5000/api/nba/sync
    """
    global sync_status
    
    if sync_status["is_running"]:
        return jsonify({
            "success": False,
            "message": "Sync already in progress",
            "status": sync_status
        }), 409
    
    try:
        # Start sync in background thread
        thread = threading.Thread(target=run_sync_background, daemon=True)
        thread.start()
        
        logger.info("🚀 Sync triggered (running in background)")
        return jsonify({
            "success": True,
            "message": "NBA data sync started in background. Check /api/nba/sync/status for progress.",
            "status": sync_status
        }), 202  # 202 Accepted
        
    except Exception as e:
        logger.error(f"❌ Failed to start sync: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/nba/sync/status', methods=['GET'])
def sync_status_endpoint():
    """Check sync status"""
    return jsonify({
        "success": True,
        "status": sync_status
    }), 200


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
