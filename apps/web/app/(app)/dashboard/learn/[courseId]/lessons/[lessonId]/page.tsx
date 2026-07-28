import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { LessonPlayer } from "./LessonPlayer";
import { PdfViewer } from "./PdfViewer";
import { QuizTaker, type QuizQuestionForLearner } from "./QuizTaker";
import { LiveClassJoin } from "./LiveClassJoin";
import { AiAssistantPanel } from "../../AiAssistantPanel";

interface CourseDetail {
  id: string;
  title: string;
  allowForwardScrub: boolean;
}

interface LessonDetail {
  id: string;
  courseId: string;
  title: string;
  type: "VIDEO" | "PDF" | "QUIZ" | "LIVE";
  minWatchPct: number;
  videoStatus: "PREPARING" | "READY" | "ERRORED" | null;
  muxPlaybackId: string | null;
  contentUrl: string | null;
  liveScheduledAt: string | null;
  liveMeetingUrl: string | null;
  dailyRecordingId: string | null;
  quiz: {
    id: string;
    passMarkPct: number;
    maxAttempts: number;
    questions: QuizQuestionForLearner[];
  } | null;
}

interface LessonProgressEntry {
  lessonId: string;
  unlocked: boolean;
  completed: boolean;
  lastPositionSeconds: number;
  order: number;
}

