import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const TIMEOUT_MS = 30000;

const SESSION_COOKIE_NAMES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

/**
 * Extract the raw NextAuth JWT string from the request cookies.
 */
function extractSessionToken(req: NextRequest): string | null {
  for (const name of SESSION_COOKIE_NAMES) {
    const value = req.cookies.get(name)?.value;
    if (value) return value;
  }
  return null;
}

/**
 * Same-origin proxy from the browser to the Express API.
 *
 * Extracts the raw NextAuth JWT from the session cookie and forwards it as
 * an Authorization: Bearer header. The backend validates it using the
 * shared NEXTAUTH_SECRET. Also forwards the raw cookie header as a fallback.
 */
async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/");
  const search = req.nextUrl.search;
  const backendUrl = `${API_URL}${path}${search}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Extract the raw JWT token and send as Authorization: Bearer.
  const token = extractSessionToken(req);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Also forward the raw cookie header as a fallback.
  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers["cookie"] = cookie;
  }

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
      redirect: "manual", // don't follow; let us pass through R2 signed redirects
      signal: controller.signal,
    });

    // Pass through redirects (e.g. /certificates/:uid/pdf → signed R2 URL)
    // so binary PDFs load correctly in iframes/links.
    if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
      const location = res.headers.get("location");
      if (location) {
        return NextResponse.redirect(location, res.status);
      }
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/pdf") || contentType.includes("audio/") || contentType.includes("image/") || contentType.includes("application/vnd")) {
      const arrayBuf = await res.arrayBuffer();
      return new NextResponse(arrayBuf, {
        status: res.status,
        headers: { "Content-Type": contentType },
      });
    }

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
