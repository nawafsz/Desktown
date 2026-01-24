import { createClient } from '@supabase/supabase-js';

// Use environment variables for configuration with fallbacks
const supabaseUrl = process.env.SUPABASE_URL || 'https://ngnbwllvwvblvylllvyr.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_8FeXqL1jn4Odunj8594hfg_GgUCSeRq';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbmJ3bGx2d3ZibHZ5bGxsdnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzY2NTQsImV4cCI6MjA4NDUxMjY1NH0.FY7R4zAv3n9YaDgey9c7TAnYG36vQzsVjFLcMsVfv0k';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper to create a client with a user's access token
export const createSupabaseUserClient = (accessToken: string) => {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
};
