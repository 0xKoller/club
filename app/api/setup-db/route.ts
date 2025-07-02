import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Starting database setup...")

    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Supabase environment variables",
        },
        { status: 500 },
      )
    }

    console.log("Environment variables found")

    const supabase = createServerSupabaseClient()
    console.log("Supabase client created")

    // SQL commands to create the table
    const createTableSQL = `
      -- Drop table if exists (for clean setup)
      DROP TABLE IF EXISTS applications;

      -- Create applications table with proper structure
      CREATE TABLE applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        first_name TEXT NOT NULL CHECK (length(first_name) > 0),
        last_name TEXT NOT NULL CHECK (length(last_name) > 0),
        email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
        twitter_handle TEXT CHECK (twitter_handle IS NULL OR length(twitter_handle) > 0),
        linkedin_url TEXT CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://.*linkedin\\.com.*'),
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

      -- Create policy for anyone to insert
      CREATE POLICY "Anyone can insert applications" ON applications
        FOR INSERT WITH CHECK (true);

      -- Create policy for anyone to read
      CREATE POLICY "Users can read applications" ON applications
        FOR SELECT USING (true);
    `

    // Execute the SQL using rpc function
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: createTableSQL,
    })

    if (error) {
      console.error("SQL execution error:", error)
      return NextResponse.json(
        {
          success: false,
          error: `SQL execution failed: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("SQL executed successfully")

    // Test the table by inserting and then deleting a test record
    const testData = {
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      twitter_handle: "testuser",
      linkedin_url: null,
      additional_info: "This is a test application",
      status: "pending" as const,
    }

    console.log("Testing table with insert/delete...")

    const { data: insertData, error: insertError } = await supabase.from("applications").insert(testData).select()

    if (insertError) {
      console.error("Test insert failed:", insertError)
      return NextResponse.json(
        {
          success: false,
          error: `Test insert failed: ${insertError.message}`,
          details: insertError,
        },
        { status: 500 },
      )
    }

    console.log("Test insert successful:", insertData)

    // Delete the test record
    const { error: deleteError } = await supabase.from("applications").delete().eq("email", "test@example.com")

    if (deleteError) {
      console.error("Test delete failed:", deleteError)
    } else {
      console.log("Test delete successful")
    }

    return NextResponse.json({
      success: true,
      message: "Database setup complete and tested successfully",
      testResult: insertData,
    })
  } catch (error: any) {
    console.error("Unexpected error during setup:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Setup failed: ${error.message}`,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
