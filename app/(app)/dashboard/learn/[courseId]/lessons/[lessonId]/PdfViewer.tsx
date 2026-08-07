"use client";

import { useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { markPdfCompleteAction } from "./actions";

// Loaded from a CDN rather than bundled: bundling the worker locally hits a
// known Next.js/Terser incompatibility (Terser can't minify the worker's
// ESM import/export syntax). Pinned to the installed pdfjs-dist version so
// it always matches what react-pdf expects.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer({
  courseId,
  lessonId,
  viewUrl,
  allowDownload,
  initialCompleted,
}: {
  courseId: string;
  lessonId: string;
  viewUrl: string;
  allowDownload: boolean;
  initialCompleted: boolean;
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [completed, setCompleted] = useState(initialCompleted);

  const onLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
  }, []);

  async function goToNextPage() {
    if (!numPages) return;
    const next = Math.min(numPages, pageNumber + 1);
    setPageNumber(next);
    if (next === numPages && !completed) {
      const result = await markPdfCompleteAction(courseId, lessonId);
      setCompleted(result.completed);
    }
  }

  function goToPrevPage() {
    setPageNumber((p) => Math.max(1, p - 1));
  }

  return (
    // Deters casual right-click "save as" — content is still viewable/screenshottable,
    // which is the practical ceiling for an in-browser document viewer.
    <div onContextMenu={(e) => e.preventDefault()}>
      <div className="overflow-auto rounded-card border border-border bg-surface p-4">
        <Document
          file={viewUrl}
          onLoadSuccess={onLoadSuccess}
          loading={<p className="text-[15px] text-text-secondary">Loading document…</p>}
          error={<p className="text-[15px] text-[#E82027]">Couldn't load this document.</p>}
        >
          <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} width={720} />
        </Document>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="rounded-card border border-border px-3 py-1.5 text-[13px] text-text-primary disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-[13px] text-text-secondary">
            Page {pageNumber} of {numPages ?? "…"}
          </span>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={!numPages || pageNumber >= numPages}
            className="rounded-card border border-border px-3 py-1.5 text-[13px] text-text-primary disabled:opacity-30"
          >
            Next →
          </button>
        </div>

        {allowDownload && (
          <a href={viewUrl} download className="text-[13px] text-[#4451A2] hover:underline">
            Download
          </a>
        )}
      </div>

      {completed && (
        <p className="mt-2 w-fit rounded-pill bg-emerald-50 px-3 py-2 text-[13px] text-emerald-600">
          Marked as complete
        </p>
      )}
    </div>
  );
}
