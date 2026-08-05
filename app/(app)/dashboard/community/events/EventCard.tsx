"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelRsvpAction,
  deleteEventAction,
  getRecordingUrlAction,
  rsvpAction,
  type EventListing,
} from "./actions";

export function EventCard({
  event,
  initialRsvpStatus,
  isOwner,
}: {
  event: EventListing;
  initialRsvpStatus: string | null;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialRsvpStatus);
  const [pending, setPending] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  async function handleRsvp() {
    setPending(true);
    if (status === "GOING" || status === "WAITLIST") {
      await cancelRsvpAction(event.id);
      setStatus(null);
    } else {
      await rsvpAction(event.id);
      setStatus("GOING");
    }
    setPending(false);
    router.refresh();
  }

  async function handleViewRecording() {
    const { url } = await getRecordingUrlAction(event.id);
    setRecordingUrl(url);
  }

  const isFull = event.capacity != null && event._count.rsvps >= event.capacity;

  return (
    <div className="rounded-card border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-medium text-text-primary">{event.title}</p>
          <p className="text-[13px] text-text-secondary">
            {new Date(event.startAt).toLocaleString()} · Hosted by {event.host.name ?? event.host.email}
          </p>
        </div>
        {isOwner && (
          <form action={deleteEventAction.bind(null, event.id)}>
            <button type="submit" className="text-[13px] text-red hover:underline">
              Delete
            </button>
          </form>
        )}
      </div>

      {event.description && <p className="mt-2 text-[15px] text-text-secondary">{event.description}</p>}

      <p className="mt-2 text-[13px] text-text-secondary">
        {event._count.rsvps} going{event.capacity ? ` / ${event.capacity} capacity` : ""}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleRsvp}
          disabled={pending}
          className={
            status === "GOING" || status === "WAITLIST"
              ? "rounded-card border border-border px-3 py-1.5 text-[13px] text-text-secondary hover:border-red hover:text-red disabled:opacity-50"
              : "rounded-card bg-purple px-3 py-1.5 text-[13px] font-medium text-white hover:bg-purple/90 disabled:opacity-50"
          }
        >
          {status === "GOING" ? "Cancel RSVP" : status === "WAITLIST" ? "Leave waitlist" : isFull ? "Join waitlist" : "RSVP"}
        </button>
        {status === "WAITLIST" && <span className="text-[13px] text-text-secondary">You're on the waitlist</span>}
        {event.meetingUrl && (status === "GOING") && (
          <a href={event.meetingUrl} target="_blank" rel="noreferrer" className="text-[13px] text-purple hover:underline">
            Join link →
          </a>
        )}
        {event.recordingUrl && (
          <button type="button" onClick={handleViewRecording} className="text-[13px] text-purple hover:underline">
            Watch recording →
          </button>
        )}
      </div>

      {recordingUrl && (
        <video src={recordingUrl} controls className="mt-3 w-full rounded-card" />
      )}
    </div>
  );
}
