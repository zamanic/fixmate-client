import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/** All BetterAuth endpoints: /api/auth/* (sign-in, sign-up, token, jwks …). */
export const { GET, POST } = toNextJsHandler(auth);
