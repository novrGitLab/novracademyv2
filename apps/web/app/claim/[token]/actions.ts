"use server";

import { apiFetch, ApiError } from "@/lib/api";

export async function claimAction(
  claimToken: string,
  password?: string
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  try {
    const result = await apiFetch<{ userId: string; email: string }>("/alumni/claim", {
      method: "POST",
      body: JSON.stringify({ claimToken, password }),
    });
    return { ok: true, email: result.email };
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Could not claim this profile" };
  }
}
