/**
 * lib/supabase.ts
 *
 * Exports three Supabase clients:
 *   createBrowserClient  → use in Client Components ("use client")
 *   createServerSupabaseClient → use in Server Components / Route Handlers
 *   createAdminClient    → service-role client, server-side only, never expose to browser
 */

import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import { createServerClient as _createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client
export function createBrowserClient() {
  return _createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}

// Server client
export async function createServerSupabaseClient() {
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();

  return _createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Parameters<typeof cookieStore.set>[2];
        }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Safe to ignore in Server Components
        }
      },
    },
  });
}

// Admin client
export function createAdminClient() {
  return createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}