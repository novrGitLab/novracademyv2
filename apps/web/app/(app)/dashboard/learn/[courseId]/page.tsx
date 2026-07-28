import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { EnrollButton } from "./EnrollButton";

interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
}

interface LessonProgressEntry {
  lessonId: string;
  title: string;
  type: "VIDEO" | "PDF" | "QUIZ" | "LIVE";
  order: number;
  unlocked: boolean;
  completed: boolean;
  watchPct: number;
}

const typeLabels: Record<LessonProgressEntry["type"], string> = {
  VIDEO: "Video",
  PDF: "PDF",
  QUIZ: "Quiz",
  LIVE: "Live class",
};

export default async function LearnCoursePage({ params }: { params: { courseId: string } }) {
  const course = await apiFetch<CourseDetail>(`/courses/${params.courseId}`).catch(() => null);
  if (!course) notFound();

  let lessons: LessonProgressEntry[] | null = null;
  let courseProgressPct = 0;
  let completedAt: string | null = null;
  let notEnrolled = false;
  let certUid: string | null = null;
  let loadError = false;
  try {
    const progress = await apiFetch<{
      lessons: LessonProgressEntry[];
      courseProgressPct: number;
      completedAt: string | null;
    }>(`/courses/${params.courseId}/progress`);
    lessons = progress.lessons;
    courseProgressPct = progress.courseProgressPct;
    completedAt = progress.completedAt;

    if (completedAt) {
      const certificate = await apiFetch<{ certUid: string }>(`/courses/${params.courseId}/certificate`).catch(
        () => null
      );
      certUid = certificate?.certUid ?? null;
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      notEnrolled = true;
    } else {
      console.warn(`Failed to load progress for course ${params.courseId}:`, (err as Error).message);
      loadError = true;
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-[24px] font-semibold text-text-primary">{course.title}</h1>
      {course.description && <p className="mt-1 text-[15px] text-text-secondary">{course.description}</p>}

      {notEnrolled && (
        <EnrollButton courseId={params.courseId} priceCents={course.priceCents} currency={course.currency} />
      )}

      {loadError && (
        <p className="mt-6 rounded-card border border-border bg-surface px-4 py-3 text-[15px] text-text-secondary">
          Couldn't load your progress right now. Try refreshing the page.
        </p>
      )}

      {lessons && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-[13px] text-text-secondary">
            <span>Course progress</span>
            <span>{completedAt ? "Completed 🎉" : `${Math.round(courseProgressPct)}%`}</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-pill bg-surface">
            <div
              className={`h-full transition-all ${completedAt ? "bg-success" : "bg-blue"}`}
              style={{ width: `${Math.min(100, courseProgressPct)}%` }}
            />
          </div>

          {completedAt && (
            <Link
              href={certUid ? `/certificates/${certUid}` : "#"}
              className={`mt-3 inline-block rounded-card px-4 py-2 text-[15px] font-medium text-white ${
                certUid ? "bg-blue hover:bg-blue/90" : "pointer-events-none bg-surface text-text-secondary"
              }`}
            >
              {certUid ? "View certificate" : "Certificate generating…"}
            </Link>
          )}
        </div>
      )}

      {lessons && (
        <div className="mt-6 space-y-2">
          {lessons.map((lesson) => (
            <div
              key={lesson.lessonId}
              className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-pill bg-blue-light px-2 py-1 text-[13px] font-medium text-blue">
                  {typeLabels[lesson.type]}
                </span>
                <div>
                  {lesson.unlocked ? (
                    <Link
                      href={`/dashboard/learn/${params.courseId}/lessons/${lesson.lessonId}`}
                      className="text-[15px] font-medium text-text-primary hover:text-blue"
                    >
                      {lesson.title}
                    </Link>
                  ) : (
                    <span className="text-[15px] font-medium text-text-secondary">{lesson.title}</span>
                  )}
                  {lesson.type === "VIDEO" && lesson.unlocked && (
                    <p className="text-[13px] text-text-secondary">{Math.round(lesson.watchPct)}% watched</p>
                  )}
                </div>
              </div>

              {lesson.completed ? (
                <span className="rounded-pill bg-success-light px-2 py-1 text-[13px] text-success">Completed</span>
              ) : lesson.unlocked ? (
                <span className="rounded-pill bg-surface px-2 py-1 text-[13px] text-text-secondary">In progress</span>
              ) : (
                <span className="rounded-pill bg-surface px-2 py-1 text-[13px] text-text-secondary">🔒 Locked</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
