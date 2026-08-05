"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchSafe } from "@/lib/api";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  locationType: "REMOTE" | "ONSITE" | "HYBRID";
  location: string | null;
  link: string | null;
  description: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  isFeatured: boolean;
  postedBy: { id: string; name: string | null; email: string };
}

export async function getJobListingsAction() {
  return apiFetchSafe<{ listings: JobListing[] }>("/jobs", { listings: [] });
}

export async function postJobAction(formData: FormData) {
  await apiFetch("/jobs", {
    method: "POST",
    body: JSON.stringify({
      title: String(formData.get("title")),
      company: String(formData.get("company")),
      locationType: String(formData.get("locationType")),
      location: String(formData.get("location") ?? "") || undefined,
      link: String(formData.get("link") ?? "") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
    }),
  });
  revalidatePath("/dashboard/community/jobs");
}

export async function deleteJobAction(jobId: string) {
  await apiFetch(`/jobs/${jobId}`, { method: "DELETE" });
  revalidatePath("/dashboard/community/jobs");
}

export async function setOpenToWorkAction(openToWork: boolean, userId: string) {
  await apiFetch(`/users/${userId}`, { method: "PATCH", body: JSON.stringify({ openToWork }) });
  revalidatePath("/dashboard/community/jobs");
}
