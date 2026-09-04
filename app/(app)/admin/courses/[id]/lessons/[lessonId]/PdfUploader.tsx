"use client";

import { useState } from "react";
import { requestPdfUploadUrlAction, setPdfAllowDownloadAction } from "../../../actions";

function putWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", "application/pdf");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export function PdfUploader({
  courseId,
  lessonId,
  hasFile,
  allowDownload,
  onUploaded,
}: {
  courseId: string;
  lessonId: string;
  hasFile: boolean;
  allowDownload: boolean;
  /** Called after a successful upload so the parent can refresh server state. */
  onUploaded?: () => void;
}) {
  const [uploaded, setUploaded] = useState(hasFile);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadEnabled, setDownloadEnabled] = useState(allowDownload);
  const [togglingDownload, setTogglingDownload] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const { uploadUrl } = await requestPdfUploadUrlAction(courseId, lessonId);
      await putWithProgress(uploadUrl, file, setProgress);
      setUploaded(true);
      onUploaded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleDownload() {
    const next = !downloadEnabled;
    setDownloadEnabled(next);
    setTogglingDownload(true);
    try {
      await setPdfAllowDownloadAction(courseId, lessonId, next);
    } catch (err) {
      setDownloadEnabled(!next);
      setError(err instanceof Error ? err.message : "Could not update the download setting");
    } finally {
      setTogglingDownload(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-medium text-text-primary">Document</p>
        {uploaded && (
          <span className="rounded-pill bg-success-light px-2 py-1 text-[13px] text-success">Uploaded</span>
        )}
      </div>

      <div className="mt-4">
        <label className="inline-block cursor-pointer rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573]">
          {uploading ? "Uploading…" : uploaded ? "Replace PDF" : "Choose PDF file"}
          <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>

        {uploading && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-surface">
            <div className="h-full bg-[#683290] transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {error && <p className="mt-2 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}
      </div>

      <label className="mt-4 flex items-center gap-2 text-[15px] text-text-primary">
        <input type="checkbox" checked={downloadEnabled} onChange={handleToggleDownload} disabled={togglingDownload} className="h-4 w-4 rounded border-border disabled:opacity-50" />
        Allow learners to download this PDF {togglingDownload && <span className="text-[12px] text-text-secondary">(saving…)</span>}
      </label>
    </div>
  );
}
