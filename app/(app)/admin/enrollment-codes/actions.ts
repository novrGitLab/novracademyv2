"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function createEnrollmentCodeAction(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const maxUses = formData.get("maxUses");
  const expiresAt = String(formData.get("expiresAt") ?? "");
  const discountValue = formData.get("discountValue");

  await apiFetch("/enrollment-codes", {
    method: "POST",
    body: JSON.stringify({
      code: code || undefined,
      courseId: String(formData.get("courseId")),
      discountType: String(formData.get("discountType") ?? "FREE"),
      discountValue: discountValue ? Number(discountValue) : undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
      expiresAt: expiresAt || undefined,
    }),
  });

  revalidatePath("/admin/enrollment-codes");
}

export async function deactivateEnrollmentCodeAction(id: string) {
  await apiFetch(`/enrollment-codes/${id}`, { method: "DELETE" });
  revalidatePath("/admin/enrollment-codes");
}
