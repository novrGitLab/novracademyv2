"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchSafe } from "@/lib/api";

export interface EventListing {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  meetingUrl: string | null;
  capacity: number | null;
  recordingUrl: string | null;
  host: { id: string; name: string | null; email: string };
  _count: { rsvps: number };
}

export async function getEventsAction() {
  return apiFetchSafe<{ events: EventListing[] }>("/events", { events: [] });
}

export async function getMyRsvpAction(eventId: string) {
  return apiFetchSafe<{ status: string } | null>(`/events/${eventId}/rsvp/me`, null);
}

export async function createEventAction(formData: FormData) {
  await apiFetch("/events", {
    method: "POST",
    body: JSON.stringify({
      title: String(formData.get("title")),
      description: String(formData.get("description") ?? "") || undefined,
      startAt: String(formData.get("startAt")),
      meetingUrl: String(formData.get("meetingUrl") ?? "") || undefined,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : undefined,
    }),
  });
  revalidatePath("/dashboard/community/events");
}

export async function rsvpAction(eventId: string) {
  await apiFetch(`/events/${eventId}/rsvp`, { method: "POST" });
  revalidatePath("/dashboard/community/events");
}

export async function cancelRsvpAction(eventId: string) {
  await apiFetch(`/events/${eventId}/rsvp/cancel`, { method: "POST" });
  revalidatePath("/dashboard/community/events");
}

export async function deleteEventAction(eventId: string) {
  await apiFetch(`/events/${eventId}`, { method: "DELETE" });
  revalidatePath("/dashboard/community/events");
}

export async function getRecordingUrlAction(eventId: string) {
  return apiFetch<{ url: string }>(`/events/${eventId}/recording/view-url`);
}
