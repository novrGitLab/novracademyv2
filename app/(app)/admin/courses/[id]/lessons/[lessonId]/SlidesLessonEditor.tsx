"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText, ExternalLink, RefreshCw } from "lucide-react";
import { PdfUploader } from "./PdfUploader";
import { SlidesGeneratorModal } from "./SlidesGeneratorModal";

interface SlidesLessonEditorProps {
  courseId: string;
  lessonId: string;
  hasFile: boolean;
  allowDownload: boolean;
  hasGeneratedSlides: boolean;
}

interface GeneratedSlide {
  id: string;
  title: string;
  order: number;
}

export function SlidesLessonEditor({ courseId, lessonId, hasFile, allowDownload, hasGeneratedSlides }: SlidesLessonEditorProps) {
  const [showSlidesModal, setShowSlidesModal] = useState(false);
  const [slides, setSlides] = useState<GeneratedSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [generated, setGenerated] = useState(hasGeneratedSlides);

  const fetchGeneratedSlides = useCallback(async () => {
    setLoadingSlides(true);
    try {
      // Fetch the course and list the SLIDES-type lessons whose title/order
      // indicate they were generated from this source lesson. We filter by
      // lessonId match on the manifest's sourceLessonId when available.
      const res = await fetch(`/api/proxy/courses/${courseId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as {
        lessons?: { id: string; title: string; type: string; order: number; slidesManifest?: { sourceLessonId?: string } | null }[];
      };
      const mine = (data.lessons ?? [])
        .filter((l) => l.type === "SLIDES" && l.slidesManifest?.sourceLessonId === lessonId)
        .sort((a, b) => a.order - b.order)
        .map((l) => ({ id: l.id, title: l.title, order: l.order }));
      setSlides(mine);
      if (mine.length > 0) setGenerated(true);
    } catch {
      // Non-fatal — the editor still works without the list.
    } finally {
      setLoadingSlides(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    fetchGeneratedSlides();
  }, [fetchGeneratedSlides, generated]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-text-primary">Slides Lesson</p>
        <p className="mt-1 text-sm text-text-secondary">
          Upload a PDF, then generate slide lessons + optional AI narration. Each generated slide becomes its own lesson in this course.
        </p>
      </div>

      <PdfUploader courseId={courseId} lessonId={lessonId} hasFile={hasFile} allowDownload={allowDownload} />

      {hasFile && (
        <div className="rounded-card border border-border bg-background p-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSlidesModal(true)}
              className="rounded-card bg-[#542573] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#442063]"
            >
              {generated ? "Regenerate Slides" : "Generate Slides"}
            </button>
            <button
              onClick={fetchGeneratedSlides}
              className="inline-flex items-center gap-1.5 rounded-card border border-border px-4 py-2 text-[13px] font-medium text-text-primary hover:bg-surface"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh list
            </button>
          </div>

          {loadingSlides ? (
            <p className="mt-3 text-[13px] text-text-secondary">Loading generated slides…</p>
          ) : slides.length > 0 ? (
            <div className="mt-4">
              <p className="text-[13px] font-medium text-text-primary">
                Generated slide lessons ({slides.length})
              </p>
              <ul className="mt-2 space-y-1.5">
                {slides.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/admin/courses/${courseId}/lessons/${s.id}`}
                      className="flex items-center gap-2 rounded-card border border-border bg-surface px-3 py-2 text-[13px] text-text-primary transition hover:border-[#683290]/40 hover:bg-background"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#683290]" />
                      <span className="min-w-0 flex-1 truncate">{s.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-text-secondary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-[13px] text-text-secondary">
              No generated slides yet. Generate slides to create them as lessons in this course.
            </p>
          )}
        </div>
      )}

      {showSlidesModal && (
        <SlidesGeneratorModal
          courseId={courseId}
          lessonId={lessonId}
          onClose={() => setShowSlidesModal(false)}
          onGenerated={() => {
            setGenerated(true);
            fetchGeneratedSlides();
          }}
        />
      )}
    </div>
  );
}
