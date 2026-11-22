import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

/**
 * Browser-side BetterAuth client.
 *
 * `jwtClient()` gives us `authClient.token()`, which signs a short-lived JWT
 * for the Express API. `inferAdditionalFields` carries the server's extra
 * user fields (role / phone / area / bio) over to the client types — it is a
 * type-only import, so no server code reaches the bundle.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [jwtClient(), inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession, getSession, updateUser } = authClient;

/**
 * Fetch a fresh JWT for the Express API (signs on every call, so the token is
 * never stale). Returns null when there is no session.
 */
export async function getClientJwtToken(): Promise<string | null> {
  const { data, error } = await authClient.token();
  if (error || !data?.token) return null;
  return data.token;
}

/**
 * Re-read the session from the database, bypassing better-auth's session cookie
 * cache.
 *
 * The Express API writes profile changes straight to Mongo, so the 7-day JWT
 * cookie cache would keep serving the old name and photo — the navbar avatar
 * and the dashboard identity card would look unchanged until the cache expired.
 * The session route rewrites the cache cookie whenever it loads a session from
 * the database, and `useSession` subscribers re-render on the update, so this
 * one call is what makes a saved profile show up immediately.
 */
export async function refreshClientSession(): Promise<void> {
  try {
    await authClient.getSession({ query: { disableCookieCache: true } });
  } catch {
    // The next navigation re-reads the session anyway; a failed refresh is
    // never worth failing the save the user just made.
  }
}
