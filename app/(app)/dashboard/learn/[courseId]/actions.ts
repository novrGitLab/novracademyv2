"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export async function enrollFreeAction(
  courseId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await apiFetch(`/courses/${courseId}/enroll/free`, { method: "POST" });
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Could not enroll" };
  }
  revalidatePath(`/dashboard/learn/${courseId}`);
  return { ok: true };
}

export async function startCheckoutAction(
  courseId: string,
  provider: "STRIPE" | "PAYSTACK"
): Promise<
  | { ok: true; checkoutUrl: string; accessCode?: string; publicKey?: string }
  | { ok: false; error: string }
> {
  try {
    const { checkoutUrl, accessCode, publicKey } = await apiFetch<{
      checkoutUrl: string;
      accessCode?: string;
      publicKey?: string;
    }>(`/courses/${courseId}/enroll/checkout`, {
      method: "POST",
      body: JSON.stringify({ provider }),
    }, 45000);
    return { ok: true, checkoutUrl, accessCode, publicKey };
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Could not start checkout" };
  }
}

export interface AiMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export async function getAiConversationAction(courseId: string) {
  return apiFetch<{ messages: AiMessage[] }>(`/courses/${courseId}/assistant/messages`);
}

/**
 * Errors are caught and returned (not thrown) so the client gets the exact
 * message — Next.js redacts thrown Server Action errors in production.
 */
export async function askAiAssistantAction(
  courseId: string,
  question: string
): Promise<{ ok: true; message: AiMessage } | { ok: false; error: string }> {
  try {
    const message = await apiFetch<AiMessage>(`/courses/${courseId}/assistant/messages`, {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    return { ok: true, message };
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Could not reach the assistant" };
  }
}
