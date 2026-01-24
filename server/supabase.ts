import { createClient } from '@supabase/supabase-js';

// Use environment variables for configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://ngnbwllvwvblvylllvyr.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
};
