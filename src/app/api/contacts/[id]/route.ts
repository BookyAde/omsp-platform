import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["unread", "read", "archived"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try { body = await req.json(); }
  catch { return badRequest("Invalid JSON body."); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid status value. Must be unread, read, or archived.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("contacts")
    .update({ status: parsed.data.status })
    .eq("id", params.id);

  if (error) return serverError(error.message);
  return NextResponse.json({ success: true });
}
