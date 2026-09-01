"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

function numberOrUndefined(value: FormDataEntryValue | null) {
  if (value === null || value === "") return undefined;
  return Number(value);
}

/** The price form fields collect the amount in major units (₦); store minor units. */
function priceCentsFromForm(formData: FormData): number | undefined {
  const major = numberOrUndefined(formData.get("priceNaira"));
  if (major === undefined || Number.isNaN(major)) return undefined;
  return Math.round(major * 100);
}

export async function createCourseAction(formData: FormData) {
  const course = await apiFetch<{ id: string }>("/courses", {
    method: "POST",
    body: JSON.stringify({
      title: String(formData.get("title")),
      description: String(formData.get("description") ?? "") || undefined,
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "") || undefined,
      priceCents: priceCentsFromForm(formData),
      currency: String(formData.get("currency") ?? "NGN"),
      passMarkPct: numberOrUndefined(formData.get("passMarkPct")),
      allowForwardScrub: formData.get("allowForwardScrub") === "on",
      defaultValidityDays: numberOrUndefined(formData.get("defaultValidityDays")),
    }),
  });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourseAction(courseId: string, formData: FormData) {
  await apiFetch(`/courses/${courseId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: String(formData.get("title")),
      description: String(formData.get("description") ?? "") || undefined,
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "") || undefined,
      status: String(formData.get("status")),
      priceCents: priceCentsFromForm(formData),
      currency: String(formData.get("currency") ?? "NGN"),
      passMarkPct: numberOrUndefined(formData.get("passMarkPct")),
      allowForwardScrub: formData.get("allowForwardScrub") === "on",
      defaultValidityDays: numberOrUndefined(formData.get("defaultValidityDays")),
    }),
  });
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
}

export async function setCourseStatusAction(courseId: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  await apiFetch(`/courses/${courseId}`, { method: "PATCH", body: JSON.stringify({ status }) });
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
}

export async function setVideoUrlAction(courseId: string, lessonId: string, url: string) {
  await apiFetch(`/courses/${courseId}/lessons/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify({ contentUrl: url }),
  });
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function deleteCourseAction(courseId: string) {
  await apiFetch(`/courses/${courseId}`, { method: "DELETE" });
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

/** Re-renders every issued certificate for this course — e.g. after the template or the tenant's branding changes. */
export async function regenerateCertificatesAction(courseId: string): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    const result = await apiFetch<{ count: number }>(`/courses/${courseId}/certificates/regenerate`, { method: "POST" });
    return { ok: true, count: result.count };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not regenerate certificates" };
  }
}

export async function createLessonAction(courseId: string, formData: FormData) {
  const type = String(formData.get("type"));
  const lesson = await apiFetch<{ id: string }>(`/courses/${courseId}/lessons`, {
    method: "POST",
    body: JSON.stringify({
      title: String(formData.get("title")),
      type,
      minWatchPct: numberOrUndefined(formData.get("minWatchPct")),
      durationSeconds: numberOrUndefined(formData.get("durationSeconds")),
      quizPassMarkPct: numberOrUndefined(formData.get("quizPassMarkPct")),
      quizMaxAttempts: numberOrUndefined(formData.get("quizMaxAttempts")),
    }),
  });
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}/lessons/${lesson.id}`);
}

export async function deleteLessonAction(courseId: string, lessonId: string) {
  await apiFetch(`/courses/${courseId}/lessons/${lessonId}`, { method: "DELETE" });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function reorderLessonAction(courseId: string, lessonId: string, direction: "up" | "down") {
  await apiFetch(`/courses/${courseId}/lessons/${lessonId}/reorder`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

/**
 * Called directly (not as a form action) from the client uploader — returns
 * the Mux direct-upload URL so the browser can PUT the file straight to Mux.
 */
export async function requestVideoUploadUrlAction(courseId: string, lessonId: string) {
  return apiFetch<{ uploadId: string; uploadUrl: string }>(
    `/courses/${courseId}/lessons/${lessonId}/video/upload-url`,
    { method: "POST" }
  );
}

export async function getLessonAction(courseId: string, lessonId: string) {
  return apiFetch<{
    id: string;
    title: string;
    type: "VIDEO" | "PDF" | "QUIZ" | "LIVE";
    videoStatus: "PREPARING" | "READY" | "ERRORED" | null;
    muxPlaybackId: string | null;
    contentUrl: string | null;
    pdfAllowDownload: boolean;
  }>(`/courses/${courseId}/lessons/${lessonId}`);
}

/**
 * Called directly (not as a form action) from the client PDF uploader —
 * returns the presigned R2 PUT URL so the browser can upload straight to R2.
 */
export async function requestPdfUploadUrlAction(courseId: string, lessonId: string) {
  return apiFetch<{ uploadUrl: string }>(`/courses/${courseId}/lessons/${lessonId}/pdf/upload-url`, {
    method: "POST",
  });
}

export async function setPdfAllowDownloadAction(courseId: string, lessonId: string, allowDownload: boolean) {
  await apiFetch(`/courses/${courseId}/lessons/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify({ pdfAllowDownload: allowDownload }),
  });
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

