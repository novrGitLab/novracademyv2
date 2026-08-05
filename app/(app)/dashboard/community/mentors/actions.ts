"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchSafe, ApiError } from "@/lib/api";

export interface MentorListing {
  userId: string;
  topics: string[];
  availability: string | null;
  capacityPerMonth: number;
  bookedThisMonth: number;
  user: { id: string; name: string | null; email: string; bio: string | null };
}

export async function getMentorsAction(topic?: string) {
  const qs = topic ? `?topic=${encodeURIComponent(topic)}` : "";
  return apiFetchSafe<{ mentors: MentorListing[] }>(`/mentors${qs}`, { mentors: [] });
}

export async function getMyMentorProfileAction() {
  return apiFetchSafe<{ topics: string[]; availability: string | null; capacityPerMonth: number; isActive: boolean } | null>(
    "/mentors/me",
    null
  );
}

export async function saveMentorProfileAction(formData: FormData) {
  const topics = String(formData.get("topics") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  await apiFetch("/mentors/me", {
    method: "PUT",
    body: JSON.stringify({
      topics,
      availability: String(formData.get("availability") ?? "") || undefined,
      capacityPerMonth: Number(formData.get("capacityPerMonth") ?? 4),
      isActive: formData.get("isActive") === "on",
    }),
  });
  revalidatePath("/dashboard/community/mentors");
}

export async function getMySessionsAction() {
  return apiFetchSafe<{
    asMentor: { id: string; topic: string; status: string; scheduledAt: string | null; mentee: { name: string | null; email: string } }[];
    asMentee: { id: string; topic: string; status: string; scheduledAt: string | null; mentor: { name: string | null; email: string } }[];
  }>("/mentors/sessions", { asMentor: [], asMentee: [] });
}

export async function requestSessionAction(
  mentorId: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await apiFetch("/mentors/sessions", {
      method: "POST",
      body: JSON.stringify({
        mentorId,
        topic: String(formData.get("topic")),
      }),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Could not request a session" };
  }
  revalidatePath("/dashboard/community/mentors");
  return { ok: true };
}

export async function respondToSessionAction(sessionId: string, accept: boolean) {
  await apiFetch(`/mentors/sessions/${sessionId}/respond`, { method: "POST", body: JSON.stringify({ accept }) });
  revalidatePath("/dashboard/community/mentors");
}

export async function completeSessionAction(sessionId: string, rating?: number) {
  await apiFetch(`/mentors/sessions/${sessionId}/complete`, { method: "POST", body: JSON.stringify({ rating }) });
  revalidatePath("/dashboard/community/mentors");
}

export async function cancelSessionAction(sessionId: string) {
  await apiFetch(`/mentors/sessions/${sessionId}/cancel`, { method: "POST" });
  revalidatePath("/dashboard/community/mentors");
}
