"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle,
  FileText,
  HelpCircle,
  Lock,
} from "lucide-react";
import {
  getCompletedLessons,
  getCourseProgress,
  isLessonUnlocked,
} from "@/lib/progress";
import type { HardcodedLesson } from "@/lib/courses-data";

const typeLabels: Record<string, string> = {
  VIDEO: "Video",
  PDF: "PDF",
  QUIZ: "Quiz",
  LIVE: "Live",
};

const typeIcons: Record<string, typeof BookOpen> = {
  VIDEO: BookOpen,
  PDF: FileText,
  QUIZ: HelpCircle,
  LIVE: BookOpen,
};

export function LessonList({
  courseId,
  lessons,
}: {
  courseId: string;
  lessons: HardcodedLesson[];
}) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCompletedIds(getCompletedLessons(courseId));
    setMounted(true);

    // Re-read on storage events (from other tabs) and focus
    const onStorage = () => setCompletedIds(getCompletedLessons(courseId));
    const onFocus = () => setCompletedIds(getCompletedLessons(courseId));
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [courseId]);

  const totalLessons = lessons.length;
  const completedCount = mounted ? completedIds.length : 0;
  const courseProgressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const allComplete = courseProgressPct === 100;

  // Re-check after mount using real progress
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Progress bar */}
      <div className="mt-6 rounded-card border border-border bg-background p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-text-primary">
            {allComplete ? (
              <span className="flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4" /> Completed
              </span>
            ) : (
              `${courseProgressPct}% complete`
            )}
          </p>
          {allComplete && (
            <Link
              href={`/dashboard/learn/${courseId}/certificate`}
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
      <h2 className="mt-8 text-[17px] font-semibold text-text-primary">
        Lessons
      </h2>
      <div className="mt-3 space-y-2">
        {sortedLessons.map((lesson) => {
          const Icon = typeIcons[lesson.type] ?? BookOpen;
          const completed = mounted && completedIds.includes(lesson.lessonId);
          const unlocked = mounted
            ? isLessonUnlocked(courseId, lesson.order, sortedLessons)
            : lesson.order === 1; // SSR: only first lesson unlocked

          const rowClass = `flex items-center gap-4 rounded-card border px-4 py-3 transition ${
            unlocked
              ? "border-border bg-background shadow-card hover:shadow-card-hover cursor-pointer"
              : "border-border/50 bg-surface/50 opacity-60"
          }`;

          const lessonContent = (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface">
                {completed ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : unlocked ? (
                  <Icon className="h-4 w-4 text-text-secondary" />
                ) : (
                  <Lock className="h-4 w-4 text-text-secondary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[14px] font-medium ${
                    unlocked ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {lesson.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="rounded-pill bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                    {typeLabels[lesson.type]}
                  </span>
                </div>
              </div>
              <div>
                {completed ? (
                  <span className="text-[12px] font-medium text-success">
                    Completed
                  </span>
                ) : unlocked ? (
                  <span className="text-[12px] font-medium text-blue">
                    Start
                  </span>
                ) : (
                  <span className="text-[12px] font-medium text-text-secondary">
                    Locked
                  </span>
                )}
              </div>
            </>
          );

          if (unlocked) {
            return (
              <Link
                key={lesson.lessonId}
                href={`/dashboard/learn/${courseId}/lessons/${lesson.lessonId}`}
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
    </>
  );
}
