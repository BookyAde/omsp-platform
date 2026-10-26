/**
 * lib/safe-redirect.ts
 *
 * Validates a user-supplied post-login redirect target so it can only ever be a
 * path on this site. Anything else (absolute URLs, protocol-relative `//host`,
 * `/\host`, control characters) falls back to the default.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/admin/dashboard"
) {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // Browsers strip tabs/newlines from URLs, so "/\t/host" would become "//host".
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  return value;
}
