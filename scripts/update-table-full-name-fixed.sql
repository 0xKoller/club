-- Update the applications table to use full_name instead of first_name and last_name
-- Handle existing data properly

-- Step 1: Add the full_name column as nullable first
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Step 2: Populate full_name from existing first_name and last_name data
UPDATE applications 
SET full_name = COALESCE(first_name, '') || 
                CASE 
                  WHEN first_name IS NOT NULL AND last_name IS NOT NULL AND last_name != '' 
                  THEN ' ' || last_name 
                  ELSE COALESCE(last_name, '') 
                END
WHERE full_name IS NULL;

-- Step 3: Handle any remaining null values (set to 'Unknown' as fallback)
UPDATE applications 
SET full_name = 'Unknown'
WHERE full_name IS NULL OR full_name = '';

-- Step 4: Now add the NOT NULL constraint and check constraint
ALTER TABLE applications 
ALTER COLUMN full_name SET NOT NULL;

ALTER TABLE applications 
ADD CONSTRAINT applications_full_name_check CHECK (length(full_name) > 0);

-- Step 5: Drop the old columns
ALTER TABLE applications 
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name;

-- Step 6: Verify the table structure
DO $$
BEGIN
  -- Check if the table structure is correct
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'applications' 
    AND column_name = 'full_name'
    AND is_nullable = 'NO'
  ) THEN
    RAISE NOTICE 'Table structure updated successfully!';
  ELSE
    RAISE EXCEPTION 'Table structure update failed!';
  END IF;
END $$;

-- Step 7: Test the updated table structure
DO $$
BEGIN
  -- Test if the constraint works with the new structure
  RAISE NOTICE 'Testing updated table structure...';
  
  -- This should work
  INSERT INTO applications (full_name, email, twitter_handle, additional_info) 
  VALUES ('Test User', 'test@example.com', 'testuser', 'Built a successful startup');
  
  -- Clean up test data
  DELETE FROM applications WHERE email = 'test@example.com';
  
  RAISE NOTICE 'Table structure update and test completed successfully!';
END $$;

-- Display final table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;
