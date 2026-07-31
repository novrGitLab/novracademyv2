"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchSafe } from "@/lib/api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string | null;
  linkUrl: string | null;
  read: boolean;
  createdAt: string;
}

export async function getNotificationsAction() {
  return apiFetchSafe<{ notifications: Notification[] }>("/notifications", { notifications: [] });
}

export async function markReadAction(id: string) {
  await apiFetch(`/notifications/${id}/read`, { method: "POST" });
  revalidatePath("/dashboard/notifications");
}

export async function markAllReadAction() {
  await apiFetch("/notifications/read-all", { method: "POST" });
  revalidatePath("/dashboard/notifications");
}
