import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { eventSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try { body = await req.json(); }
  catch { return badRequest("Invalid JSON body."); }

  const parsed = eventSchema.partial().safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed.", parsed.error.flatten());
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("events")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = createAdminClient();
  const { error } = await admin.from("events").delete().eq("id", params.id);
  if (error) return serverError(error.message);
  return NextResponse.json({ success: true });
}
