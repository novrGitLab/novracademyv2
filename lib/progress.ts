/**
 * Course progress tracking — backed by backend API with localStorage fallback.
 *
 * When authenticated, progress is synced to the server via:
 * - GET  /courses/:id/progress          → fetch completed lessons
 * - POST /courses/:courseId/lessons/:id/heartbeat → save video progress
 * - POST /courses/:courseId/lessons/:id/pdf/complete → mark PDF done
 *
 * localStorage is used as a fallback for offline/unauthenticated state.
 */

import { apiMutate } from "./useApi";

const PREFIX = "novr-progress-";

/* -------------------------------------------------------------------------- */
/*  LocalStorage helpers (fallback)                                            */
/* -------------------------------------------------------------------------- */

function getLocalCompleted(courseId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PREFIX + courseId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCompleted(courseId: string, lessonIds: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFIX + courseId, JSON.stringify(lessonIds));
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

/** Get completed lesson IDs — tries API first, falls back to localStorage */
export async function fetchCompletedLessons(courseId: string): Promise<string[]> {
  try {
    const res = await apiMutate<{ lessons: { lessonId: string; completed: boolean }[] }>(
      `/courses/${courseId}/progress`,
      "GET" as any
    );
    const completed = (res.lessons ?? [])
      .filter((l) => l.completed)
      .map((l) => l.lessonId);
    // Sync to localStorage as backup
    setLocalCompleted(courseId, completed);
    return completed;
  } catch {
    // Fallback to localStorage
    return getLocalCompleted(courseId);
  }
}

/** Get completed lessons synchronously (localStorage only — for initial render) */
export function getCompletedLessons(courseId: string): string[] {
  return getLocalCompleted(courseId);
}

/** Mark a lesson as completed — saves to API + localStorage */
export async function markLessonComplete(
  courseId: string,
  lessonId: string
): Promise<void> {
  const completed = getLocalCompleted(courseId);
  if (completed.includes(lessonId)) return;

  // Optimistic local update
  completed.push(lessonId);
  setLocalCompleted(courseId, completed);

  // Try to save to API
  try {
    await apiMutate(`/courses/${courseId}/lessons/${lessonId}/heartbeat`, "POST", {
      positionSeconds: 999999,
      durationSeconds: 1,
    });
  } catch {
    // Local save already happened, API sync will catch up later
  }
}

/** Mark a PDF lesson as completed */
export async function markPdfComplete(
  courseId: string,
  lessonId: string
): Promise<void> {
  const completed = getLocalCompleted(courseId);
  if (completed.includes(lessonId)) return;

  // Optimistic local update
  completed.push(lessonId);
  setLocalCompleted(courseId, completed);

  // Try to save to API
  try {
    await apiMutate(`/courses/${courseId}/lessons/${lessonId}/pdf/complete`, "POST");
  } catch {
    // Local save already happened
  }
}

/** Check if a specific lesson is completed (synchronous — localStorage) */
export function isLessonCompleted(courseId: string, lessonId: string): boolean {
  return getLocalCompleted(courseId).includes(lessonId);
}

/** Get course progress stats */
export function getCourseProgress(
  courseId: string,
  totalLessons: number
): { completed: number; pct: number } {
  const completed = getLocalCompleted(courseId).length;
  return {
    completed,
    pct: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
  };
}

/**
 * Determine if a lesson should be unlocked based on sequential completion.
 * - First lesson (order === 1) is always unlocked
 * - Lesson N is unlocked when lesson N-1 is completed
 */
export function isLessonUnlocked(
  courseId: string,
  lessonOrder: number,
  allLessons: { lessonId: string; order: number }[]
): boolean {
  if (lessonOrder <= 1) return true;
  const prevLesson = allLessons.find((l) => l.order === lessonOrder - 1);
  if (!prevLesson) return true;
  return isLessonCompleted(courseId, prevLesson.lessonId);
}

/** Clear all progress for a course (useful for retry/reset) */
export function clearCourseProgress(courseId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFIX + courseId);
}
