import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const broadcastId = params.id;
  if (!broadcastId) {
    return badRequest("Broadcast ID is required.");
  }

  const admin = createAdminClient();

  // First verify the broadcast exists
  const { data: broadcast, error: broadcastError } = await admin
    .from("email_broadcasts")
    .select("id")
    .eq("id", broadcastId)
    .single();

  if (broadcastError || !broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
  }

  // Fetch recipients
  const { data: recipients, error: recipientsError } = await admin
    .from("broadcast_recipients")
    .select("email, user_id, status, created_at")
    .eq("broadcast_id", broadcastId)
    .order("created_at", { ascending: false });

  if (recipientsError) {
    return serverError(recipientsError.message);
  }

  return NextResponse.json({ recipients: recipients ?? [] });
}