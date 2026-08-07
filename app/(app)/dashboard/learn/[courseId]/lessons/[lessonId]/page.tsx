import { notFound } from "next/navigation";
import Link from "next/link";
import { getHardcodedLesson } from "@/lib/courses-data";
import { FileText, HelpCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { BackLink, Badge, Button, Card, PageHeader } from "@/components/DesignSystem";
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
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#666666]">
        <BackLink href="/dashboard/learn" label="Courses" />
        <span aria-hidden="true" className="text-[#767782]">›</span>
        <Link href={`/dashboard/learn/${course.id}`} className="max-w-[min(18rem,70vw)] truncate transition-colors hover:text-[#4451A2]">
          {course.title}
        </Link>
        <span aria-hidden="true" className="text-[#767782]">›</span>
        <span className="max-w-[min(18rem,70vw)] truncate text-[#1A1A2E]" aria-current="page">{lesson.title}</span>
      </nav>

      {/* Lesson header */}
      <PageHeader
        title={lesson.title}
        description={`Lesson ${lesson.order} of ${sortedLessons.length}`}
        className="mb-5"
      />
      <div className="mb-6 flex flex-col gap-5 rounded-[8px] border border-[#E5E5E5] bg-[#F8F9FB] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${lesson.type === "PDF" ? "bg-[#4451A2]" : "bg-[#683290]"}`}>
            {lesson.type === "PDF" ? (
              <FileText aria-hidden="true" className="h-5 w-5" />
            ) : (
              <HelpCircle aria-hidden="true" className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm text-[#666666]">Lesson {lesson.order} of {sortedLessons.length}</p>
            <Badge variant={lesson.type === "PDF" ? "blue" : "purple"} className="mt-1">
              {lesson.type === "PDF" ? "Reading" : "Quiz"}
            </Badge>
          </div>
        </div>
        <div className="w-full sm:max-w-xs sm:min-w-56">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#666666]">
            <span>Course progress</span>
            <span className="text-[#4451A2]">{progressPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
            <div className="h-full rounded-full bg-[#4451A2] transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Lesson content */}
      <Card padding="lg" className="overflow-hidden">
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
      </Card>

      {/* Navigation */}
      <div className="mt-8 flex flex-col gap-3 border-t border-[#E5E5E5] pt-6 sm:flex-row sm:items-center sm:justify-between">
        {prev ? (
          <Button href={`/dashboard/learn/${course.id}/lessons/${prev.lessonId}`} variant="secondary" size="md" className="w-full sm:w-auto">
            <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Previous lesson
          </Button>
        ) : (
          <div className="hidden sm:block" />
        )}
        {next ? (
          <Button href={`/dashboard/learn/${course.id}/lessons/${next.lessonId}`} variant="primary" size="md" className="w-full sm:w-auto">
            Next lesson <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        ) : (
          <Button href={`/dashboard/learn/${course.id}`} variant="purple" size="md" className="w-full sm:w-auto">
            <CheckCircle aria-hidden="true" className="h-4 w-4" /> Back to course
          </Button>
        )}
      </div>
    </main>
  );
}
