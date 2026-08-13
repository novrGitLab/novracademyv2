import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const TIMEOUT_MS = 8000;

/**
 * Same-origin proxy from the browser to the Express API.
 *
 * Forwards ALL headers from the incoming request (including cookies) to the
 * backend, replacing only `host` and `origin` with the backend URL. This
 * ensures __Secure-next-auth.session-token and any other auth cookies arrive
 * intact at the backend.
 *
 * Uses req.arrayBuffer() to preserve the raw request body bytes exactly —
 * avoids any double-stringification that req.text() can cause.
 */
async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/");
  const search = req.nextUrl.search;
  const backendUrl = `${API_URL}${path}${search}`;
  const backendHost = new URL(API_URL).host;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Forward ALL incoming headers, replacing host/origin with the backend.
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "origin" || lower === "referer") {
      headers.set(key, lower === "host" ? backendHost : API_URL);
    } else if (lower !== "connection") {
      headers.set(key, value);
    }
  });

  // Read the raw body bytes — arrayBuffer avoids string encoding issues.
  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "DELETE") {
    body = await req.arrayBuffer();
  }

  try {
    const res = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
      signal: controller.signal,
    });

    const responseBody = res.status === 204 ? null : await res.json().catch(() => null);
    return NextResponse.json(responseBody, { status: res.status });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { error: timedOut ? `API request to ${path} timed out` : `API request to ${path} failed` },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
