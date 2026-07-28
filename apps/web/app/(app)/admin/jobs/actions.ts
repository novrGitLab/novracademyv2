"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function setJobStatusAction(jobId: string, status: string) {
  await apiFetch(`/jobs/${jobId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  revalidatePath("/admin/jobs");
}

export async function setJobFeaturedAction(jobId: string, isFeatured: boolean) {
  await apiFetch(`/jobs/${jobId}/featured`, { method: "PATCH", body: JSON.stringify({ isFeatured }) });
  revalidatePath("/admin/jobs");
}

export async function deleteJobAdminAction(jobId: string) {
  await apiFetch(`/jobs/${jobId}`, { method: "DELETE" });
  revalidatePath("/admin/jobs");
}
