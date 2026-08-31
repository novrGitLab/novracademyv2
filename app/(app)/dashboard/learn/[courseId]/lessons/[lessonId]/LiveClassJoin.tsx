"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarClock, Radio, Video, AlertTriangle, CheckCircle2, Loader2, Clock3 } from "lucide-react";
import { apiMutate } from "@/lib/useApi";
import { useToast } from "@/components/ui/toast-context";

interface LiveClassJoinProps {
  courseId: string;
  lessonId: string;
  liveScheduledAt: string | null;
  liveMeetingUrl: string | null;
  hasRecording: boolean;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function LiveClassJoin({ courseId, lessonId, liveScheduledAt, liveMeetingUrl, hasRecording }: LiveClassJoinProps) {
  const now = useNow();
  const { toast } = useToast();
  const [rsvp, setRsvp] = useState<boolean | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  const scheduledTime = liveScheduledAt ? new Date(liveScheduledAt).getTime() : null;
  const msUntil = scheduledTime ? scheduledTime - now : null;
  const minutesUntil = msUntil !== null ? Math.floor(msUntil / 60000) : null;
  const canJoin = scheduledTime !== null && scheduledTime - now <= 15 * 60 * 1000; // within 15 min of start
  const ended = msUntil !== null && msUntil < 0;

  async function handleRsvp(going: boolean) {
    setRsvpLoading(true);
    setError(null);
    try {
      const res = await apiMutate<{ going: boolean }>(`/courses/${courseId}/lessons/${lessonId}/live/rsvp`, "POST", { going });
      setRsvp(res.going);
      toast(res.going ? "You're going to this live class" : "RSVP updated", res.going ? "success" : "info");
    } catch (err) {
      setError((err as Error).message || "Could not update your RSVP. Please try again.");
    } finally {
      setRsvpLoading(false);
    }
  }

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      const res = await apiMutate<{ roomUrl: string; token: string }>(
        `/courses/${courseId}/lessons/${lessonId}/live/join`,
        "POST"
      );
      setRoomUrl(res.roomUrl);
      window.open(res.roomUrl, "_blank", "noopener,noreferrer");
      toast("Opening live class in a new tab");
    } catch (err) {
      setError((err as Error).message || "Could not join the live class. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-background p-6 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#683290]/10 text-[#683290]">
          <Radio className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-text-primary">Live Class</p>
          <p className="text-[13px] text-text-secondary">
            {liveScheduledAt ? formatDateTime(liveScheduledAt) : "To be scheduled"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {minutesUntil !== null && minutesUntil > 15 && (
          <div className="flex items-center gap-2 text-[13px] text-text-secondary">
            <Clock3 className="h-4 w-4" />
            Starts in <span className="font-semibold text-text-primary">{minutesUntil} minutes</span>
          </div>
        )}

        {canJoin && liveMeetingUrl && !ended && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="flex w-full items-center justify-center gap-2 rounded-card bg-[#683290] px-5 py-3 text-[14px] font-medium text-white shadow-card transition hover:bg-[#542573] disabled:opacity-50"
          >
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Joining...
              </>
            ) : (
              <>
                <Video className="h-4 w-4" /> Join Live Class
              </>
            )}
          </button>
        )}

        {ended && (
          <div className="flex items-center gap-2 rounded-card border border-border bg-surface px-4 py-3 text-[13px] text-text-secondary">
            <CalendarClock className="h-4 w-4" />
            This live class has ended.
          </div>
        )}

        {!liveMeetingUrl && !ended && (
          <p className="text-[13px] text-text-secondary">
            The host hasn&apos;t scheduled a room yet. Check back closer to the time.
          </p>
        )}

        {/* Recording */}
        {hasRecording && (
          <Link
            href={`/dashboard/learn/${courseId}/lessons/${lessonId}/recording`}
            className="flex w-full items-center justify-center gap-2 rounded-card border border-border bg-background px-5 py-3 text-[14px] font-medium text-text-primary shadow-card transition hover:bg-surface"
          >
            <Video className="h-4 w-4 text-[#683290]" /> View Recording
          </Link>
        )}
      </div>

      {/* RSVP */}
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[13px] text-text-secondary">Will you attend?</p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => handleRsvp(true)}
            disabled={rsvpLoading}
            className={`flex items-center gap-1.5 rounded-card border px-4 py-2 text-[13px] font-medium transition ${
              rsvp === true
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-border bg-background text-text-primary hover:bg-surface"
            }`}
          >
            {rsvp === true && <CheckCircle2 className="h-4 w-4" />}
            Going
          </button>
          <button
            onClick={() => handleRsvp(false)}
            disabled={rsvpLoading}
            className={`flex items-center gap-1.5 rounded-card border px-4 py-2 text-[13px] font-medium transition ${
              rsvp === false
                ? "border-[#E82027] bg-[#E82027]/10 text-[#E82027]"
                : "border-border bg-background text-text-primary hover:bg-surface"
            }`}
          >
            Can&apos;t make it
          </button>
        </div>
      </div>
    </div>
  );
}
