"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { Skeleton } from "@/components/Skeleton";

interface DropOffLesson {
  lessonId: string;
  title: string;
  order: number;
  learnersStalledHere: number;
}

export default function DropOffPage({ params }: { params: { courseId: string } }) {
  const { data, loading } = useApi<{ lessons: DropOffLesson[] }>(`/analytics/lms/drop-off/${params.courseId}`, {
    lessons: [],
  });
  const lessons = data.lessons;
  const maxStalled = Math.max(1, ...lessons.map((l) => l.learnersStalledHere));

  return (
    <div className="max-w-2xl">
      <Link href="/admin/analytics" className="text-[13px] text-text-secondary hover:text-[#683290]">
        ← LMS analytics
      </Link>
      <h1 className="mt-2 text-[24px] font-semibold text-text-primary">Drop-off analysis</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Where active (incomplete) learners are currently stalled, lesson by lesson.
      </p>

      <div className="mt-6 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : (
          <>
            {lessons.map((lesson) => (
              <div key={lesson.lessonId} className="rounded-card border border-border bg-background p-3">
                <div className="flex items-center justify-between text-[15px]">
                  <span className="text-text-primary">
                    {lesson.order}. {lesson.title}
                  </span>
                  <span className="text-text-secondary">{lesson.learnersStalledHere} stalled</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-surface">
                  <div
                    className="h-full bg-red"
                    style={{ width: `${(lesson.learnersStalledHere / maxStalled) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {lessons.length === 0 && <p className="text-[15px] text-text-secondary">No lessons in this course.</p>}
          </>
        )}
      </div>
    </div>
  );
}
