import { getClientJwtToken } from "@/lib/auth-client";

/**
 * Thin client over the Express API.
 *
 * Every response error arrives in the contract's single envelope
 * `{ error: { code, message } }`, so callers can `catch (e) as ApiError` and
 * toast `e.message` directly. See `.project/CONTRACT.md` §4.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "SERVER_ERROR", status = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** JSON body — serialised for you. */
  body?: unknown;
  /** Attach a fresh `Authorization: Bearer <jwt>` header. */
  auth?: boolean;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Perform an API call and normalise both success and failure. */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = false, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);

  if (body !== undefined) finalHeaders.set("Content-Type", "application/json");

  if (auth) {
    const token = await getClientJwtToken();
    if (!token) {
      throw new ApiError("Your session has expired. Please sign in again.", "UNAUTHORIZED", 401);
    }
    finalHeaders.set("authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Cannot reach the FixMate service. Please try again.", "SERVER_ERROR", 0);
  }

  const data = await readJson(res);

  if (!res.ok) {
    const error = (data as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(
      error?.message ?? "Something went wrong. Please try again.",
      error?.code ?? "SERVER_ERROR",
      res.status
    );
  }

  return data as T;
}

/** Convenience wrappers — most call sites read better with these. */
export const apiGet = <T>(path: string, auth = false) => apiFetch<T>(path, { auth });
export const apiPost = <T>(path: string, body?: unknown, auth = false) =>
  apiFetch<T>(path, { method: "POST", body, auth });
export const apiPatch = <T>(path: string, body?: unknown, auth = false) =>
  apiFetch<T>(path, { method: "PATCH", body, auth });
export const apiDelete = <T>(path: string, auth = false) =>
  apiFetch<T>(path, { method: "DELETE", auth });
