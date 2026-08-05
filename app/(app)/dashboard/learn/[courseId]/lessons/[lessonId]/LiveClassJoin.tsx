"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import { getLiveRecordingUrlAction, joinLiveClassAction, setLiveRsvpAction } from "./actions";

export function LiveClassJoin({
  courseId,
  lessonId,
  liveScheduledAt,
  hasRoom,
  hasRecording,
  initialCompleted,
  nextLessonHref,
}: {
  courseId: string;
  lessonId: string;
  liveScheduledAt: string | null;
  hasRoom: boolean;
  hasRecording: boolean;
  initialCompleted: boolean;
  nextLessonHref: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [joined, setJoined] = useState(false);
  const [rsvp, setRsvp] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  async function handleRsvp(going: boolean) {
    setError(null);
    try {
      await setLiveRsvpAction(courseId, lessonId, going);
      setRsvp(going);
    } catch {
      setError("Could not save your RSVP");
    }
  }

  async function handleJoin() {
    setError(null);
    const outcome = await joinLiveClassAction(courseId, lessonId);
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    if (!containerRef.current) return;

    const call = DailyIframe.createFrame(containerRef.current, {
      showLeaveButton: true,
      iframeStyle: { width: "100%", height: "480px", border: "0" },
    });
    callRef.current = call;
    await call.join({ url: outcome.roomUrl, token: outcome.token });
    setJoined(true);
  }

  async function handleViewRecording() {
    setError(null);
    const outcome = await getLiveRecordingUrlAction(courseId, lessonId);
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setRecordingUrl(outcome.url);
  }

  return (
    <div>
      {liveScheduledAt && (
        <p className="text-[15px] text-text-secondary">
          Scheduled for {new Date(liveScheduledAt).toLocaleString()}
        </p>
      )}

      {!joined && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleRsvp(true)}
            className={`rounded-card px-4 py-2 text-[15px] font-medium ${
              rsvp === true ? "bg-blue text-white" : "border border-blue text-blue hover:bg-blue-light"
            }`}
          >
            I'm going
          </button>
          <button
            type="button"
            onClick={() => handleRsvp(false)}
            className={`rounded-card px-4 py-2 text-[15px] font-medium ${
              rsvp === false ? "bg-surface text-text-secondary" : "border border-border text-text-secondary hover:bg-surface"
            }`}
          >
            Can't make it
          </button>

          {hasRoom && (
            <button
              type="button"
              onClick={handleJoin}
              className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
            >
              Join live class
            </button>
          )}

          {hasRecording && (
            <button
              type="button"
              onClick={handleViewRecording}
              className="rounded-card border border-blue px-4 py-2 text-[15px] font-medium text-blue hover:bg-blue-light"
            >
              Watch recording
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-3 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}

      {recordingUrl && (
        <video controls src={recordingUrl} className="mt-4 w-full rounded-card" />
      )}

      <div ref={containerRef} className="mt-4" />

      {(initialCompleted || joined) && nextLessonHref && (
        <Link
          href={nextLessonHref}
          className="mt-4 inline-block rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
        >
          Next lesson →
        </Link>
      )}
    </div>
  );
}
