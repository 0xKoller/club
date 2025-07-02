import { createClient } from "@supabase/supabase-js"

// Types for our database - matching exact Supabase table structure
export type Application = {
  id?: string
  created_at?: string
  full_name: string
  email: string
  twitter_handle: string | null
  linkedin_url: string | null
  additional_info: string | null
  status?: "pending" | "reviewed" | "accepted" | "rejected"
}

// Database schema validation
export type Database = {
  public: {
    Tables: {
      applications: {
        Row: Application
        Insert: Omit<Application, "id" | "created_at">
        Update: Partial<Omit<Application, "id" | "created_at">>
      }
    }
  }
}

// Create a single supabase client for the server with proper typing
export const createServerSupabaseClient = () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    }

    // Validate URL format
    try {
      new URL(supabaseUrl)
    } catch (error) {
      throw new Error(`Invalid SUPABASE_URL format: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    const client = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: "public",
      },
    })

    return client
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}

// Create a singleton client for the browser
let clientSingleton: ReturnType<typeof createBrowserSupabaseClient> | null = null

export const createBrowserSupabaseClient = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing browser Supabase environment variables")
    }

    return createClient<Database>(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error("Error creating browser Supabase client:", error)
    throw error
  }
}

export const getBrowserSupabaseClient = () => {
  if (!clientSingleton) {
    try {
      clientSingleton = createBrowserSupabaseClient()
    } catch (error) {
      console.error("Error getting browser Supabase client:", error)
      throw error
    }
  }
  return clientSingleton
}
