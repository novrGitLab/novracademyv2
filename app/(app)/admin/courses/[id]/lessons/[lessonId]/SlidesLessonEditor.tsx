"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, RefreshCw } from "lucide-react";
import { PdfUploader } from "./PdfUploader";
import { PptxUploader } from "./PptxUploader";
import { SlidesGeneratorModal } from "./SlidesGeneratorModal";
import { SlidesPreview } from "./SlidesPreview";
import { getLessonAction } from "../../../actions";
import type { SlidesManifest } from "@/components/DesignSystem";

interface SlidesLessonEditorProps {
  courseId: string;
  lessonId: string;
  hasFile: boolean;
  allowDownload: boolean;
  hasGeneratedSlides: boolean;
}

export function SlidesLessonEditor({ courseId, lessonId, hasFile, allowDownload, hasGeneratedSlides }: SlidesLessonEditorProps) {
  const router = useRouter();
  const [showSlidesModal, setShowSlidesModal] = useState(false);
  const [manifest, setManifest] = useState<SlidesManifest | null>(null);
  const [loadingManifest, setLoadingManifest] = useState(false);
  const [generated, setGenerated] = useState(hasGeneratedSlides);
  // Tracks PDF presence client-side: flips on as soon as an upload completes
  // so the Generate section appears without waiting for a manual reload.
  const [pdfReady, setPdfReady] = useState(hasFile);

  // Refresh the manifest from the API so the preview always matches the server.
  const refreshManifest = useCallback(async () => {
    setLoadingManifest(true);
    try {
      const lesson = await getLessonAction(courseId, lessonId);
      const m = (lesson as unknown as { slidesManifest?: SlidesManifest | null }).slidesManifest ?? null;
      setManifest(m);
      setGenerated(
        Boolean(
          m &&
            ((Array.isArray(m.slideImages) && m.slideImages.length > 0) ||
              (Array.isArray(m.slidesData) && m.slidesData.length > 0))
        )
      );
    } catch {
      // Non-fatal — the editor still works without a live manifest.
    } finally {
      setLoadingManifest(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    refreshManifest();
  }, [refreshManifest]);

  // After a PDF upload: reveal the Generate section immediately, then sync
  // the server-rendered state in the background.
  const handlePdfUploaded = useCallback(() => {
    setPdfReady(true);
    router.refresh();
  }, [router]);

  const showGenerate = pdfReady || hasFile;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-text-primary">Slides Lesson</p>
        <p className="mt-1 text-sm text-text-secondary">
          Upload a PDF to generate a slide deck, or upload a finished PowerPoint directly. The deck is stored on this
          lesson — no extra lesson is created.
        </p>
      </div>

      <PdfUploader
        courseId={courseId}
        lessonId={lessonId}
        hasFile={hasFile}
        allowDownload={allowDownload}
        onUploaded={handlePdfUploaded}
      />
      <PptxUploader courseId={courseId} lessonId={lessonId} onImported={refreshManifest} />

      {showGenerate && (
        <div className="rounded-card border border-border bg-background p-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSlidesModal(true)}
              className="rounded-card bg-[#542573] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#442063]"
            >
              {generated ? "Regenerate Slides" : "Generate Slides"}
            </button>
            <button
              onClick={refreshManifest}
              className="inline-flex items-center gap-1.5 rounded-card border border-border px-4 py-2 text-[13px] font-medium text-text-primary hover:bg-surface"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>

          {generated && (
            <div className="mt-4">
              <p className="text-[13px] font-medium text-text-primary">Generated slide deck</p>
              <p className="mt-1 text-[13px] text-text-secondary">
                Saved to this lesson — preview below, or open the lesson for learners.
              </p>
              <Link
                href={`/dashboard/learn/${courseId}/lessons/${lessonId}`}
                className="mt-2 inline-flex items-center gap-1.5 rounded-card border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary transition hover:bg-surface"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open as learner
              </Link>
            </div>
          )}
        </div>
      )}

      {loadingManifest ? (
        <p className="text-[13px] text-text-secondary">Loading preview…</p>
      ) : manifest ? (
        <SlidesPreview manifest={manifest} />
      ) : null}

      {showSlidesModal && (
        <SlidesGeneratorModal
          courseId={courseId}
          lessonId={lessonId}
          onClose={() => setShowSlidesModal(false)}
          onGenerated={() => {
            setGenerated(true);
            refreshManifest();
          }}
        />
      )}
    </div>
  );
}
