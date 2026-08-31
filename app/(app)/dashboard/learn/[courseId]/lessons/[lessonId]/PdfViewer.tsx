"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import { CheckCircle, ChevronRight, ChevronLeft, Download, Loader2, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/toast-context";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  courseId: string;
  lessonId: string;
  allowDownload?: boolean;
  nextLessonHref?: string | null;
}

export function PdfViewer({ courseId, lessonId, allowDownload, nextLessonHref }: PdfViewerProps) {
  const { toast } = useToast();
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState(800);

  // Measure the stage so the PDF fills it responsively (no fixed-width letterbox).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStageWidth(Math.max(320, Math.floor(el.getBoundingClientRect().width) - 40));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewUrl]);

  useEffect(() => {
    fetch(`/api/proxy/courses/${courseId}/lessons/${lessonId}/pdf/view-url`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return (await res.json()) as { viewUrl: string; allowDownload: boolean } | null;
      })
      .then((res) => {
        if (res?.viewUrl) setViewUrl(res.viewUrl);
        else setError("PDF is not available yet.");
      })
      .catch(() => setError("Could not load the PDF. Please try again."))
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  }, []);

  // When the learner reaches the final page, mark the lesson complete.
  useEffect(() => {
    if (numPages !== null && page >= numPages && !completed) {
      markComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, numPages]);

  // Keyboard navigation: ArrowLeft/ArrowRight to flip pages.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function markComplete() {
    if (completed || completing) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/proxy/courses/${courseId}/lessons/${lessonId}/pdf/complete`, {
        method: "POST",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setCompleted(true);
      toast("Lesson marked complete");
    } catch {
      // Non-blocking — the user can retry via the button.
    } finally {
      setCompleting(false);
    }
  }

  function goPrev() { setPage((p) => Math.max(1, p - 1)); }
  function goNext() { if (numPages) setPage((p) => Math.min(numPages, p + 1)); }

  const pct = numPages ? Math.round((page / numPages) * 100) : 0;

  return (
    <div>
      {error && !viewUrl ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-card border border-dashed border-border bg-surface text-sm text-text-secondary">
          {error}
        </div>
      ) : (
        <div>
          {/* Parsed PDF reader — not the browser's native viewer */}
          <div ref={stageRef} className="rounded-card border border-border bg-surface/50">
            {/* Toolbar */}
            {viewUrl && numPages !== null && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-white/60 px-3 py-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={goPrev}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-[13px] font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary disabled:opacity-30"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="px-1 text-[13px] tabular-nums text-text-primary">
                    {page} / {numPages}
                  </span>
                  <button
                    onClick={goNext}
                    disabled={page >= (numPages ?? 1)}
                    className="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-[13px] font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary disabled:opacity-30"
                    aria-label="Next page"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(2)))}
                    className="rounded p-1.5 text-text-secondary transition hover:bg-surface hover:text-text-primary"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-[12px] tabular-nums text-text-secondary">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(2)))}
                    className="rounded p-1.5 text-text-secondary transition hover:bg-surface hover:text-text-primary"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="rounded p-1.5 text-text-secondary transition hover:bg-surface hover:text-text-primary"
                    aria-label="Reset zoom"
                    title="Reset zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.documentElement;
                      if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
                      else document.exitFullscreen?.();
                    }}
                    className="rounded p-1.5 text-text-secondary transition hover:bg-surface hover:text-text-primary"
                    aria-label="Fullscreen"
                    title="Fullscreen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Document */}
            {viewUrl ? (
              <Document
                file={viewUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-secondary">
                    <Loader2 className="h-5 w-5 animate-spin" /> Parsing PDF…
                  </div>
                }
                error={
                  <div className="py-24 text-center text-sm text-text-secondary">
                    Could not parse this PDF.
                  </div>
                }
                className="flex flex-col items-center py-4"
              >
                <Page
                  pageNumber={page}
                  width={Math.floor(stageWidth * zoom)}
                  loading={
                    <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-secondary">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading page…
                    </div>
                  }
                  renderAnnotationLayer
                  renderTextLayer
                />
              </Document>
            ) : (
              <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-secondary">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading…
              </div>
            )}

            {/* Reading progress */}
            {viewUrl && numPages !== null && (
              <div className="flex items-center gap-3 border-t border-border bg-white/60 px-4 py-2.5">
                <span className="text-[12px] font-medium tabular-nums text-text-secondary">
                  Page {page} of {numPages}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface" aria-hidden="true">
                  <div className="h-full rounded-full bg-[#4451A2] transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[12px] font-medium tabular-nums text-[#4451A2]">{pct}%</span>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            {allowDownload && viewUrl && (
              <a
                href={viewUrl}
                download
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-auth-primary hover:underline"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </a>
            )}
            {completed && nextLessonHref && (
              <Link
                href={nextLessonHref}
                className="inline-flex items-center gap-2 rounded-card bg-[#4451A2] px-5 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-[#39458e]"
              >
                Continue to next lesson <ChevronRight className="h-4 w-4" />
              </Link>
            )}
            <button
              onClick={markComplete}
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
        </div>
      )}
    </div>
  );
}
