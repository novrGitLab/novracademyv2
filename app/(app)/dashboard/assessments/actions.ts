"use server";

import { apiFetch, ApiError } from "@/lib/api";

export interface AssessmentAttemptResult {
  attempt: { id: string; score: number; passed: boolean };
  growthRecord: { growthRate: number; baselineScore: number; closingScore: number } | null;
}

/**
 * Submits all assessment answers in one call. Scoring is entirely
 * server-side — this never sees or sends correct answers, only the graded
 * result back. Errors are caught and returned (not thrown) so the client
 * gets the exact message.
 */
export async function submitAssessmentAttemptAction(
  assessmentId: string,
  type: "BASELINE" | "MONTHLY" | "CLOSING",
  answers: Record<string, unknown>
): Promise<{ ok: true; result: AssessmentAttemptResult } | { ok: false; error: string }> {
  try {
    const result = await apiFetch<AssessmentAttemptResult>(`/assessments/${assessmentId}/attempt`, {
      method: "POST",
      body: JSON.stringify({ type, answers }),
    });
    return { ok: true, result };
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Something went wrong submitting the assessment" };
  }
}
