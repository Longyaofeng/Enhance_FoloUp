-- Add missing columns to interviewer table
ALTER TABLE interviewer
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS voice TEXT;

-- Update existing records to set user_id (if needed)
-- UPDATE interviewer SET user_id = 'default_user' WHERE user_id IS NULL;

-- Add constraints if needed
ALTER TABLE interviewer
ALTER COLUMN user_id SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_interviewer_user_id ON interviewer(user_id); 