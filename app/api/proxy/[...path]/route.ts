import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const TIMEOUT_MS = 8000;

/**
 * Same-origin proxy from the browser to the Express API.
 *
 * Client components can't call the Express API directly with credentials —
 * it's a different origin, and the NextAuth session cookie doesn't reliably
 * cross-origin fetch. Routing through this same-origin Next.js handler
 * means the browser always sends the cookie (first-party), and this
 * handler forwards it to the API server-to-server, exactly like
 * `apiFetch` does for Server Components.
 */
async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/");
  const search = req.nextUrl.search;
  const cookieHeader = cookies().toString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "DELETE") {
    body = await req.text();
  }

  try {
    const targetUrl = `${API_URL}${path}${search}`;
    console.log(`[proxy] ${req.method} ${targetUrl}`);

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    console.log(`[proxy] ${req.method} ${path} → ${res.status}`);

    const responseBody = res.status === 204 ? null : await res.json().catch(() => null);
    return NextResponse.json(responseBody, { status: res.status });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    console.error(`[proxy] ${req.method} ${path} error:`, err);
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
