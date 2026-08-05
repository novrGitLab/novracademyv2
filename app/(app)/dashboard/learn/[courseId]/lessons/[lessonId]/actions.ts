"use server";

import { apiFetch, ApiError } from "@/lib/api";

export interface HeartbeatResult {
  watchPct: number;
  completed: boolean;
  lastPositionSeconds: number;
}

/**
 * Called directly from the client player roughly every 5s. The server is
 * the sole authority on watchPct/completion — this never trusts the
 * reported position outright (see progressService.recordHeartbeat).
 */
export async function sendHeartbeatAction(
  courseId: string,
  lessonId: string,
  positionSeconds: number,
  durationSeconds: number
) {
  return apiFetch<HeartbeatResult>(`/courses/${courseId}/lessons/${lessonId}/heartbeat`, {
    method: "POST",
    body: JSON.stringify({ positionSeconds, durationSeconds }),
  });
}

export async function markPdfCompleteAction(courseId: string, lessonId: string) {
  return apiFetch<{ completed: boolean }>(`/courses/${courseId}/lessons/${lessonId}/pdf/complete`, {
    method: "POST",
  });
}

export interface QuizAttemptResult {
  attemptId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  passMarkPct: number;
  maxAttempts: number;
  attemptsRemaining: number;
  results: { questionId: string; correct: boolean }[];
}

export async function setLiveRsvpAction(courseId: string, lessonId: string, going: boolean) {
  return apiFetch(`/courses/${courseId}/lessons/${lessonId}/live/rsvp`, {
    method: "POST",
    body: JSON.stringify({ going }),
  });
}

export async function joinLiveClassAction(
  courseId: string,
  lessonId: string
): Promise<{ ok: true; roomUrl: string; token: string } | { ok: false; error: string }> {
  try {
    const { roomUrl, token } = await apiFetch<{ roomUrl: string; token: string; isOwner: boolean }>(
      `/courses/${courseId}/lessons/${lessonId}/live/join`
    );
    return { ok: true, roomUrl, token };
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Could not join the live class" };
  }
}

export async function getLiveRecordingUrlAction(
  courseId: string,
  lessonId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const { url } = await apiFetch<{ url: string }>(
      `/courses/${courseId}/lessons/${lessonId}/live/recording-url`
    );
    return { ok: true, url };
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Recording not available" };
  }
}

/**
 * Submits all quiz answers in one call. Scoring is entirely server-side —
 * this never sees or sends correct answers, only the graded result back.
 * Errors are caught and returned (not thrown) so the client gets the exact
 * message — Next.js redacts thrown Server Action errors in production.
 */
export async function submitQuizAttemptAction(
  courseId: string,
  lessonId: string,
  answers: Record<string, number | boolean | string>
): Promise<{ ok: true; result: QuizAttemptResult } | { ok: false; error: string }> {
  try {
    const result = await apiFetch<QuizAttemptResult>(
      `/courses/${courseId}/lessons/${lessonId}/quiz/attempts`,
      { method: "POST", body: JSON.stringify({ answers }) }
    );
    return { ok: true, result };
  } catch (err) {
    if (err instanceof ApiError) {
      const body = err.body as { error?: string } | null;
      return { ok: false, error: body?.error ?? err.message };
    }
    return { ok: false, error: "Something went wrong submitting the quiz" };
  }
}
