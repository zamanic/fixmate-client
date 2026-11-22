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
