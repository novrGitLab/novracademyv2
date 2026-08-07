"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import { sendHeartbeatAction } from "./actions";

const HEARTBEAT_INTERVAL_MS = 5000;
const SEEK_BUFFER_SECONDS = 5;

interface MuxPlayerElement extends HTMLElement {
  currentTime: number;
  duration: number;
  paused: boolean;
}

export function LessonPlayer({
  courseId,
  lessonId,
  playbackId,
  token,
  minWatchPct,
  resumeFrom,
  allowForwardScrub,
  initialCompleted,
  nextLessonHref,
}: {
  courseId: string;
  lessonId: string;
  playbackId: string;
  token: string;
  minWatchPct: number;
  resumeFrom: number;
  allowForwardScrub: boolean;
  initialCompleted: boolean;
  nextLessonHref: string | null;
}) {
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const maxReachedRef = useRef(resumeFrom);
  const [watchPct, setWatchPct] = useState(initialCompleted ? 100 : 0);
  const [completed, setCompleted] = useState(initialCompleted);

  // Server-enforced no-skip, layer 2: even though the API rejects
  // implausible position jumps, we also snap the player back client-side
  // so a learner can't sit on a skipped-ahead frame between heartbeats.
  useEffect(() => {
    const player = playerRef.current;
    if (!player || allowForwardScrub) return;

    const onSeeking = () => {
      if (player.currentTime > maxReachedRef.current + SEEK_BUFFER_SECONDS) {
        player.currentTime = maxReachedRef.current;
      }
    };
    player.addEventListener("seeking", onSeeking);
    return () => player.removeEventListener("seeking", onSeeking);
  }, [allowForwardScrub]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const player = playerRef.current;
      if (!player || player.paused) return;

      const position = player.currentTime ?? 0;
      const duration = player.duration ?? 0;
      if (!duration || Number.isNaN(duration)) return;

      maxReachedRef.current = Math.max(maxReachedRef.current, position);

      try {
        const result = await sendHeartbeatAction(courseId, lessonId, Math.floor(position), Math.floor(duration));
        setWatchPct(result.watchPct);
        setCompleted(result.completed);
      } catch {
        // Transient network/API error — the next heartbeat will retry.
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [courseId, lessonId]);

  return (
    <div>
      <MuxPlayer
        ref={playerRef as never}
        playbackId={playbackId}
        tokens={{ playback: token }}
        streamType="on-demand"
        currentTime={resumeFrom}
        accentColor="#2563EB"
        className="w-full rounded-card"
      />

      <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-surface">
        <div className="h-full bg-[#4451A2] transition-all" style={{ width: `${Math.min(100, watchPct)}%` }} />
      </div>
      <p className="mt-1 text-[13px] text-text-secondary">
        {Math.round(watchPct)}% watched · need {minWatchPct}% to unlock the next lesson
      </p>

      {nextLessonHref &&
        (completed ? (
          <Link
            href={nextLessonHref}
            className="mt-4 inline-block rounded-card bg-[#4451A2] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#39458e]"
          >
            Next lesson →
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-4 cursor-not-allowed rounded-card bg-surface px-4 py-2 text-[15px] font-medium text-text-secondary"
          >
            Next lesson (locked)
          </button>
        ))}
    </div>
  );
}
