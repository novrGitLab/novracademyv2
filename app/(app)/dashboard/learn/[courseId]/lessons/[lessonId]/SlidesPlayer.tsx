"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlidesLessonViewer, type SlidesManifest } from "@/components/DesignSystem";
import { useToast } from "@/components/ui/toast-context";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";

interface SlidesPlayerProps {
  courseId: string;
  lessonId: string;
  manifest: SlidesManifest;
  nextLessonHref?: string | null;
}

export function SlidesPlayer({ courseId, lessonId, manifest, nextLessonHref }: SlidesPlayerProps) {
  const { toast } = useToast();
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial completion state so a re-visit shows "Completed".
  useEffect(() => {
    fetch(`/api/proxy/courses/${courseId}/progress`, { cache: "no-store" })
      .then(async (res) => (res.ok ? ((await res.json()) as { lessons: { lessonId: string; completed: boolean }[] }) : null))
      .then((data) => {
        const lesson = data?.lessons?.find((l) => l.lessonId === lessonId);
        if (lesson?.completed) setCompleted(true);
      })
      .catch(() => {});
  }, [courseId, lessonId]);

  async function handleMarkComplete() {
    if (completed || completing) return;
    setCompleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/courses/${courseId}/lessons/${lessonId}/slides/complete`, {
        method: "POST",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setCompleted(true);
      toast("Slides marked complete");
    } catch {
      setError("Could not mark this lesson complete. Please try again.");
      toast("Could not mark this lesson complete", "error");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div>
      <SlidesLessonViewer manifest={manifest} />

      {error && (
        <div className="mt-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {completed && nextLessonHref && (
          <Link
            href={nextLessonHref}
            className="inline-flex items-center gap-2 rounded-card bg-[#4451A2] px-5 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-[#39458e]"
          >
            Continue to next lesson <ChevronRight className="h-4 w-4" />
          </Link>
        )}
        <button
          onClick={handleMarkComplete}
          disabled={completed || completing}
          className={`flex items-center gap-2 rounded-card px-4 py-2.5 text-[14px] font-medium shadow-card transition ${
            completed
              ? "bg-emerald-600 text-white"
              : "bg-[#683290] text-white hover:bg-[#542573]"
          }`}
        >
          {completing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              {completed ? "Completed" : "Mark as complete"}
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-center text-[12px] text-text-secondary">
        Keyboard: Space = play/pause · ←/→ = prev/next slide · Present = fullscreen slideshow · Swipe on mobile
      </p>
    </div>
  );
}
