import { headers } from "next/headers";
import { connection } from "next/server";
import { auth, ensureMongoConnected } from "@/lib/auth";

/**
 * Server-side auth helpers for server components, route handlers and layouts.
 * The browser equivalent lives in `auth-client.ts`.
 *
 * Every helper below starts with `await connection()`: Better Auth compares
 * `session.expiresAt` against the clock (`new Date()`) and jose stamps JWTs
 * with `Date.now()`. Under Cache Components those clock reads are rejected
 * during the prerender pass, so the session is explicitly deferred to request
 * time — the same intent as reading `headers()`, made visible to the compiler.
 *
 * They also heal the Mongo client and never throw. A session read is not
 * allowed to take a route to `src/app/error.tsx`: with no readable session the
 * page renders its signed-out state, which is the honest answer, and a private
 * route sends the visitor to `/sign-in` — never to "Something interrupted that
 * page."
 */

/** The active session, or null. */
export async function getServerSession() {
  await connection();
  await ensureMongoConnected();
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    console.error("[FixMate] session read failed:", error);
    return null;
  }
}

/** A fresh JWT for the Express API, or null when signed out. */
export async function getServerJwtToken(): Promise<string | null> {
  await connection();
  await ensureMongoConnected();
  try {
    const result = await auth.api.getToken({ headers: await headers() });
    return result?.token ?? null;
  } catch (error) {
    console.error("[FixMate] token read failed:", error);
    return null;
  }
}

/** The signed-in user with our additional fields typed in. */
export async function getCurrentUser() {
  const session = await getServerSession();
  if (!session?.user) return null;

  const user = session.user as typeof session.user & {
    role?: string | null;
    phone?: string | null;
    area?: string | null;
    bio?: string | null;
    createdAt?: Date | string | null;
  };

  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? "",
    role: (user.role ?? "customer") as "customer" | "technician" | "admin",
    phone: user.phone ?? "",
    area: user.area ?? "",
    bio: user.bio ?? "",
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  };
}
