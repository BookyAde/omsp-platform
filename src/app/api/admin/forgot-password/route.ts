import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { adminInviteSchema } from "@/lib/validations";
import { generateAdminAuthLink, sendAdminAuthEmail } from "@/lib/admin-auth-email";

const forgotPasswordSchema = adminInviteSchema.pick({ email: true });

// POST: public. Always answers 200 with the same body so the response never
// reveals whether the address belongs to an admin.
export async function POST(req: NextRequest) {
  const genericResponse = NextResponse.json({ ok: true });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return genericResponse;
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return genericResponse;

  const { email } = parsed.data;

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .ilike("email", email.replace(/[\\%_]/g, "\\$&"))
      .eq("role", "admin")
      .eq("is_revoked", false)
      .maybeSingle();

    if (profile) {
      const { url } = await generateAdminAuthLink({
        email: profile.email,
        type: "recovery",
      });
      await sendAdminAuthEmail({
        email: profile.email,
        fullName: profile.full_name,
        type: "recovery",
        url,
      });
    }
  } catch (err) {
    console.error("Forgot-password error:", err);
  }

  return genericResponse;
}
