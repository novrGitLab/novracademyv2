import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetchSafe } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BackLink, Badge, Button, PageHeader, type SlidesManifest } from "@/components/DesignSystem";
import { PdfViewer } from "./PdfViewer";
import { QuizContent } from "./QuizContent";
import { LiveClassJoin } from "./LiveClassJoin";
import { VideoPlayer } from "./VideoPlayer";
import { SlidesPlayer } from "./SlidesPlayer";

interface LessonDetail {
  id: string;
  courseId: string;
  title: string;
  type: "VIDEO" | "PDF" | "QUIZ" | "LIVE" | "SLIDES";
  order: number;
  contentUrl: string | null;
  pdfAllowDownload: boolean;
  muxPlaybackId: string | null;
  slidesManifest: SlidesManifest | null;
  quiz: {
    id: string;
    passMarkPct: number;
    maxAttempts: number;
    questions: {
      id: string;
      prompt: string;
      options: string[];
      explanation: string | null;
    }[];
  } | null;
  liveScheduledAt: string | null;
  liveMeetingUrl: string | null;
  dailyRecordingId: string | null;
}

export default async function LessonPlayerPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  // Lesson detail + course nav meta are independent reads — fetch them in
  // parallel, and use the lean /meta endpoint (title + ordered lesson index)
  // for the breadcrumb and prev/next instead of the full course payload.
  const [lesson, courseMeta] = await Promise.all([
    apiFetchSafe<LessonDetail | null>(
      `/courses/${params.courseId}/lessons/${params.lessonId}`,
      null
    ),
    apiFetchSafe<{
      id: string;
      title: string;
      lessons: { id: string; title: string; order: number }[];
    } | null>(`/courses/${params.courseId}/meta`, null),
  ]);
  if (!lesson) notFound();

  const sortedLessons = [...(courseMeta?.lessons ?? [])].sort((a, b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex((l) => l.id === lesson.id);
  const prev = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const next = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#666666]">
        <BackLink href="/dashboard/learn" label="Courses" />
        <span aria-hidden="true" className="text-[#767782]">›</span>
        <Link href={`/dashboard/learn/${params.courseId}`} className="max-w-[min(18rem,70vw)] truncate transition-colors hover:text-[#4451A2]">
          {courseMeta?.title ?? "Course"}
        </Link>
        <span aria-hidden="true" className="text-[#767782]">›</span>
        <span className="max-w-[min(18rem,70vw)] truncate text-[#1A1A2E]" aria-current="page">{lesson.title}</span>
      </nav>

      {/* Lesson header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title={lesson.title}
          description={`Lesson ${lesson.order} of ${sortedLessons.length}`}
          className="mb-0"
        />
        <div className="flex shrink-0 items-center gap-2 sm:pt-1">
          <Badge variant={lesson.type === "PDF" ? "blue" : lesson.type === "LIVE" ? "red" : "purple"}>
            {lesson.type === "PDF" ? "Reading" : lesson.type === "SLIDES" ? "Slides" : lesson.type === "QUIZ" ? "Quiz" : lesson.type === "VIDEO" ? "Video" : "Live"}
          </Badge>
          <Badge variant="default">
            {lesson.order} of {sortedLessons.length}
          </Badge>
        </div>
      </div>

      {/* Lesson content */}
      <div className="overflow-hidden rounded-[12px] border border-[#E5E5E5] bg-white shadow-[0_2px_12px_rgba(26,26,46,0.06)]">
        {lesson.type === "PDF" && (
          <PdfViewer
            courseId={params.courseId}
            lessonId={lesson.id}
            allowDownload={lesson.pdfAllowDownload}
            nextLessonHref={next ? `/dashboard/learn/${params.courseId}/lessons/${next.id}` : null}
          />
        )}
        {lesson.type === "SLIDES" && lesson.slidesManifest && (
          <SlidesPlayer
            courseId={params.courseId}
            lessonId={lesson.id}
            manifest={lesson.slidesManifest}
            nextLessonHref={next ? `/dashboard/learn/${params.courseId}/lessons/${next.id}` : null}
          />
        )}
        {lesson.type === "SLIDES" && !lesson.slidesManifest && (
          <div className="flex min-h-[30vh] items-center justify-center text-sm text-text-secondary">
            This slide lesson hasn&apos;t been generated yet.
          </div>
        )}
        {lesson.type === "QUIZ" && lesson.quiz && (
          <QuizContent
            courseId={params.courseId}
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            questions={lesson.quiz.questions.map((q) => ({
              id: q.id,
              question: q.prompt,
              options: q.options,
              explanation: q.explanation ?? "",
            }))}
            totalLessons={sortedLessons.length}
            lessonOrder={lesson.order}
            allLessonIds={sortedLessons.map((l) => l.id)}
          />
        )}
        {lesson.type === "VIDEO" && lesson.muxPlaybackId && (
          <VideoPlayer
            courseId={params.courseId}
            lessonId={lesson.id}
            playbackId={lesson.muxPlaybackId}
            nextLessonHref={next ? `/dashboard/learn/${params.courseId}/lessons/${next.id}` : null}
          />
        )}
        {lesson.type === "LIVE" && (
          <LiveClassJoin
            courseId={params.courseId}
            lessonId={lesson.id}
            liveScheduledAt={lesson.liveScheduledAt}
            liveMeetingUrl={lesson.liveMeetingUrl}
            hasRecording={Boolean(lesson.dailyRecordingId)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-col gap-3 border-t border-[#E5E5E5] pt-6 sm:flex-row sm:items-center sm:justify-between">
        {prev ? (
          <Button href={`/dashboard/learn/${params.courseId}/lessons/${prev.id}`} variant="secondary" size="md" className="w-full sm:w-auto">
            <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Previous lesson
          </Button>
        ) : (
          <div className="hidden sm:block" />
        )}
        {next ? (
          <Button href={`/dashboard/learn/${params.courseId}/lessons/${next.id}`} variant="primary" size="md" className="w-full sm:w-auto">
            Next lesson <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        ) : (
          <Button href={`/dashboard/learn/${params.courseId}`} variant="purple" size="md" className="w-full sm:w-auto">
            Back to course
          </Button>
        )}
      </div>
    </main>
  );
}
