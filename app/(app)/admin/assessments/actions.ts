"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function createAssessmentAction(formData: FormData) {
  const type = String(formData.get("type"));
  const scope = String(formData.get("scope") ?? "UNIVERSAL");
  const scheduledFor = String(formData.get("scheduledFor") ?? "");
  const month = formData.get("month");
  const year = formData.get("year");

  const assessment = await apiFetch<{ id: string }>("/assessments", {
    method: "POST",
    body: JSON.stringify({
      title: String(formData.get("title")),
      type,
      scope,
      scheduledFor: scheduledFor || undefined,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    }),
  });

  revalidatePath("/admin/assessments");
  redirect(`/admin/assessments/${assessment.id}`);
}

export async function createQuestionAction(assessmentId: string, formData: FormData) {
  const type = String(formData.get("type"));
  const body: Record<string, unknown> = {
    type,
    prompt: String(formData.get("prompt")),
    points: Number(formData.get("points") ?? 1),
  };

  if (type === "MULTIPLE_CHOICE") {
    body.options = formData.getAll("options").map(String).filter(Boolean);
    body.correctAnswer = Number(formData.get("correctAnswer"));
  } else if (type === "TRUE_FALSE") {
    body.correctAnswer = formData.get("correctAnswer") === "true";
  } else if (type === "SHORT_ANSWER") {
    body.correctAnswer = String(formData.get("correctAnswer"));
  }

  await apiFetch(`/assessments/${assessmentId}/questions`, { method: "POST", body: JSON.stringify(body) });
  revalidatePath(`/admin/assessments/${assessmentId}`);
}

export async function deleteQuestionAction(assessmentId: string, questionId: string) {
  await apiFetch(`/assessments/${assessmentId}/questions/${questionId}`, { method: "DELETE" });
  revalidatePath(`/admin/assessments/${assessmentId}`);
}

export async function reorderQuestionAction(
  assessmentId: string,
  question: { id: string; order: number },
  swapWith: { id: string; order: number }
) {
  await Promise.all([
    apiFetch(`/assessments/${assessmentId}/questions/${question.id}`, {
      method: "PATCH",
      body: JSON.stringify({ order: swapWith.order }),
    }),
    apiFetch(`/assessments/${assessmentId}/questions/${swapWith.id}`, {
      method: "PATCH",
      body: JSON.stringify({ order: question.order }),
    }),
  ]);
  revalidatePath(`/admin/assessments/${assessmentId}`);
}

export async function releaseClosingAction(assessmentId: string, formData: FormData) {
  const userId = String(formData.get("userId") ?? "") || undefined;
  const cohortId = String(formData.get("cohortId") ?? "") || undefined;
  await apiFetch(`/assessments/${assessmentId}/release`, {
    method: "POST",
    body: JSON.stringify({ userId, cohortId }),
  });
  revalidatePath(`/admin/assessments/${assessmentId}`);
}
