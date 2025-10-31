-- Add trainee_name column to programs table for searchability
ALTER TABLE programs ADD COLUMN IF NOT EXISTS trainee_name TEXT;

-- Create index for searching by trainee name
CREATE INDEX IF NOT EXISTS idx_programs_trainee_name ON programs(trainee_name);

