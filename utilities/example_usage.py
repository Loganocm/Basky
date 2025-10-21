#!/usr/bin/env python3
"""
Example usage of the NBA scraper.
This demonstrates how to use the scraper with proper error handling.
"""

import logging
import sys
from nba_scrape_to_postgres import scrape_and_store

def main():
    """Main function to run the NBA scraper."""
    
    # Set up logging to see what's happening
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('nba_scraper.log')
        ]
    )
    
    logger = logging.getLogger(__name__)
    
    logger.info("Starting NBA data scraping...")
    
    try:
        # Run the scraper
        scrape_and_store()
        logger.info("✅ NBA data scraping completed successfully!")
        
    except ConnectionError as e:
        logger.error(f"❌ Database connection failed: {e}")
        logger.info("Please check your database configuration and ensure PostgreSQL is running")
        sys.exit(1)
        
    except Exception as e:
        logger.error(f"❌ Scraping failed with error: {e}")
        logger.info("Check the logs above for more details")
        sys.exit(1)

if __name__ == "__main__":
    main()