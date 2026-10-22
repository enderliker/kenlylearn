import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-Side Supabase Client (Browser Context)
 * 
 * SECURITY RULES:
 * 1. ONLY uses the public `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
 * 2. NEVER references or exposes `SUPABASE_SERVICE_ROLE_KEY`.
 * 3. All operations executed through this client are automatically constrained
 *    by Row Level Security (RLS) policies configured in PostgreSQL.
 */
let clientInstance: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase public credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    );
  }

  // Double-check: ensure service_role is not accidentally used
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__SERVICE_ROLE__) {
    throw new Error('SECURITY VIOLATION: Service role key must never exist in browser execution context.');
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return clientInstance;
}
