"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function composeNotificationAction(formData: FormData) {
  const channels = formData.getAll("channels").map(String);
  await apiFetch("/notifications/compose", {
    method: "POST",
    body: JSON.stringify({
      segment: String(formData.get("segment")),
      title: String(formData.get("title")),
      content: String(formData.get("content")),
      channels,
    }),
  });
  revalidatePath("/admin/notifications");
}
