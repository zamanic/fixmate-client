import { NextResponse, type NextRequest } from "next/server";
import { getCookieCache, getSessionCookie } from "better-auth/cookies";

/**
 * Route protection (Challenge 2 — frontend half).
 *
 * `proxy.ts` is Next 16's replacement for `middleware.ts`. It only checks the
 * presence of the BetterAuth session cookie — cheap, no database round-trip —
 * and bounces anonymous visitors to `/sign-in` with a `redirectTo` they come
 * back to after signing in. Per-role routing is enforced one level deeper, in
 * the dashboard layout, where a real session lookup is safe.
 *
 * See `.project/CONTRACT.md` §9.
 */

const PROTECTED_PREFIXES = ["/dashboard", "/payment"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!isProtected) return NextResponse.next();

  // `getCookieCache` decodes the 7-day session cookie cache (strategy: "jwt");
  // `getSessionCookie` is the fallback when the cache is disabled.
  const cached = await getCookieCache(request, {
    secret: process.env.BETTER_AUTH_SECRET,
    strategy: "jwt",
  });
  const hasSession = Boolean(cached) || Boolean(getSessionCookie(request));

  if (!hasSession) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/payment/:path*"],
};
