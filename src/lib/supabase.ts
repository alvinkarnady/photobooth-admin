import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton Supabase client — one instance for both server and browser
// This avoids the "Multiple GoTrueClient instances" warning
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: SupabaseClient<any, 'public', any> | null = null;

function getClient() {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined',
      },
    });
  }
  return _supabase;
}

// Default export for general use (DB queries, storage, etc.)
export const supabase = getClient();

// Alias for browser auth usage — returns the same singleton
export function getSupabaseBrowserClient() {
  return getClient();
}
