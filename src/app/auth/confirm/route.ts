import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { safeRedirectPath } from "@/lib/safe-redirect";
import type { EmailOtpType } from "@supabase/supabase-js";

const OTP_TYPES: EmailOtpType[] = [
  "invite",
  "recovery",
  "magiclink",
  "signup",
  "email_change",
  "email",
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(
    searchParams.get("next") ?? searchParams.get("redirect_to")
  );

  if (token_hash && type && OTP_TYPES.includes(type)) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/admin/login?error=invalid_token", request.url));
}
