"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function createCampaignAction(formData: FormData) {
  const scheduledAt = String(formData.get("scheduledAt") ?? "");
  const campaign = await apiFetch<{ id: string }>("/marketing-campaigns", {
    method: "POST",
    body: JSON.stringify({
      title: String(formData.get("title")),
      subject: String(formData.get("subject")),
      bodyHtml: String(formData.get("bodyHtml") ?? ""),
      scheduledAt: scheduledAt || undefined,
    }),
  });

  if (formData.get("sendNow") === "on") {
    await apiFetch(`/marketing-campaigns/${campaign.id}/send`, { method: "POST" });
  }

  revalidatePath("/admin/marketing");
  redirect("/admin/marketing");
}

export async function sendCampaignAction(id: string) {
  await apiFetch(`/marketing-campaigns/${id}/send`, { method: "POST" });
  revalidatePath("/admin/marketing");
}

export async function deleteCampaignAction(id: string) {
  await apiFetch(`/marketing-campaigns/${id}`, { method: "DELETE" });
  revalidatePath("/admin/marketing");
}

export interface SubscriberRow {
  email: string;
  firstName?: string;
  lastName?: string;
}

export async function importSubscribersAction(rows: SubscriberRow[]) {
  try {
    const result = await apiFetch<{ imported: number; skipped: number }>("/newsletter/subscribers/import", {
      method: "POST",
      body: JSON.stringify({ rows }),
    });
    revalidatePath("/admin/marketing/subscribers");
    return { ok: true as const, ...result };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Import failed" };
  }
}

export async function addSubscriberAction(formData: FormData) {
  await apiFetch("/newsletter/subscribers", {
    method: "POST",
    body: JSON.stringify({
      email: String(formData.get("email")),
      firstName: String(formData.get("firstName") ?? "") || undefined,
      lastName: String(formData.get("lastName") ?? "") || undefined,
    }),
  });
  revalidatePath("/admin/marketing/subscribers");
}