/** Returns a presigned R2 PUT URL so the browser can upload a .pptx straight to R2. */
export async function requestSlidesPptxUploadUrlAction(courseId: string, lessonId: string) {
  return apiFetch<{ uploadUrl: string; key: string }>(
    `/courses/${courseId}/lessons/${lessonId}/slides/upload-url`,
    { method: "POST" }
  );
}

/** Tells the backend the .pptx is uploaded; it parses + attaches the manifest. */
export async function importSlidesPptxAction(courseId: string, lessonId: string, key: string) {
  await apiFetch(`/courses/${courseId}/lessons/${lessonId}/slides/import`, {
    method: "POST",
    body: JSON.stringify({ key }),
  });
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}export async function updateQuizSettingsAction(courseId: string, lessonId: string, formData: FormData) {
  await apiFetch(`/courses/${courseId}/lessons/${lessonId}/quiz`, {
    method: "PATCH",
    body: JSON.stringify({
      passMarkPct: numberOrUndefined(formData.get("passMarkPct")),
      maxAttempts: numberOrUndefined(formData.get("maxAttempts")),
    }),
  });
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function createQuestionAction(courseId: string, lessonId: string, formData: FormData) {
  const type = String(formData.get("type"));
  const body: Record<string, unknown> = {
    type,
    prompt: String(formData.get("prompt")),
    points: numberOrUndefined(formData.get("points")),
  };

  if (type === "MULTIPLE_CHOICE") {
    body.options = formData.getAll("options").map(String).filter(Boolean);
    body.correctAnswer = Number(formData.get("correctAnswer"));
  } else if (type === "TRUE_FALSE") {
    body.correctAnswer = formData.get("correctAnswer") === "true";
  } else if (type === "SHORT_ANSWER") {
    body.correctAnswer = String(formData.get("correctAnswer"));
  }

  await apiFetch(`/courses/${courseId}/lessons/${lessonId}/quiz/questions`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function deleteQuestionAction(courseId: string, lessonId: string, questionId: string) {
  await apiFetch(`/courses/${courseId}/lessons/${lessonId}/quiz/questions/${questionId}`, { method: "DELETE" });
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function reorderQuestionAction(
  courseId: string,
  lessonId: string,
  questionId: string,
  direction: "up" | "down"
) {
  await apiFetch(`/courses/${courseId}/lessons/${lessonId}/quiz/questions/${questionId}/reorder`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function assignEnrollmentAction(courseId: string, formData: FormData) {
  await apiFetch(`/courses/${courseId}/enroll/assign`, {
    method: "POST",
    body: JSON.stringify({
      email: String(formData.get("email")),
      validityDays: numberOrUndefined(formData.get("validityDays")),
    }),
  });
  revalidatePath(`/admin/courses/${courseId}/enrollments`);
}

export async function bulkAssignAction(courseId: string, formData: FormData) {
  const raw = String(formData.get("emails") ?? "");
  const emails = raw
    .split(/[\n,]/)
    .map((e) => e.trim())
    .filter(Boolean);

  await apiFetch(`/courses/${courseId}/enroll/bulk`, {
    method: "POST",
    body: JSON.stringify({
      emails,
      validityDays: numberOrUndefined(formData.get("validityDays")),
    }),
  });
  revalidatePath(`/admin/courses/${courseId}/enrollments`);
}

export async function cohortEnrollAction(courseId: string, formData: FormData) {
  await apiFetch(`/courses/${courseId}/enroll/cohort`, {
    method: "POST",
    body: JSON.stringify({
      cohortId: String(formData.get("cohortId")),
      validityDays: numberOrUndefined(formData.get("validityDays")),
    }),
  });
  revalidatePath(`/admin/courses/${courseId}/enrollments`);
}

export async function scheduleLiveClassAction(courseId: string, lessonId: string, formData: FormData) {
  await apiFetch(`/courses/${courseId}/lessons/${lessonId}/live`, {
    method: "PATCH",
    body: JSON.stringify({ liveScheduledAt: String(formData.get("liveScheduledAt")) }),
  });
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function getLiveAttendanceAction(courseId: string, lessonId: string) {
  return apiFetch<{
    attendance: {
      userId: string;
      rsvp: boolean;
      attended: boolean;
      joinedAt: string | null;
      user: { name: string | null; email: string } | null;
    }[];
  }>(`/courses/${courseId}/lessons/${lessonId}/live/attendance`);
}

export async function generateSlidesAction(
  courseId: string,
  lessonId: string,
  slideCount: number,
  voiceover: boolean
) {
  return apiFetch<{ generationId: string; status: string }>(
    `/courses/${courseId}/lessons/${lessonId}/slides/generate`,
    {
      method: "POST",
      body: JSON.stringify({ slideCount, voiceover }),
    }
  );
}

export async function getSlidesGenerationStatusAction(courseId: string, lessonId: string) {
  return apiFetch<{
    generationId: string;
    status: string;
    errorMessage: string | null;
    generatedLessonIds: string[];
    progress: string;
  }>(`/courses/${courseId}/lessons/${lessonId}/slides/status`);
}
