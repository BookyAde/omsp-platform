/**
 * lib/site-url.ts
 *
 * Public base URL of the site, without a trailing slash.
 * Falls back to the local dev server when NEXT_PUBLIC_SITE_URL is not set.
 */
export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    `http://localhost:${process.env.PORT ?? 3000}`
  ).replace(/\/$/, "");
}
