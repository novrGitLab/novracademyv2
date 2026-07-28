"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export interface AlumniRecordRow {
  fullName: string;
  email?: string;
  phone?: string;
  courseName: string;
  completionDate?: string;
  score?: number;
  cohortLabel?: string;
}

export async function importAlumniAction(
  records: AlumniRecordRow[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    const result = await apiFetch<{ count: number }>("/alumni/import", {
      method: "POST",
      body: JSON.stringify({ records }),
    });
    revalidatePath("/admin/alumni");
    return { ok: true, count: result.count };
  } catch {
    return { ok: false, error: "Import failed — check the file format" };
  }
}

export async function createManualAlumniAction(formData: FormData) {
  const scoreRaw = formData.get("score");
  await apiFetch("/alumni", {
    method: "POST",
    body: JSON.stringify({
      fullName: String(formData.get("fullName")),
      email: String(formData.get("email") ?? "") || undefined,
      phone: String(formData.get("phone") ?? "") || undefined,
      courseName: String(formData.get("courseName")),
      completionDate: String(formData.get("completionDate") ?? "") || undefined,
      score: scoreRaw ? Number(scoreRaw) : undefined,
      cohortLabel: String(formData.get("cohortLabel") ?? "") || undefined,
    }),
  });
  revalidatePath("/admin/alumni");
}
