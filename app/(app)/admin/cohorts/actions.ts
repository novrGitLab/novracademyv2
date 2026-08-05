"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function createCohortAction(formData: FormData) {
  const yearRaw = formData.get("year");
  await apiFetch("/cohorts", {
    method: "POST",
    body: JSON.stringify({
      name: String(formData.get("name")),
      year: yearRaw ? Number(yearRaw) : undefined,
      description: String(formData.get("description") ?? "") || undefined,
    }),
  });
  revalidatePath("/admin/cohorts");
}

export async function deleteCohortAction(cohortId: string) {
  await apiFetch(`/cohorts/${cohortId}`, { method: "DELETE" });
  revalidatePath("/admin/cohorts");
}
