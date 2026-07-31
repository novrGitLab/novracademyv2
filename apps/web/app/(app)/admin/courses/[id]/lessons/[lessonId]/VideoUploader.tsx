"use client";

import { useEffect, useRef, useState } from "react";
import { getLessonAction, requestVideoUploadUrlAction } from "../../../actions";

type VideoStatus = "PREPARING" | "READY" | "ERRORED" | null;

function putWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export function VideoUploader({
  courseId,
  lessonId,
  initialStatus,
}: {
  courseId: string;
  lessonId: string;
  initialStatus: VideoStatus;
}) {
  const [status, setStatus] = useState<VideoStatus>(initialStatus);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "PREPARING") {
      pollRef.current = setInterval(async () => {
        const lesson = await getLessonAction(courseId, lessonId);
        setStatus(lesson.videoStatus);
        if (lesson.videoStatus === "READY" || lesson.videoStatus === "ERRORED") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }, 4000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [status, courseId, lessonId]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const { uploadUrl } = await requestVideoUploadUrlAction(courseId, lessonId);
      await putWithProgress(uploadUrl, file, setProgress);
      setStatus("PREPARING");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-medium text-text-primary">Video</p>
        <StatusBadge status={status} />
      </div>

      {status !== "READY" && (
        <div className="mt-4">
          <label className="inline-block cursor-pointer rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90">
            {uploading ? "Uploading…" : "Choose video file"}
            <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>

          {uploading && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-surface">
              <div className="h-full bg-blue transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          {status === "PREPARING" && !uploading && (
            <p className="mt-2 text-[13px] text-text-secondary">
              Mux is processing the video. This page updates automatically.
            </p>
          )}

          {error && <p className="mt-2 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}
        </div>
      )}

      {status === "READY" && (
        <p className="mt-2 text-[13px] text-text-secondary">
          Video is ready. Upload a new file to replace it.
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: VideoStatus }) {
  if (!status) return <span className="rounded-pill bg-surface px-2 py-1 text-[13px] text-text-secondary">No video</span>;
  const styles: Record<NonNullable<VideoStatus>, string> = {
    PREPARING: "bg-blue-light text-blue",
    READY: "bg-success-light text-success",
    ERRORED: "bg-red-light text-red",
  };
  return <span className={`rounded-pill px-2 py-1 text-[13px] ${styles[status]}`}>{status}</span>;
}
