"""
Integration test for the NBA scraper.
This tests the scraper with more realistic conditions but still uses mocks for external dependencies.
"""
import unittest
from unittest.mock import Mock, patch, MagicMock
import datetime
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import nba_scrape_to_postgres as scraper


class TestNBAScraperIntegration(unittest.TestCase):
    """Integration tests for the NBA scraper."""
    
    @patch('nba_scrape_to_postgres.execute_batch')
    @patch('nba_scrape_to_postgres.psycopg2.connect')
    @patch('nba_scrape_to_postgres.client')
    @patch('nba_scrape_to_postgres.time.sleep')
    def test_full_scraping_workflow(self, mock_sleep, mock_client, mock_connect, mock_execute_batch):
        """Test the complete scraping workflow with realistic mock data."""
        
        # Mock database connection
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.__enter__ = Mock(return_value=mock_cursor)
        mock_cursor.__exit__ = Mock(return_value=None)
        mock_connect.return_value = mock_conn
        
        # Mock realistic NBA data
        
        # Mock team standings
        lakers_team = Mock()
        lakers_team.value = "Los Angeles Lakers"
        lakers_team.name = "LAL"
        
        celtics_team = Mock()
        celtics_team.value = "Boston Celtics"
        celtics_team.name = "BOS"
        
        mock_standings = [
            {"team": lakers_team, "wins": 50, "losses": 32},
            {"team": celtics_team, "wins": 55, "losses": 27}
        ]
        mock_client.standings.return_value = mock_standings
        
        # Mock player stats
        mock_basic_stats = [
            {"name": "LeBron James"},
            {"name": "Anthony Davis"},
            {"name": "Jayson Tatum"},
            {"name": "Jaylen Brown"}
        ]
        mock_client.players_season_totals.return_value = mock_basic_stats
        
        mock_advanced_stats = [
            {"name": "LeBron James"},
            {"name": "Anthony Davis"},
            {"name": "Jayson Tatum"},
            {"name": "Jaylen Brown"}
        ]
        mock_client.players_advanced_season_totals.return_value = mock_advanced_stats
        
        # Mock game data for specific dates
        def mock_team_box_scores(**kwargs):
            day = kwargs.get('day')
            month = kwargs.get('month')
            year = kwargs.get('year')
            
            # Return games for recent dates
            if year == 2024 and month == 10:
                if day in [15, 16]:
                    return [
                        {"home_team": "Lakers", "away_team": "Celtics", "date": f"{year}-{month:02d}-{day:02d}"}
                    ]
            return []
        
        mock_client.team_box_scores.side_effect = mock_team_box_scores
        
        # Mock player box scores
        mock_client.player_box_scores.return_value = [
            {"name": "LeBron James", "points": 25, "assists": 8, "rebounds": 6},
            {"name": "Jayson Tatum", "points": 28, "assists": 5, "rebounds": 7}
        ]
        
        # Execute the scraper
        scraper.scrape_and_store()
        
        # Verify the workflow
        
        # 1. Verify API calls were made in correct order
        mock_client.standings.assert_called_once_with(season_end_year=scraper.SEASON_END_YEAR)
        mock_client.players_season_totals.assert_called_once_with(season_end_year=scraper.SEASON_END_YEAR)
        mock_client.players_advanced_season_totals.assert_called_once_with(season_end_year=scraper.SEASON_END_YEAR)
        
        # 2. Verify database operations
        self.assertTrue(mock_conn.commit.called)
        self.assertTrue(mock_conn.close.called)
        
        # 3. Verify that execute_batch was called (for inserting data)
        self.assertTrue(mock_execute_batch.called)
        
        # 4. Verify rate limiting (sleep was called)
        self.assertTrue(mock_sleep.called)
    
    def test_season_year_calculation_edge_cases(self):
        """Test season year calculation for edge cases."""
        
        # Test January (should be current year)
        with patch('nba_scrape_to_postgres.datetime') as mock_datetime:
            mock_datetime.date.today.return_value = datetime.date(2024, 1, 15)
            result = scraper.get_current_season_end_year()
            self.assertEqual(result, 2024)
        
        # Test June (should be current year - last month of season)
        with patch('nba_scrape_to_postgres.datetime') as mock_datetime:
            mock_datetime.date.today.return_value = datetime.date(2024, 6, 30)
            result = scraper.get_current_season_end_year()
            self.assertEqual(result, 2024)
        
        # Test July (should be next year - start of new season)
        with patch('nba_scrape_to_postgres.datetime') as mock_datetime:
            mock_datetime.date.today.return_value = datetime.date(2024, 7, 1)
            result = scraper.get_current_season_end_year()
            self.assertEqual(result, 2025)
    
    @patch('nba_scrape_to_postgres.psycopg2.connect')
    def test_database_error_handling(self, mock_connect):
        """Test that database errors are handled properly."""
        
        # Test connection error
        mock_connect.side_effect = Exception("Connection failed")
        
        with self.assertRaises(Exception) as context:
            scraper.get_connection()
        
        self.assertIn("Connection failed", str(context.exception))
    
    def test_data_validation_comprehensive(self):
        """Test comprehensive data validation scenarios."""
        
        # Test team data validation
        mixed_team_data = [
            ("Valid Team", "VAL", 50, 32),  # Valid
            ("", "INV", 40, 42),  # Invalid - empty name
            ("Another Valid", "VAL2", 45, 37),  # Valid
            ("Invalid Type", "INV2", "50", 32),  # Invalid - wrong type for wins
            ("No Abbrev", "", 30, 52),  # Invalid - empty abbreviation
        ]
        
        validated = scraper.validate_team_data(mixed_team_data)
        self.assertEqual(len(validated), 2)  # Only 2 valid teams
        self.assertEqual(validated[0][0], "Valid Team")
        self.assertEqual(validated[1][0], "Another Valid")
        
        # Test player data validation
        mixed_player_data = [
            ("Valid Player", "PG", 1, "6-0", 180, "1990-01-01", "USA"),  # Valid
            ("", "SG", 2, "6-2", 185, "1991-01-01", "USA"),  # Invalid - empty name
            ("Another Valid", "SF", 3, "6-8", 220, "1992-01-01", "USA"),  # Valid
            (None, "PF", 4, "6-10", 240, "1993-01-01", "USA"),  # Invalid - None name
            ("Incomplete",),  # Invalid - incomplete data
        ]
        
        validated = scraper.validate_player_data(mixed_player_data)
        self.assertEqual(len(validated), 2)  # Only 2 valid players
        self.assertEqual(validated[0][0], "Valid Player")
        self.assertEqual(validated[1][0], "Another Valid")


if __name__ == '__main__':
    unittest.main()