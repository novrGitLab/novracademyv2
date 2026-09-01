"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { generateSlidesAction, getSlidesGenerationStatusAction } from "../../../actions";

interface SlidesGeneratorModalProps {
  courseId: string;
  lessonId: string;
  onClose: () => void;
  onGenerated: () => void;
}

type Phase = "form" | "generating" | "done" | "failed";

export function SlidesGeneratorModal({ courseId, lessonId, onClose, onGenerated }: SlidesGeneratorModalProps) {
  const [slideCount, setSlideCount] = useState(10);
  const [voiceover, setVoiceover] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const stopPolling = useCallback(() => {
    // setPhase changes below stop the effect's interval via its cleanup.
  }, []);

  async function handleGenerate() {
    setError(null);
    setPhase("generating");
    setProgress("Starting…");

    try {
      const result = await generateSlidesAction(courseId, lessonId, slideCount, voiceover);
      setGenerationId(result.generationId);
      setProgress(result.status === "PENDING" ? "Queued — waiting to start…" : "Generating slides…");
    } catch (err) {
      setPhase("failed");
      setError(err instanceof Error ? err.message : "Failed to start generation");
    }
  }

  // Poll generation status until COMPLETED / FAILED.
  useEffect(() => {
    if (!generationId) return;

    const poll = setInterval(async () => {
      try {
        const result = await getSlidesGenerationStatusAction(courseId, lessonId);
        setProgress(result.progress);

        if (result.status === "COMPLETED") {
          clearInterval(poll);
          setGeneratedCount((result.generatedLessonIds ?? []).length);
          setPhase("done");
          // Let the parent know (it may refresh the lesson list), but DON'T
          // auto-close — show the success state so the admin knows it worked.
          onGenerated();
        } else if (result.status === "FAILED") {
          clearInterval(poll);
          setPhase("failed");
          setError(result.errorMessage ?? "Generation failed");
        }
      } catch {
        // Transient poll error — keep polling on the next tick.
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [generationId, courseId, lessonId, onGenerated]);

  function handleRetry() {
    setPhase("form");
    setError(null);
    setProgress("");
    setGeneratedCount(0);
    setGenerationId(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-card bg-background p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Generate Slides</h2>
          <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* Phase: form */}
        {phase === "form" && (
          <>
            <p className="mt-2 text-sm text-text-secondary">
              Convert this PDF into a slide deck for this lesson. The generated deck is saved onto this lesson.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Number of slides (1–20)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Math.min(20, Math.max(1, Number(e.target.value))))}
                  className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-[#683290]"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={voiceover}
                  onChange={(e) => setVoiceover(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Include AI narration (TTS voiceover)
              </label>
            </div>

            {error && (
              <p className="mt-3 flex items-start gap-2 rounded-pill bg-red-light px-3 py-2 text-sm text-red">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-card border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 rounded-card bg-[#683290] px-4 py-2 text-sm font-medium text-white hover:bg-[#542573]"
              >
                Generate
              </button>
            </div>
          </>
        )}

        {/* Phase: generating */}
        {phase === "generating" && (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#683290]" />
              <p className="text-sm font-medium text-text-primary">{progress || "Processing…"}</p>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface">
              <div className="h-full animate-pulse rounded-full bg-[#683290]" style={{ width: "60%" }} />
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              This can take a few minutes — the PDF is sent to the AI to build slides. You can keep this tab open.
            </p>
          </div>
        )}

        {/* Phase: done */}
        {phase === "done" && (
          <div className="mt-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-text-primary">Slide deck ready!</h3>
            <p className="mt-1 text-sm text-text-secondary">
              The slides were saved onto this lesson. Preview them below or open the lesson for learners.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Link
                href={`/admin/courses/${courseId}`}
                className="inline-flex items-center justify-center gap-2 rounded-card bg-[#683290] px-4 py-2 text-sm font-medium text-white hover:bg-[#542573]"
              >
                View lessons in course <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                onClick={onClose}
                className="rounded-card border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Phase: failed */}
        {phase === "failed" && (
          <div className="mt-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-text-primary">Generation failed</h3>
            <p className="mt-1 break-words text-sm text-text-secondary">{error ?? "Something went wrong."}</p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-card bg-[#683290] px-4 py-2 text-sm font-medium text-white hover:bg-[#542573]"
              >
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
              <button
                onClick={onClose}
                className="rounded-card border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
