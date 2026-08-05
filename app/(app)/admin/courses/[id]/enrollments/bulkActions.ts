"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function bulkUnenrollAction(enrollmentIds: string[]) {
  await apiFetch("/bulk/unenroll", { method: "POST", body: JSON.stringify({ enrollmentIds }) });
  revalidatePath("/admin/courses");
}

export async function bulkExtendValidityAction(enrollmentIds: string[], additionalDays: number) {
  await apiFetch("/bulk/extend-validity", { method: "POST", body: JSON.stringify({ enrollmentIds, additionalDays }) });
  revalidatePath("/admin/courses");
}
