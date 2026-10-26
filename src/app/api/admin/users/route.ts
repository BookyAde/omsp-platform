import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { adminInviteSchema } from "@/lib/validations";
import {
  AdminAuthError,
  generateAdminAuthLink,
  sendAdminAuthEmail,
} from "@/lib/admin-auth-email";

// GET: Fetch admins and revoked admins
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = createAdminClient();

  // Fetch anyone who is currently an admin OR has been revoked
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, full_name, role, created_at, is_revoked")
    .or("role.eq.admin,is_revoked.eq.true")
    .order("created_at", { ascending: false });

  if (error) return serverError(error.message);
  return NextResponse.json(data ?? []);
}

// POST: Invite new OR restore existing revoked admin
export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = adminInviteSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed.", parsed.error.flatten());

  const { email, full_name } = parsed.data;
  const admin = createAdminClient();

  // Case-insensitive lookup. Escape ilike wildcards so "_" and "%" in an
  // address are matched literally.
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, email")
    .ilike("email", email.replace(/[\\%_]/g, "\\$&"))
    .maybeSingle();

  if (existingProfile) {
    // Restore existing user
    const { error: updateErr } = await admin
      .from("profiles")
      .update({ role: "admin", full_name, is_revoked: false })
      .eq("id", existingProfile.id);

    if (updateErr) return serverError(updateErr.message);

    // Send a password-reset link so they can log back in
    try {
      const { url } = await generateAdminAuthLink({
        email: existingProfile.email,
        type: "recovery",
      });
      await sendAdminAuthEmail({
        email: existingProfile.email,
        fullName: full_name,
        type: "recovery",
        url,
      });
    } catch (err) {
      const status = err instanceof AdminAuthError ? err.status : 500;
      const message = err instanceof Error ? err.message : "Failed to send email.";
      return NextResponse.json(
        { error: `Admin access was restored, but the reset email could not be sent. ${message}` },
        { status }
      );
    }

    return NextResponse.json({ id: existingProfile.id, email, full_name, role: "admin" }, { status: 200 });
  }

  // Invite new user: generate the link (creates the auth user), set up the
  // profile, then email the link. If anything after creation fails, delete the
  // auth user so the invite can be retried cleanly.
  let link: { url: string; userId: string };
  try {
    link = await generateAdminAuthLink({ email, type: "invite", fullName: full_name });
  } catch (err) {
    const status = err instanceof AdminAuthError ? err.status : 400;
    const message = err instanceof Error ? err.message : "Invite failed.";
    return NextResponse.json({ error: message }, { status });
  }

  const { error: roleErr } = await admin
    .from("profiles")
    .upsert(
      { id: link.userId, email, full_name, role: "admin", is_revoked: false },
      { onConflict: "id" }
    );

  if (roleErr) {
    await admin.auth.admin.deleteUser(link.userId);
    return serverError(`Profile setup failed: ${roleErr.message}`);
  }

  try {
    await sendAdminAuthEmail({ email, fullName: full_name, type: "invite", url: link.url });
  } catch (err) {
    await admin.auth.admin.deleteUser(link.userId);
    const status = err instanceof AdminAuthError ? err.status : 502;
    const message = err instanceof Error ? err.message : "Failed to send invite email.";
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ id: link.userId, email, full_name, role: "admin" }, { status: 201 });
}
