"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Client-side data fetch through the same-origin `/api/proxy` route (see
 * app/api/proxy/[...path]/route.ts). Always resolves — on failure it falls
 * back to `fallback` and sets `error`, it never throws — so a page using
 * this hook can render its shell immediately and only the data-dependent
 * parts need to react to `loading`.
 */
export function useApi<T>(path: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/proxy${path}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return (await res.json()) as T;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setData(fallback);
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `fallback` is intentionally excluded — callers usually pass a fresh
    // object literal each render, which would otherwise refetch forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refetch };
}

/** POST/PATCH/DELETE helper for client components, routed through the same proxy. */
export async function apiMutate<T = unknown>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
