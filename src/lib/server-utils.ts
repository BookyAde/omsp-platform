/**
 * lib/server-utils.ts
 *
 * Server-side utilities for API route handlers.
 * Import only in Route Handlers and Server Actions — never in client components.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

// ─── Admin auth guard ─────────────────────────────────────────────────────────

/**
 * requireAdmin()
 *
 * Call at the top of every admin-only API route handler.
 * Returns null if the caller is an authenticated admin.
 * Returns a 401/403 NextResponse immediately if not — the caller must return it.
 *
 * Usage:
 *   const authError = await requireAdmin();
 *   if (authError) return authError;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = await createServerSupabaseClient();

  // 1. Verify session exists
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Check role in profiles table using the admin client to bypass RLS
  //    (the anon client would only see the row if RLS allows it — the service
  //    role client guarantees we always get the real role)
  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null; // caller is an authenticated admin
}

/**
 * getAuthUser()
 *
 * Returns the authenticated user, or null.
 * Use for routes that need the user ID but don't require admin role.
 */
export async function getAuthUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

// ─── Structured error helpers ─────────────────────────────────────────────────

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status: 400 }
  );
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}
