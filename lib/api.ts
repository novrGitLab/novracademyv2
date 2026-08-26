import { cookies } from "next/headers";

// Calls the backend API rather than accessing database services directly.
const API_URL = process.env.API_URL ?? "http://localhost:4000";
const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`API error ${status}`);
  }
}

/**
 * Server-side fetch helper for calling the Express API from Next.js
 * Server Components/Actions. Forwards the incoming request's cookies
 * so the API can verify the caller's NextAuth session.
 *
 * Aborts after `timeoutMs` (default 5s) so a slow/unreachable API can't hang
 * a page render forever — this throws an ApiError(504) same as any other
 * failed request, so callers that need to survive a down API should use
 * `apiFetchSafe` instead of handling the timeout specially.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const cookieHeader = cookies().toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
        ...init.headers,
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(504, { error: `API request to ${path} timed out after ${timeoutMs}ms` });
    }
    throw new ApiError(502, { error: `API request to ${path} failed: ${(err as Error).message}` });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/**
 * Same as `apiFetch`, but never throws — on timeout, network failure, or a
 * non-2xx response it logs a warning and resolves with `fallback` instead.
 * Use this for read-only data that renders a page; a page should degrade to
 * an empty state rather than hang or 500 when the API is slow or down.
 */
export async function apiFetchSafe<T>(
  path: string,
  fallback: T,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  try {
    return await apiFetch<T>(path, init, timeoutMs);
  } catch (err) {
    console.warn(`apiFetchSafe: falling back to default for ${path}:`, (err as Error).message);
    return fallback;
  }
}
