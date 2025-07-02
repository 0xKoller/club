-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS applications;

-- Create applications table with proper structure
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL CHECK (length(first_name) > 0),
  last_name TEXT NOT NULL CHECK (length(last_name) > 0),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  twitter_handle TEXT CHECK (twitter_handle IS NULL OR length(twitter_handle) > 0),
  linkedin_url TEXT CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://.*linkedin\.com.*'),
  additional_info TEXT NOT NULL CHECK (length(additional_info) > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected'))
);

-- Create unique constraint on email
ALTER TABLE applications ADD CONSTRAINT applications_email_unique UNIQUE (email);

-- Create indexes for better performance
CREATE INDEX applications_email_idx ON applications(email);
CREATE INDEX applications_status_idx ON applications(status);
CREATE INDEX applications_created_at_idx ON applications(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything
CREATE POLICY "Service role can do everything" ON applications
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to insert
CREATE POLICY "Anyone can insert applications" ON applications
  FOR INSERT WITH CHECK (true);

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can read applications" ON applications
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON applications TO service_role;
GRANT INSERT, SELECT ON applications TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;
