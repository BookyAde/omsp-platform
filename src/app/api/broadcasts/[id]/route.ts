import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";

type Params = {
  params: {
    id: string;
  };
};

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