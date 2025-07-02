-- Fix the email constraint to be more permissive
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_email_check;

-- Add a simpler, more reliable email constraint
ALTER TABLE applications ADD CONSTRAINT applications_email_check 
CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

-- Test the constraint with a sample email
DO $$
BEGIN
  -- Test if the constraint works with common email formats
  RAISE NOTICE 'Testing email constraint...';
  
  -- This should work
  INSERT INTO applications (first_name, last_name, email, twitter_handle, additional_info) 
  VALUES ('Test', 'User', 'test@gmail.com', 'testuser', 'Test accomplishment');
  
  -- Clean up test data
  DELETE FROM applications WHERE email = 'test@gmail.com';
  
  RAISE NOTICE 'Email constraint test passed!';
END $$;
