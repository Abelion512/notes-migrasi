import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function dapatkanClientSupabase(url?: string, key?: string): SupabaseClient | null {
  if (client) return client;

  const finalUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const finalKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (finalUrl && finalKey) {
    client = createClient(finalUrl, finalKey);
    return client;
  }

  return null;
}
