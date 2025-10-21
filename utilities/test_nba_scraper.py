import unittest
from unittest.mock import Mock, patch, MagicMock
import datetime
import sys
import os

# Add the current directory to the path so we can import the module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import nba_scrape_to_postgres as scraper


class TestNBAScraper(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.test_date = datetime.date(2024, 10, 17)
        
    def test_get_current_season_end_year_winter(self):
        """Test season year calculation during winter months."""
        with patch('nba_scrape_to_postgres.datetime') as mock_datetime:
            mock_datetime.date.today.return_value = datetime.date(2024, 3, 15)
            result = scraper.get_current_season_end_year()
            self.assertEqual(result, 2024)
    
    def test_get_current_season_end_year_summer(self):
        """Test season year calculation during summer months."""
        with patch('nba_scrape_to_postgres.datetime') as mock_datetime:
            mock_datetime.date.today.return_value = datetime.date(2024, 8, 15)
            result = scraper.get_current_season_end_year()
            self.assertEqual(result, 2025)
    
    @patch('nba_scrape_to_postgres.psycopg2.connect')
    def test_get_connection(self, mock_connect):
        """Test database connection creation."""
        mock_conn = Mock()
        mock_connect.return_value = mock_conn
        
        result = scraper.get_connection()
        
        mock_connect.assert_called_once_with(
            dbname="nba_stats_db",
            user="postgres", 
            password="1738",
            host="localhost",
            port="5432"
        )
        self.assertEqual(result, mock_conn)
    
    @patch('nba_scrape_to_postgres.execute_batch')
    def test_insert_teams(self, mock_execute_batch):
        """Test team data insertion."""
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.__enter__ = Mock(return_value=mock_cursor)
        mock_cursor.__exit__ = Mock(return_value=None)
        
        test_teams = [
            ("Los Angeles Lakers", "LAL", 50, 32),
            ("Boston Celtics", "BOS", 55, 27)
        ]
        
        scraper.insert_teams(mock_conn, test_teams)
        
        # Check that execute_batch was called
        mock_execute_batch.assert_called_once()
        args, kwargs = mock_execute_batch.call_args
        self.assertEqual(args[2], test_teams)  # Third argument should be the data
    
    @patch('nba_scrape_to_postgres.execute_batch')
    def test_insert_players(self, mock_execute_batch):
        """Test player data insertion."""
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.__enter__ = Mock(return_value=mock_cursor)
        mock_cursor.__exit__ = Mock(return_value=None)
        
        test_players = [
            ("LeBron James", "SF", 1, "6-9", 250, "1984-12-30", "USA"),
            ("Jayson Tatum", "SF", 2, "6-8", 210, "1998-03-03", "USA")
        ]
        
        scraper.insert_players(mock_conn, test_players)
        
        # Check that execute_batch was called
        mock_execute_batch.assert_called_once()
        args, kwargs = mock_execute_batch.call_args
        self.assertEqual(args[2], test_players)  # Third argument should be the data
    
    @patch('nba_scrape_to_postgres.execute_batch')
    def test_insert_games(self, mock_execute_batch):
        """Test game data insertion."""
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.__enter__ = Mock(return_value=mock_cursor)
        mock_cursor.__exit__ = Mock(return_value=None)
        
        test_games = [
            ("2024-10-16", 1, 2, 110, 105),
            ("2024-10-15", 2, 1, 98, 102)
        ]
        
        scraper.insert_games(mock_conn, test_games)
        
        # Check that execute_batch was called
        mock_execute_batch.assert_called_once()
        args, kwargs = mock_execute_batch.call_args
        self.assertEqual(args[2], test_games)  # Third argument should be the data
    
    @patch('nba_scrape_to_postgres.client')
    @patch('nba_scrape_to_postgres.get_connection')
    @patch('nba_scrape_to_postgres.insert_teams')
    @patch('nba_scrape_to_postgres.insert_players')
    @patch('nba_scrape_to_postgres.time.sleep')
    def test_scrape_and_store_success(self, mock_sleep, mock_insert_players, mock_insert_teams, mock_get_conn, mock_client):
        """Test successful scraping and storage of data."""
        # Mock database connection
        mock_conn = Mock()
        mock_get_conn.return_value = mock_conn
        
        # Mock API responses with realistic data
        mock_team = Mock()
        mock_team.value = "Los Angeles Lakers"
        mock_team.name = "LAL"
        
        mock_standings = [
            {"team": mock_team, "wins": 50, "losses": 32}
        ]
        mock_client.standings.return_value = mock_standings
        
        mock_basic_stats = [{"name": "LeBron James"}, {"name": "Anthony Davis"}]
        mock_client.players_season_totals.return_value = mock_basic_stats
        
        mock_advanced_stats = [{"name": "LeBron James"}, {"name": "Anthony Davis"}]
        mock_client.players_advanced_season_totals.return_value = mock_advanced_stats
        
        # Mock game data - return empty list to avoid complications
        mock_client.team_box_scores.return_value = []
        mock_client.player_box_scores.return_value = []
        
        # Execute the function
        scraper.scrape_and_store()
        
        # Verify API calls were made
        self.assertTrue(mock_client.standings.called)
        self.assertTrue(mock_client.players_season_totals.called)
        self.assertTrue(mock_client.players_advanced_season_totals.called)
        
        # Verify database operations
        self.assertTrue(mock_conn.commit.called)
        mock_insert_teams.assert_called_once()
        mock_insert_players.assert_called_once()
    
    @patch('nba_scrape_to_postgres.client')
    @patch('nba_scrape_to_postgres.get_connection')
    def test_scrape_and_store_api_error(self, mock_get_conn, mock_client):
        """Test handling of API errors during scraping."""
        # Mock database connection
        mock_conn = Mock()
        mock_get_conn.return_value = mock_conn
        
        # Mock API to raise an exception
        mock_client.standings.side_effect = Exception("API Error")
        
        # Should raise the exception
        with self.assertRaises(Exception):
            scraper.scrape_and_store()
    
    @patch('nba_scrape_to_postgres.get_connection')
    def test_scrape_and_store_db_error(self, mock_get_conn):
        """Test handling of database errors during scraping."""
        # Mock database connection to raise an error
        mock_get_conn.side_effect = Exception("Database connection failed")
        
        # Should raise the exception
        with self.assertRaises(Exception):
            scraper.scrape_and_store()
    
    @patch('nba_scrape_to_postgres.datetime')
    @patch('nba_scrape_to_postgres.client')
    @patch('nba_scrape_to_postgres.get_connection')
    @patch('nba_scrape_to_postgres.time.sleep')
    def test_game_date_search_logic(self, mock_sleep, mock_get_conn, mock_client, mock_datetime):
        """Test the logic for finding recent games."""
        # Mock current date
        mock_datetime.date.today.return_value = datetime.date(2024, 10, 17)
        mock_datetime.timedelta = datetime.timedelta
        
        # Mock database connection
        mock_conn = Mock()
        mock_get_conn.return_value.__enter__.return_value = mock_conn
        
        # Mock standings and player stats to avoid other calls
        mock_client.standings.return_value = []
        mock_client.players_season_totals.return_value = []
        mock_client.players_advanced_season_totals.return_value = []
        
        # Mock team box scores - return games for some dates, empty for others
        def mock_team_box_scores(**kwargs):
            if kwargs.get('day') == 16:  # Yesterday
                return [{"game": "mock_game_1"}]
            elif kwargs.get('day') == 15:  # Day before yesterday
                return [{"game": "mock_game_2"}]
            else:
                return []
        
        mock_client.team_box_scores.side_effect = mock_team_box_scores
        mock_client.player_box_scores.return_value = []
        
        # Execute the function
        scraper.scrape_and_store()
        
        # Verify that team_box_scores was called multiple times to search for games
        self.assertTrue(mock_client.team_box_scores.call_count > 0)


class TestRequestsPatching(unittest.TestCase):
    """Test the requests patching."""
    
    def test_validate_team_data_valid(self):
        """Test team data validation with valid data."""
        valid_teams = [
            ("Los Angeles Lakers", "LAL", 50, 32),
            ("Boston Celtics", "BOS", 55, 27)
        ]
        result = scraper.validate_team_data(valid_teams)
        self.assertEqual(result, valid_teams)
    
    def test_validate_team_data_invalid(self):
        """Test team data validation with invalid data."""
        invalid_teams = [
            ("Los Angeles Lakers", "LAL", "50", 32),  # Invalid wins type
            ("", "BOS", 55, 27),  # Empty team name
            ("Miami Heat", "", 45, 37),  # Empty abbreviation
            ("Chicago Bulls", "CHI"),  # Missing data
        ]
        result = scraper.validate_team_data(invalid_teams)
        self.assertEqual(len(result), 0)  # All should be filtered out
    
    def test_validate_player_data_valid(self):
        """Test player data validation with valid data."""
        valid_players = [
            ("LeBron James", "SF", 1, "6-9", 250, "1984-12-30", "USA"),
            ("Jayson Tatum", "SF", 2, "6-8", 210, "1998-03-03", "USA")
        ]
        result = scraper.validate_player_data(valid_players)
        self.assertEqual(result, valid_players)
    
    def test_validate_player_data_invalid(self):
        """Test player data validation with invalid data."""
        invalid_players = [
            ("", "SF", 1, "6-9", 250, "1984-12-30", "USA"),  # Empty name
            (None, "SF", 1, "6-9", 250, "1984-12-30", "USA"),  # None name
            ("LeBron James", "SF", 1),  # Missing data
        ]
        result = scraper.validate_player_data(invalid_players)
        self.assertEqual(len(result), 0)  # All should be filtered out

    def test_requests_session_headers(self):
        """Test that the requests session has correct headers."""
        # Import should trigger the patching
        import nba_scrape_to_postgres as scraper
        import requests
        
        expected_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://www.basketball-reference.com/",
            "Connection": "keep-alive",
        }
        
        # Check that our session headers are set
        self.assertIn("User-Agent", scraper.session.headers)
        self.assertEqual(scraper.session.headers["User-Agent"], expected_headers["User-Agent"])
    
    @patch('nba_scrape_to_postgres.execute_batch')
    def test_insert_empty_data(self, mock_execute_batch):
        """Test insert functions handle empty data gracefully."""
        mock_conn = Mock()
        
        # Test empty teams
        scraper.insert_teams(mock_conn, [])
        mock_execute_batch.assert_not_called()
        
        # Test empty players
        scraper.insert_players(mock_conn, [])
        mock_execute_batch.assert_not_called()
        
        # Test empty games
        scraper.insert_games(mock_conn, [])
        mock_execute_batch.assert_not_called()


if __name__ == '__main__':
    unittest.main()