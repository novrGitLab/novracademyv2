"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function bulkSetStatusAction(userIds: string[], status: string) {
  await apiFetch("/bulk/user-status", { method: "POST", body: JSON.stringify({ userIds, status }) });
  revalidatePath("/admin/users");
}

export async function bulkAssignCohortAction(userIds: string[], cohortId: string) {
  await apiFetch("/bulk/assign-cohort", { method: "POST", body: JSON.stringify({ userIds, cohortId }) });
  revalidatePath("/admin/users");
}

export async function bulkAwardXpAction(userIds: string[], xpAmount: number) {
  await apiFetch("/bulk/award-xp", { method: "POST", body: JSON.stringify({ userIds, xpAmount }) });
  revalidatePath("/admin/users");
}

export async function bulkAwardBadgeAction(userIds: string[], badgeId: string) {
  await apiFetch("/bulk/award-badge", { method: "POST", body: JSON.stringify({ userIds, badgeId }) });
  revalidatePath("/admin/users");
}
