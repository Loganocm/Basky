-- Add box_score_synced column to track processing progress
-- This allows the batch processor to resume where it left off

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS box_score_synced BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_games_box_score_synced 
ON games(box_score_synced) 
WHERE box_score_synced = FALSE OR box_score_synced IS NULL;

-- Add nba_game_id column if it doesn't exist (for NBA API lookups)
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS nba_game_id VARCHAR(20);

-- Create index on nba_game_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_games_nba_game_id 
ON games(nba_game_id);

-- Add unique constraint to prevent duplicate games
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_nba_game_id'
  ) THEN
    ALTER TABLE games ADD CONSTRAINT unique_nba_game_id UNIQUE (nba_game_id);
  END IF;
END $$;

-- Helper function to check if column exists (used by Edge Function)
CREATE OR REPLACE FUNCTION check_column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    AND column_name = $2
  );
END;
$$ LANGUAGE plpgsql;
