"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function createGroupAction(formData: FormData) {
  await apiFetch("/groups", {
    method: "POST",
    body: JSON.stringify({
      name: String(formData.get("name")),
      description: String(formData.get("description") ?? "") || undefined,
      type: String(formData.get("type")),
    }),
  });
  revalidatePath("/admin/community");
}

export async function toggleArchiveAction(groupId: string, isArchived: boolean) {
  await apiFetch(`/groups/${groupId}`, { method: "PATCH", body: JSON.stringify({ isArchived }) });
  revalidatePath("/admin/community");
}

export async function togglePinAction(groupId: string, isPinned: boolean) {
  await apiFetch(`/groups/${groupId}`, { method: "PATCH", body: JSON.stringify({ isPinned }) });
  revalidatePath("/admin/community");
}

export async function deleteGroupAction(groupId: string) {
  await apiFetch(`/groups/${groupId}`, { method: "DELETE" });
  revalidatePath("/admin/community");
}
