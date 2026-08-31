"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { CheckCircle, Loader2 } from "lucide-react";

const HEARTBEAT_INTERVAL_MS = 5000;

interface VideoPlayerProps {
  courseId: string;
  lessonId: string;
  playbackId: string;
  nextLessonHref?: string | null;
}

export function VideoPlayer({ courseId, lessonId, playbackId, nextLessonHref }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const lastSentRef = useRef(0);
  const completedRef = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/proxy/courses/${courseId}/lessons/${lessonId}/video/playback-token`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return (await res.json()) as { playbackId: string; token: string };
      })
      .then((data) => {
        setToken(data.token);
      })
      .catch((err) => {
        setError((err as Error).message || "Could not load the video. Please try again.");
      })
      .finally(() => setTokenLoaded(true));
  }, [courseId, lessonId]);

  const sendHeartbeat = useCallback(() => {
    const el = playerRef.current as unknown as HTMLVideoElement | null;
    if (!el || completedRef.current) return;
    const position = el.currentTime ?? 0;
    const duration = el.duration ?? 0;
    if (!isFinite(position) || !isFinite(duration) || duration <= 0) return;

    // Throttle: only send if >=5s since last send, or the final position.
    const now = Date.now();
    if (now - lastSentRef.current < HEARTBEAT_INTERVAL_MS && position < duration - 1) return;
    lastSentRef.current = now;

    fetch(`/api/proxy/courses/${courseId}/lessons/${lessonId}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionSeconds: Math.floor(position), durationSeconds: Math.floor(duration) }),
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = (await res.json()) as { completed: boolean };
        if (data.completed && !completedRef.current) {
          completedRef.current = true;
          setCompleted(true);
        }
      })
      .catch(() => {
        // Heartbeats are best-effort; the next tick retries.
      });
  }, [courseId, lessonId]);

  useEffect(() => {
    const t = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(t);
  }, [sendHeartbeat]);

  function handleEnded() {
    sendHeartbeat();
  }

  if (error) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center rounded-card border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!tokenLoaded) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center gap-2 rounded-card border border-dashed border-border bg-surface text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading video...
      </div>
    );
  }

  return (
    <div>
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        tokens={{ playback: token ?? undefined }}
        accentColor="#683290"
        className="w-full rounded-card overflow-hidden"
        onEnded={handleEnded}
        onError={() => setError("Could not play this video. Please try again.")}
      />

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        {completed && (
          <span className="inline-flex items-center gap-2 rounded-card bg-emerald-600 px-4 py-2 text-[13px] font-medium text-white">
            <CheckCircle className="h-4 w-4" /> Lesson complete
          </span>
        )}
        {completed && nextLessonHref && (
          <a
            href={nextLessonHref}
            className="inline-flex items-center gap-2 rounded-card bg-[#4451A2] px-5 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-[#39458e]"
          >
            Continue to next lesson
          </a>
        )}
        {!completed && (
          <span className="inline-flex items-center gap-2 text-[13px] text-text-secondary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Watching updates your progress
          </span>
        )}
      </div>
    </div>
  );
}
