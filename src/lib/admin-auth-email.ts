/**
 * lib/admin-auth-email.ts
 *
 * Shared by the admin invite route and the forgot-password route.
 * Generates a Supabase invite / recovery link server-side and delivers it
 * through Brevo (lib/email.ts) instead of Supabase's built-in mailer.
 *
 * The emailed URL points at /auth/confirm with a token_hash in the query
 * string, which the confirm route exchanges for a session via verifyOtp.
 */

import { createAdminClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";

export type AdminLinkType = "invite" | "recovery";

export class AdminAuthError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildConfirmUrl(tokenHash: string, type: AdminLinkType) {
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
    next: "/admin/set-password",
  });
  return `${getSiteUrl()}/auth/confirm?${params.toString()}`;
}

/**
 * Creates the Supabase link and returns the confirmation URL.
 * For "invite" this also creates the auth user, so callers must clean up
 * (deleteUser) if a later step fails.
 */
export async function generateAdminAuthLink({
  email,
  type,
  fullName,
}: {
  email: string;
  type: AdminLinkType;
  fullName?: string;
}): Promise<{ url: string; userId: string }> {
  const admin = createAdminClient();

  const { data, error } =
    type === "invite"
      ? await admin.auth.admin.generateLink({
          type: "invite",
          email,
          options: fullName ? { data: { full_name: fullName } } : undefined,
        })
      : await admin.auth.admin.generateLink({ type: "recovery", email });

  if (error || !data?.properties?.hashed_token || !data.user) {
    const message = error?.message ?? "Failed to generate auth link.";
    throw new AdminAuthError(message, /already/i.test(message) ? 409 : 400);
  }

  return {
    url: buildConfirmUrl(data.properties.hashed_token, type),
    userId: data.user.id,
  };
}

/** Sends the invite / reset email through Brevo. Throws AdminAuthError on failure. */
export async function sendAdminAuthEmail({
  email,
  fullName,
  type,
  url,
}: {
  email: string;
  fullName?: string | null;
  type: AdminLinkType;
  url: string;
}) {
  const isInvite = type === "invite";
  const subject = isInvite
    ? "You've been invited to OMSP Admin"
    : "Reset your OMSP Admin password";

  const greeting = fullName ? `Hello ${escapeHtml(fullName)},` : "Hello,";
  const intro = isInvite
    ? "You have been invited to join the OMSP admin dashboard. Use the button below to set your password and sign in."
    : "We received a request to set a new password for your OMSP admin account. Use the button below to choose a new password.";
  const cta = isInvite ? "Set your password" : "Reset password";
  const outro = isInvite
    ? "If you were not expecting this invitation, you can safely ignore this email."
    : "If you did not request this, you can safely ignore this email. Your password will not change.";

  const html = `
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 24px 0;">${intro}</p>
    <p style="margin:0 0 24px 0;">
      <a href="${url}" style="display:inline-block; background:#0d9488; color:#ffffff; font-weight:700; text-decoration:none; padding:12px 24px; border-radius:10px;">
        ${cta}
      </a>
    </p>
    <p style="margin:0 0 16px 0; font-size:13px; color:#64748b;">
      This link can only be used once and expires shortly. If the button does not work, copy and paste this address into your browser:<br />
      <span style="word-break:break-all;">${url}</span>
    </p>
    <p style="margin:0; font-size:13px; color:#64748b;">${outro}</p>
  `;

  try {
    await sendEmail({ to: email, subject, html, senderType: "admin" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown email error";
    console.error("Admin auth email failed:", detail);
    throw new AdminAuthError(`Failed to send email: ${detail}`, 502);
  }
}
