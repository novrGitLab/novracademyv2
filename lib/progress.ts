/**
 * localStorage-based progress tracker for hardcoded courses.
 *
 * Key format: `novr-progress-{courseId}` → JSON array of completed lesson IDs
 */

const PREFIX = "novr-progress-";

/** Get the list of completed lesson IDs for a course */
export function getCompletedLessons(courseId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PREFIX + courseId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Mark a lesson as completed (persists to localStorage) */
export function markLessonComplete(courseId: string, lessonId: string): void {
  if (typeof window === "undefined") return;
  const completed = getCompletedLessons(courseId);
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    localStorage.setItem(PREFIX + courseId, JSON.stringify(completed));
  }
}

/** Check if a specific lesson is completed */
export function isLessonCompleted(courseId: string, lessonId: string): boolean {
  return getCompletedLessons(courseId).includes(lessonId);
}

/** Get course progress stats */
export function getCourseProgress(courseId: string, totalLessons: number): { completed: number; pct: number } {
  const completed = getCompletedLessons(courseId).length;
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
  allLessons: { lessonId: string; order: number }[],
): boolean {
  if (lessonOrder <= 1) return true;
  // Find the lesson that comes just before this one
  const prevLesson = allLessons.find((l) => l.order === lessonOrder - 1);
  if (!prevLesson) return true;
  return isLessonCompleted(courseId, prevLesson.lessonId);
}

/** Clear all progress for a course (useful for retry/reset) */
export function clearCourseProgress(courseId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFIX + courseId);
}
