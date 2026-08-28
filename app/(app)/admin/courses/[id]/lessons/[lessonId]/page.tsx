import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { VideoUploader } from "./VideoUploader";
import { LessonDetailClient } from "./LessonDetailClient";
import { QuizBuilder, type QuizQuestion } from "./QuizBuilder";
import { LiveClassScheduler } from "./LiveClassScheduler";
import { getLiveAttendanceAction } from "../../../actions";

interface LessonDetail {
  id: string;
  courseId: string;
  title: string;
  type: "VIDEO" | "PDF" | "QUIZ" | "LIVE" | "SLIDES";
  minWatchPct: number;
  durationSeconds: number | null;
  videoStatus: "PREPARING" | "READY" | "ERRORED" | null;
  muxPlaybackId: string | null;
  contentUrl: string | null;
  pdfAllowDownload: boolean;
  liveScheduledAt: string | null;
  liveMeetingUrl: string | null;
  dailyRecordingId: string | null;
  quiz: {
    id: string;
    passMarkPct: number;
    maxAttempts: number;
    questions: QuizQuestion[];
  } | null;
  slidesManifest: Record<string, unknown> | null;
}

export default async function LessonDetailPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const lesson = await apiFetch<LessonDetail>(`/courses/${params.id}/lessons/${params.lessonId}`).catch(
    () => null
  );
  if (!lesson) notFound();

  const attendance =
    lesson.type === "LIVE" && lesson.liveMeetingUrl
      ? (await getLiveAttendanceAction(params.id, lesson.id).catch(() => null))?.attendance ?? []
      : [];

  return (
    <div className="max-w-2xl">
      <Link href={`/admin/courses/${params.id}`} className="text-[13px] text-text-secondary hover:text-[#683290]">
        ← Back to course
      </Link>
      <h1 className="mt-2 text-[24px] font-semibold text-text-primary">{lesson.title}</h1>

      {lesson.type === "VIDEO" && (
        <div className="mt-6">
          <VideoUploader courseId={params.id} lessonId={lesson.id} initialStatus={lesson.videoStatus} />
        </div>
      )}

      {lesson.type === "PDF" && (
        <div className="mt-6">
          <LessonDetailClient
            courseId={params.id}
            lessonId={lesson.id}
            hasFile={Boolean(lesson.contentUrl)}
            allowDownload={lesson.pdfAllowDownload}
          />
        </div>
      )}

      {lesson.type === "QUIZ" && lesson.quiz && (
        <div className="mt-6">
          <QuizBuilder courseId={params.id} lessonId={lesson.id} quiz={lesson.quiz} />
        </div>
      )}

      {lesson.type === "LIVE" && (
        <div className="mt-6">
          <LiveClassScheduler
            courseId={params.id}
            lessonId={lesson.id}
            liveScheduledAt={lesson.liveScheduledAt}
            liveMeetingUrl={lesson.liveMeetingUrl}
            hasRecording={Boolean(lesson.dailyRecordingId)}
            attendance={attendance}
          />
        </div>
      )}

      {lesson.type === "SLIDES" && (
        <div className="mt-6 rounded-card border border-border bg-surface p-5">
          <p className="text-sm font-medium text-text-primary">Slides Lesson</p>
          <p className="mt-1 text-sm text-text-secondary">
            This lesson was auto-generated. Edit the source PDF lesson to regenerate slides.
          </p>
          {lesson.slidesManifest && (
            <div className="mt-3 text-sm text-text-secondary">
              {Array.isArray((lesson.slidesManifest as { slideImages?: unknown[] })?.slideImages)
                ? `${((lesson.slidesManifest as { slideImages: unknown[] }).slideImages).length} slides`
                : "View available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
