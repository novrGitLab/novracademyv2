import Link from "next/link";
import { notFound } from "next/navigation";
import { getHardcodedLesson } from "@/lib/courses-data";
import { FileText, HelpCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { LessonContent } from "./LessonContent";
import { QuizContent } from "./QuizContent";

export default async function LessonPlayerPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const result = getHardcodedLesson(params.courseId, params.lessonId);
  if (!result) notFound();

  const { course, lesson } = result;
  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex((l) => l.lessonId === lesson.lessonId);
  const prev = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const next = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const completedCount = sortedLessons.filter((l) => l.completed).length;
  const progressPct = Math.round((completedCount / sortedLessons.length) * 100);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-text-secondary">
        <Link href="/dashboard/learn" className="hover:text-blue">
          Courses
        </Link>
        <span>/</span>
        <Link href={`/dashboard/learn/${course.id}`} className="hover:text-blue">
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-text-primary">{lesson.title}</span>
      </div>

      {/* Lesson header */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
          {lesson.type === "PDF" ? (
            <FileText className="h-5 w-5" />
          ) : (
            <HelpCircle className="h-5 w-5" />
          )}
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary">{lesson.title}</h1>
          <p className="text-[13px] text-text-secondary">
            Lesson {lesson.order} of {sortedLessons.length} · {lesson.type === "PDF" ? "Reading" : "Quiz"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-brand transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Lesson content */}
      <div className="mt-6">
        {lesson.type === "PDF" && lesson.content && (
          <LessonContent courseId={course.id} lessonId={lesson.lessonId} content={lesson.content} />
        )}
        {lesson.type === "QUIZ" && lesson.questions && (
          <QuizContent
            courseId={course.id}
            lessonId={lesson.lessonId}
            lessonTitle={lesson.title}
            questions={lesson.questions}
            totalLessons={sortedLessons.length}
            lessonOrder={lesson.order}
            allLessonIds={sortedLessons.map((l) => l.lessonId)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link
            href={`/dashboard/learn/${course.id}/lessons/${prev.lessonId}`}
            className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary hover:text-blue"
          >
            <ChevronLeft className="h-4 w-4" />
            {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/dashboard/learn/${course.id}/lessons/${next.lessonId}`}
            className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary hover:text-blue"
          >
            {next.title}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href={`/dashboard/learn/${course.id}`}
            className="flex items-center gap-1.5 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-blue/90"
          >
            <CheckCircle className="h-4 w-4" />
            Back to course
          </Link>
        )}
      </div>
    </div>
  );
}
