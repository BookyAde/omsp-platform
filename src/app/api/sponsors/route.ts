import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, getAuthUser, badRequest, serverError } from "@/lib/server-utils";
import { sponsorSchema } from "@/lib/validations";

// ─── GET — list sponsors ──────────────────────────────────────────────────────
// Public callers: only active sponsors.
// Admin callers: all sponsors regardless of is_active.

export async function GET() {
  const user  = await getAuthUser();
  const admin = createAdminClient();

  let query = admin.from("sponsors").select("*").order("tier");

  if (!user) {
    // Public — only expose active sponsors
    query = query.eq("is_active", true) as typeof query;
  } else {
    // Authenticated — verify admin role to decide what to return
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      // Authenticated but not admin — still only public active sponsors
      query = query.eq("is_active", true) as typeof query;
    }
    // Admin sees all sponsors
  }

  const { data, error } = await query;
  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

// ─── POST — create sponsor (admin only) ──────────────────────────────────────

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try { body = await req.json(); }
  catch { return badRequest("Invalid JSON body."); }

  const parsed = sponsorSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed.", parsed.error.flatten());
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("sponsors")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json(data, { status: 201 });
}
