"use client";

import { useState } from "react";
import { FileUp, Loader2, CheckCircle2 } from "lucide-react";
import { requestSlidesPptxUploadUrlAction, importSlidesPptxAction } from "../../../actions";

function putWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

/**
 * Direct .pptx upload for a Slides lesson — no AI generation. The file goes
 * straight to R2 via a presigned URL, then the backend parses it into a
 * composited slides manifest and attaches it to this lesson.
 */
export function PptxUploader({ courseId, lessonId, onImported }: { courseId: string; lessonId: string; onImported: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);
    setImporting(false);

    try {
      const { uploadUrl, key } = await requestSlidesPptxUploadUrlAction(courseId, lessonId);
      await putWithProgress(uploadUrl, file, setProgress);
      setUploading(false);
      setImporting(true);
      await importSlidesPptxAction(courseId, lessonId, key);
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setImporting(false);
    }
  }

  return (
    <div className="rounded-card border border-dashed border-border bg-surface/40 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-card border border-[#4451A2] px-4 py-2 text-[14px] font-medium text-[#4451A2] transition hover:bg-[#4451A2]/10">
          {uploading || importing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
          {uploading ? "Uploading…" : importing ? "Importing…" : "Upload existing .pptx"}
          <input
            type="file"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading || importing}
          />
        </label>
        {uploading && progress > 0 && (
          <span className="text-[13px] tabular-nums text-text-secondary">{progress}%</span>
        )}
        {!uploading && !importing && !error && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary">
            <CheckCircle2 className="h-3.5 w-3.5" /> Have a finished PowerPoint? Upload it directly — no AI generation needed.
          </span>
        )}
      </div>

      {uploading && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-surface">
          <div className="h-full bg-[#4451A2] transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="mt-2 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}
    </div>
  );
}
