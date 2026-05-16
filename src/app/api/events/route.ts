import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { eventSchema } from "@/lib/validations";

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function GET() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) return serverError(error.message);

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(
      "Validation failed.",
      parsed.error.flatten()
    );
  }

  const payload = {
    ...parsed.data,
    slug: normalizeSlug(
      parsed.data.slug || parsed.data.title
    ),
    start_time: parsed.data.start_time || null,
    end_time: parsed.data.end_time || null,
    location: parsed.data.location || null,
    cover_image_url:
      parsed.data.cover_image_url || null,
    registration_form_id:
      parsed.data.registration_form_id || null,
    capacity:
      parsed.data.capacity ?? null,
  };

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("events")
    .insert(payload)
    .select()
    .single();

  if (error) return serverError(error.message);

  return NextResponse.json(data, {
    status: 201,
  });
}