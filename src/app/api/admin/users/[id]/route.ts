import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const targetId = params.id;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user?.id === targetId) {
    return badRequest("You cannot revoke your own admin access.");
  }

  const admin = createAdminClient();
  const { count, error: countError } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if (countError) return serverError(countError.message);
  if (count !== null && count <= 1) {
    return badRequest("Cannot revoke access. There must be at least one admin.");
  }

  // Update role to member AND flag as revoked
  const { error } = await admin
    .from("profiles")
    .update({ role: "member", is_revoked: true }) 
    .eq("id", targetId);

  if (error) return serverError(error.message);
  return NextResponse.json({ success: true });
}