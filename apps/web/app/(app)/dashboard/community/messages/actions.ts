"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchSafe, ApiError } from "@/lib/api";

export interface ThreadParticipant {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface ThreadSummary {
  id: string;
  isGroup: boolean;
  name: string | null;
  participants: ThreadParticipant[];
  lastMessage: { content: string | null; createdAt: string; senderId: string } | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string | null;
  createdAt: string;
  sender: ThreadParticipant;
}

export async function getThreadsAction() {
  return apiFetchSafe<{ threads: ThreadSummary[] }>("/messages/threads", { threads: [] });
}

export async function getThreadMessagesAction(threadId: string) {
  return apiFetchSafe<{ messages: Message[] }>(`/messages/threads/${threadId}/messages`, { messages: [] });
}

export async function sendMessageAction(threadId: string, content: string) {
  return apiFetch<Message>(`/messages/threads/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function startDirectThreadAction(
  formData: FormData
): Promise<{ ok: false; error: string } | void> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Enter an email address" };

  try {
    const user = await apiFetch<{ id: string }>(`/users/lookup?email=${encodeURIComponent(email)}`);

    const thread = await apiFetch<{ id: string }>("/messages/threads/direct", {
      method: "POST",
      body: JSON.stringify({ userId: user.id }),
    });
    revalidatePath("/dashboard/community/messages");
    redirect(`/dashboard/community/messages/${thread.id}`);
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Could not start conversation" };
  }
}
