"use client";

import { useState, useEffect } from "react";
import { generateSlidesAction, getSlidesGenerationStatusAction } from "../actions";

interface SlidesGeneratorModalProps {
  courseId: string;
  lessonId: string;
  onClose: () => void;
  onGenerated: () => void;
}

export function SlidesGeneratorModal({ courseId, lessonId, onClose, onGenerated }: SlidesGeneratorModalProps) {
  const [slideCount, setSlideCount] = useState(10);
  const [voiceover, setVoiceover] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setStatus("PENDING");

    try {
      const result = await generateSlidesAction(courseId, lessonId, slideCount, voiceover);
      setGenerationId(result.generationId);
      setStatus(result.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start generation");
      setStatus(null);
    }
  }

  useEffect(() => {
    if (!generationId) return;

    const poll = setInterval(async () => {
      try {
        const result = await getSlidesGenerationStatusAction(courseId, lessonId);
        setStatus(result.status);
        setProgress(result.progress);

        if (result.status === "COMPLETED") {
          clearInterval(poll);
          setTimeout(() => {
            onGenerated();
            onClose();
          }, 1500);
        } else if (result.status === "FAILED") {
          clearInterval(poll);
          setError(result.errorMessage ?? "Generation failed");
        }
      } catch {
        clearInterval(poll);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [generationId, courseId, lessonId, onClose, onGenerated]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-card bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-text-primary">Generate Slides</h2>

        {!status && (
          <>
            <p className="mt-2 text-sm text-text-secondary">
              Convert this PDF into a series of video lessons with one slide per lesson.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Number of slides (5–20)
                </label>
                <input
                  type="number"
                  min={5}
                  max={20}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Math.min(20, Math.max(5, Number(e.target.value))))}
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

            {error && <p className="mt-3 rounded-pill bg-red-light px-3 py-2 text-sm text-red">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-card border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="rounded-card bg-[#683290] px-4 py-2 text-sm font-medium text-white hover:bg-[#542573]"
              >
                Generate
              </button>
            </div>
          </>
        )}

        {status && (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#683290] border-t-transparent" />
              <p className="text-sm font-medium text-text-primary">{progress || "Processing…"}</p>
            </div>
            {error && <p className="mt-3 rounded-pill bg-red-light px-3 py-2 text-sm text-red">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
