import { toNextJsHandler } from "better-auth/next-js";
import { auth, ensureMongoConnected } from "@/lib/auth";

/** All BetterAuth endpoints: /api/auth/* (sign-in, sign-up, token, jwks …). */
const handlers = toNextJsHandler(auth);

/**
 * BetterAuth shares the pooled Mongo client with the server components, so a
 * topology that an earlier failed connect closed would break sign-in as well —
 * exactly the fault that made a signed-in visit to `/sign-in` hit the error
 * boundary. Heal the client before BetterAuth touches it; when Atlas really is
 * unreachable, BetterAuth still reports its own error on the response.
 */
async function handleAuth(request: Request): Promise<Response> {
  await ensureMongoConnected();
  return handlers[request.method === "POST" ? "POST" : "GET"](request);
}

export const GET = handleAuth;
export const POST = handleAuth;
