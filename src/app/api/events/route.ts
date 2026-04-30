import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { eventSchema } from "@/lib/validations";

// ─── GET — list all events (public) ──────────────────────────────────────────

export async function GET() {
  // Events listing is intentionally public (used by public /events page)
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

// ─── POST — create event (admin only) ────────────────────────────────────────

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try { body = await req.json(); }
  catch { return badRequest("Invalid JSON body."); }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed.", parsed.error.flatten());
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("events")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json(data, { status: 201 });
}
