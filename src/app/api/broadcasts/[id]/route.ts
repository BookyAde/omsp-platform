import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";

type Params = {
  params: {
    id: string;
  };
};

// GET a single broadcast
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const id = params.id;
  if (!id) {
    return badRequest("Broadcast ID is required.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("email_broadcasts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }
    return serverError(error.message);
  }

  return NextResponse.json(data);
}

// DELETE a broadcast
export async function DELETE(
  _req: NextRequest,
  { params }: Params
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const id = params.id;
  if (!id) {
    return badRequest("Broadcast ID is required.");
  }

  const admin = createAdminClient();

  // Because of ON DELETE CASCADE on broadcast_recipients, recipients are auto‑deleted
  const { error } = await admin
    .from("email_broadcasts")
    .delete()
    .eq("id", id);

  if (error) {
    return serverError(error.message);
  }

  return NextResponse.json({
    success: true,
    message: "Broadcast deleted successfully.",
  });
}