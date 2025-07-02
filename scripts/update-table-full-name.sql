-- Update the applications table to use full_name instead of first_name and last_name
ALTER TABLE applications 
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name;

-- Add full_name column
ALTER TABLE applications 
ADD COLUMN full_name TEXT NOT NULL CHECK (length(full_name) > 0);

-- Update the table structure to match our form
-- The final table structure will be:
-- - id (UUID, primary key)
-- - created_at (timestamp)
-- - full_name (text, required)
-- - email (text, required, unique)
-- - twitter_handle (text, optional)
-- - linkedin_url (text, optional)
-- - additional_info (text, required)
-- - status (text, default 'pending')

-- Test the updated table structure
DO $$
BEGIN
  -- Test if the constraint works with the new structure
  RAISE NOTICE 'Testing updated table structure...';
  
  -- This should work
  INSERT INTO applications (full_name, email, twitter_handle, additional_info) 
  VALUES ('John Doe', 'test@example.com', 'johndoe', 'Built a successful startup');
  
  -- Clean up test data
  DELETE FROM applications WHERE email = 'test@example.com';
  
  RAISE NOTICE 'Table structure update test passed!';
END $$;
