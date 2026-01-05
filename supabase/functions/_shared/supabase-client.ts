// Supabase Client for Edge Functions
// Uses service role key to bypass RLS for server-side operations

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

export const createServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }

  // Service role client bypasses Row Level Security (RLS)
  // This is necessary for Edge Functions to access all data
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
