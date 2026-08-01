import Link from "next/link";
import { getHardcodedCourse } from "@/lib/courses-data";
import { notFound } from "next/navigation";
import { Award, BookOpen, Lock, PlayCircle, CheckCircle, FileText, HelpCircle } from "lucide-react";

const typeLabels: Record<string, string> = {
  VIDEO: "Video",
  PDF: "PDF",
  QUIZ: "Quiz",
  LIVE: "Live",
};

const typeIcons: Record<string, typeof BookOpen> = {
  VIDEO: PlayCircle,
  PDF: FileText,
  QUIZ: HelpCircle,
  LIVE: BookOpen,
};

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = getHardcodedCourse(params.courseId);
  if (!course) notFound();

  const lessons = course.lessons;
  const completedCount = lessons.filter((l) => l.completed).length;
  const courseProgressPct =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Course header */}
      <div className="rounded-card bg-gradient-brand p-8 text-white shadow-premium">
        <h1 className="text-[28px] font-semibold tracking-tight">{course.title}</h1>
        {course.description && (
          <p className="mt-2 max-w-xl text-[15px] text-white/85">{course.description}</p>
        )}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-[14px] font-medium text-white/80">
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </span>
          {course.priceCents === 0 ? (
            <span className="rounded-pill bg-white/15 px-3 py-1 text-[13px] font-medium backdrop-blur">
              Free
            </span>
          ) : (
            <span className="rounded-pill bg-white/15 px-3 py-1 text-[13px] font-medium backdrop-blur">
              {(course.priceCents / 100).toFixed(2)} {course.currency}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 rounded-card border border-border bg-background p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-text-primary">
            {courseProgressPct === 100 ? (
              <span className="flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4" /> Completed
              </span>
            ) : (
              `${courseProgressPct}% complete`
            )}
          </p>
          {courseProgressPct === 100 && (
            <Link
              href={`/dashboard/learn/${course.id}/certificate`}
              className="flex items-center gap-1.5 text-[13px] font-medium text-blue hover:underline"
            >
              <Award className="h-4 w-4" /> View certificate
            </Link>
          )}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-gradient-brand transition-all"
            style={{ width: `${courseProgressPct}%` }}
          />
        </div>
      </div>

      {/* Lesson list */}
      <h2 className="mt-8 text-[17px] font-semibold text-text-primary">Lessons</h2>
      <div className="mt-3 space-y-2">
        {lessons.map((lesson) => {
          const Icon = typeIcons[lesson.type] ?? BookOpen;
          const lessonContent = (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface">
                {lesson.completed ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : lesson.unlocked ? (
                  <Icon className="h-4 w-4 text-text-secondary" />
                ) : (
                  <Lock className="h-4 w-4 text-text-secondary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[14px] font-medium ${
                    lesson.unlocked ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {lesson.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="rounded-pill bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                    {typeLabels[lesson.type]}
                  </span>
                  {lesson.type === "PDF" && lesson.watchPct > 0 && (
                    <span className="text-[11px] text-text-secondary">
                      {lesson.watchPct}% read
                    </span>
                  )}
                </div>
              </div>
              <div>
                {lesson.completed ? (
                  <span className="text-[12px] font-medium text-success">Completed</span>
                ) : lesson.unlocked ? (
                  <span className="text-[12px] font-medium text-blue">Start</span>
                ) : (
                  <span className="text-[12px] font-medium text-text-secondary">Locked</span>
                )}
              </div>
            </>
          );

          const rowClass = `flex items-center gap-4 rounded-card border px-4 py-3 transition ${
            lesson.unlocked
              ? "border-border bg-background shadow-card hover:shadow-card-hover cursor-pointer"
              : "border-border/50 bg-surface/50 opacity-60"
          }`;

          if (lesson.unlocked) {
            return (
              <Link
                key={lesson.lessonId}
                href={`/dashboard/learn/${params.courseId}/lessons/${lesson.lessonId}`}
                className={rowClass}
              >
                {lessonContent}
              </Link>
            );
          }

          return (
            <div key={lesson.lessonId} className={rowClass}>
              {lessonContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