export default async function LessonPlayerPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const [course, lesson] = await Promise.all([
    apiFetch<CourseDetail>(`/courses/${params.courseId}`).catch(() => null),
    apiFetch<LessonDetail>(`/courses/${params.courseId}/lessons/${params.lessonId}`).catch(() => null),
  ]);
  if (!course || !lesson) notFound();

  let progress: { lessons: LessonProgressEntry[] } | null = null;
  try {
    progress = await apiFetch<{ lessons: LessonProgressEntry[] }>(`/courses/${params.courseId}/progress`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return <Notice courseId={params.courseId}>You're not enrolled in this course yet.</Notice>;
    }
    console.warn(`Failed to load progress for course ${params.courseId}:`, (err as Error).message);
    return <Notice courseId={params.courseId}>Couldn't load this lesson right now. Try refreshing the page.</Notice>;
  }

  const entry = progress.lessons.find((l) => l.lessonId === lesson.id);
  if (!entry?.unlocked) {
    return <Notice courseId={params.courseId}>Complete the previous lesson first.</Notice>;
  }

  const sortedLessons = [...progress.lessons].sort((a, b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex((l) => l.lessonId === lesson.id);
  const next = sortedLessons[currentIndex + 1];
  const nextLessonHref = next ? `/dashboard/learn/${params.courseId}/lessons/${next.lessonId}` : null;

  if (lesson.type === "LIVE") {
    return (
      <>
        <div className="max-w-3xl">
          <Link href={`/dashboard/learn/${params.courseId}`} className="text-[13px] text-text-secondary hover:text-blue">
            ← {course.title}
          </Link>
          <h1 className="mt-2 text-[24px] font-semibold text-text-primary">{lesson.title}</h1>

          <div className="mt-4">
            <LiveClassJoin
              courseId={params.courseId}
              lessonId={lesson.id}
              liveScheduledAt={lesson.liveScheduledAt}
              hasRoom={Boolean(lesson.liveMeetingUrl)}
              hasRecording={Boolean(lesson.dailyRecordingId)}
              initialCompleted={entry.completed}
              nextLessonHref={nextLessonHref}
            />
          </div>
        </div>
        <AiAssistantPanel courseId={params.courseId} />
      </>
    );
  }

  if (lesson.type === "QUIZ") {
    if (!lesson.quiz) {
      return <Notice courseId={params.courseId}>This quiz has no questions yet.</Notice>;
    }
    const attemptsResult = await apiFetch<{ attempts: { attemptNumber: number; score: number; passed: boolean }[] }>(
      `/courses/${params.courseId}/lessons/${params.lessonId}/quiz/attempts`
    ).catch((err) => {
      console.warn(`Failed to load quiz attempts for lesson ${params.lessonId}:`, (err as Error).message);
      return null;
    });
    if (!attemptsResult) {
      return <Notice courseId={params.courseId}>Couldn't load this quiz right now. Try refreshing the page.</Notice>;
    }
    const { attempts } = attemptsResult;

    return (
      <>
        <div className="max-w-2xl">
          <Link href={`/dashboard/learn/${params.courseId}`} className="text-[13px] text-text-secondary hover:text-blue">
            ← {course.title}
          </Link>
          <h1 className="mt-2 text-[24px] font-semibold text-text-primary">{lesson.title}</h1>

          <div className="mt-4">
            <QuizTaker
              courseId={params.courseId}
              lessonId={lesson.id}
              questions={lesson.quiz.questions}
              passMarkPct={lesson.quiz.passMarkPct}
              maxAttempts={lesson.quiz.maxAttempts}
              attemptsUsed={attempts.length}
              initialCompleted={entry.completed}
              nextLessonHref={nextLessonHref}
            />
          </div>
        </div>
        <AiAssistantPanel courseId={params.courseId} />
      </>
    );
  }

  if (lesson.type === "PDF") {
    if (!lesson.contentUrl) {
      return <Notice courseId={params.courseId}>This document hasn't been uploaded yet.</Notice>;
    }
    const pdfResult = await apiFetch<{ viewUrl: string; allowDownload: boolean }>(
      `/courses/${params.courseId}/lessons/${params.lessonId}/pdf/view-url`
    ).catch((err) => {
      console.warn(`Failed to load PDF view URL for lesson ${params.lessonId}:`, (err as Error).message);
      return null;
    });
    if (!pdfResult) {
      return <Notice courseId={params.courseId}>Couldn't load this document right now. Try refreshing the page.</Notice>;
    }
    const { viewUrl, allowDownload } = pdfResult;

    return (
      <>
        <div className="max-w-3xl">
          <Link href={`/dashboard/learn/${params.courseId}`} className="text-[13px] text-text-secondary hover:text-blue">
            ← {course.title}
          </Link>
          <h1 className="mt-2 text-[24px] font-semibold text-text-primary">{lesson.title}</h1>

          <div className="mt-4">
            <PdfViewer
              courseId={params.courseId}
              lessonId={lesson.id}
              viewUrl={viewUrl}
              allowDownload={allowDownload}
              initialCompleted={entry.completed}
            />
          </div>

          {entry.completed && nextLessonHref && (
            <Link
              href={nextLessonHref}
              className="mt-4 inline-block rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
            >
              Next lesson →
            </Link>
          )}
        </div>
        <AiAssistantPanel courseId={params.courseId} />
      </>
    );
  }

  // VIDEO
  if (lesson.videoStatus !== "READY" || !lesson.muxPlaybackId) {
    return <Notice courseId={params.courseId}>This video is still processing. Check back shortly.</Notice>;
  }

  const tokenResult = await apiFetch<{ playbackId: string; token: string }>(
    `/courses/${params.courseId}/lessons/${params.lessonId}/video/playback-token`
  ).catch((err) => {
    console.warn(`Failed to load playback token for lesson ${params.lessonId}:`, (err as Error).message);
    return null;
  });
  if (!tokenResult) {
    return <Notice courseId={params.courseId}>Couldn't load this video right now. Try refreshing the page.</Notice>;
  }
  const { token } = tokenResult;

  return (
    <>
      <div className="max-w-3xl">
        <Link href={`/dashboard/learn/${params.courseId}`} className="text-[13px] text-text-secondary hover:text-blue">
          ← {course.title}
        </Link>
        <h1 className="mt-2 text-[24px] font-semibold text-text-primary">{lesson.title}</h1>

        <div className="mt-4">
          <LessonPlayer
            courseId={params.courseId}
            lessonId={lesson.id}
            playbackId={lesson.muxPlaybackId}
            token={token}
            minWatchPct={lesson.minWatchPct}
            resumeFrom={entry.lastPositionSeconds}
            allowForwardScrub={course.allowForwardScrub}
            initialCompleted={entry.completed}
            nextLessonHref={nextLessonHref}
          />
        </div>
      </div>
      <AiAssistantPanel courseId={params.courseId} />
    </>
  );
}

function Notice({ courseId, children }: { courseId: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <Link href={`/dashboard/learn/${courseId}`} className="text-[13px] text-text-secondary hover:text-blue">
        ← Back to course
      </Link>
      <p className="mt-4 rounded-card border border-border bg-surface px-4 py-3 text-[15px] text-text-secondary">
        {children}
      </p>
    </div>
  );
}
