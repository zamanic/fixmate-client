import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Server-side auth helpers for server components, route handlers and layouts.
 * The browser equivalent lives in `auth-client.ts`.
 */

/** The active session, or null. */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** A fresh JWT for the Express API, or null when signed out. */
export async function getServerJwtToken(): Promise<string | null> {
  const result = await auth.api.getToken({ headers: await headers() });
  return result?.token ?? null;
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
