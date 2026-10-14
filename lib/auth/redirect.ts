/** Where a signed-in customer lands when there is nothing to return to. */
export const DEFAULT_RETURN_PATH = "/appointments";

/** Local route that post-auth sign-in routes funnel through. */
export const AUTH_REDIRECT_PATH = "/auth/redirect";

/**
 * Accept a caller-supplied return target only if it is a same-origin path.
 *
 * `returnTo` arrives from the URL, so it is attacker-controlled. Anything that
 * could be read as a scheme or a host has to be rejected outright:
 * `//evil.com` and `/\evil.com` are both treated as protocol-relative by
 * browsers, and control characters can split a header/URL in transit.
 */
export function sanitizeReturnTo(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return null;
  // An encoded slash/backslash in the first segment decodes to a
  // protocol-relative URL as soon as anything downstream normalises it, so
  // reject it even though it is not literally `//` here.
  if (/^\/(?:%2f|%5c)/i.test(trimmed)) return null;
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return null;

  return trimmed;
}

/**
 * Build the `fallbackRedirectUrl` for Clerk's <SignIn>/<SignUp>.
 *
 * Clerk only honours redirect URLs that its dashboard allow-lists, so we never
 * hand it the caller's path directly — only our own `/auth/redirect` route,
 * which then redirects locally. No dashboard change is needed to preserve a
 * full path + query across sign-in.
 */
export function authFallbackRedirectUrl(returnTo?: unknown): string {
  const safe = sanitizeReturnTo(returnTo);
  if (!safe) return AUTH_REDIRECT_PATH;
  return `${AUTH_REDIRECT_PATH}?returnTo=${encodeURIComponent(safe)}`;
}
