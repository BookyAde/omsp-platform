import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { safeRedirectPath } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // The code is provided by Supabase in the URL
  const code = searchParams.get("code");
  // The 'next' param is what we set in our API route (/admin/dashboard)
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createServerSupabaseClient();
    
    // Exchange the code for a session (this sets the auth cookie)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success! Send them to the dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }

    // If there's an error, log it and send them to the homepage with an error message
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`);
  }

  // No code found in URL, redirect to homepage
  return NextResponse.redirect(`${origin}/?error=Missing_auth_code`);
}