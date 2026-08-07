"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle,
  FileText,
  HelpCircle,
  Lock,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/DesignSystem";
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
  const router = useRouter();
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
      <Card padding="md" className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-text-primary">
            {allComplete ? (
                <span className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-4 w-4" /> Completed
              </span>
            ) : (
              `${courseProgressPct}% complete`
            )}
          </p>
          {allComplete && (
            <Link
              href={`/dashboard/learn/${courseId}/certificate`}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#4451A2] hover:underline"
            >
              <Award className="h-4 w-4" /> View certificate
            </Link>
          )}
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-[#F8F9FB]"
          aria-label={`${courseProgressPct}% complete`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={courseProgressPct}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4451A2] to-[#683290] transition-all duration-500"
            style={{ width: `${courseProgressPct}%` }}
          />
        </div>
      </Card>

      {/* Lesson list */}
      <div className="mt-8 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A2E]">Lessons</h2>
          <p className="mt-1 text-sm text-[#666666]">Work through each lesson to complete the course.</p>
        </div>
        <span className="hidden text-xs font-medium text-[#767782] sm:block">{completedCount}/{totalLessons} complete</span>
      </div>
      <div className="mt-4 space-y-3">
        {sortedLessons.map((lesson) => {
          const Icon = typeIcons[lesson.type] ?? BookOpen;
          const completed = mounted && completedIds.includes(lesson.lessonId);
          const unlocked = mounted
            ? isLessonUnlocked(courseId, lesson.order, sortedLessons)
            : lesson.order === 1; // SSR: only first lesson unlocked

          const rowClass = `flex items-center gap-4 rounded-[8px] border bg-white p-4 transition-all duration-200 ${
            unlocked
              ? "border-[#E5E5E5] shadow-[0_1px_3px_rgba(26,26,46,0.08)] hover:-translate-y-0.5 hover:border-[#4451A2]/30 hover:shadow-[0_8px_24px_rgba(26,26,46,0.12)]"
              : "border-[#E5E5E5]/60 bg-[#F8F9FB]/60 opacity-60"
          }`;

          const lessonContent = (
            <>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${completed ? "bg-emerald-50" : "bg-[#4451A2]/10"}`}>
                {completed ? (
                    <CheckCircle className="h-5 w-5 text-emerald-700" />
                ) : unlocked ? (
                    <Icon className="h-5 w-5 text-[#4451A2]" />
                ) : (
                    <Lock className="h-5 w-5 text-[#767782]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[14px] font-medium ${
                    unlocked ? "text-[#1A1A2E]" : "text-[#666666]"
                  }`}
                >
                  {lesson.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant={lesson.type === "QUIZ" ? "purple" : lesson.type === "PDF" ? "red" : "blue"}>
                    {typeLabels[lesson.type]}
                  </Badge>
                </div>
              </div>
              <div className="shrink-0">
                {completed ? (
                  <Badge variant="success">Completed</Badge>
                ) : unlocked ? (
                  <Button size="sm" onClick={() => router.push(`/dashboard/learn/${courseId}/lessons/${lesson.lessonId}`)}>
                    {completedIds.length > 0 ? "Continue" : "Start"}
                  </Button>
                ) : (
                  <Badge>Locked</Badge>
                )}
              </div>
            </>
          );

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
