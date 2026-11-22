import { getServerJwtToken } from "@/lib/auth-server";

/**
 * Server-component counterpart of `apiFetch`. Uses the cookie-backed session
 * to sign a JWT instead of the browser client.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export interface ServerFetchOptions extends RequestInit {
  /** Send a bearer token from the current session. */
  auth?: boolean;
}

/**
 * Fetch from a server component / route handler. Never throws — returns null
 * when the API is unreachable so a page can render its empty state instead of
 * crashing.
 */
export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}): Promise<T | null> {
  const { auth = false, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);

  if (auth) {
    const token = await getServerJwtToken();
    if (!token) return null;
    finalHeaders.set("authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
