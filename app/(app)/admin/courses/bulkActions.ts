"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function bulkArchiveCoursesAction(courseIds: string[]) {
  await apiFetch("/bulk/archive-courses", { method: "POST", body: JSON.stringify({ courseIds }) });
  revalidatePath("/admin/courses");
}
