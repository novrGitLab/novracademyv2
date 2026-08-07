"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ExternalLink, Users, Video } from "lucide-react";
import { Badge, Button, Card } from "@/components/DesignSystem";
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
    <Card hover className="group p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold leading-snug text-[#1A1A2E] transition-colors group-hover:text-[#4451A2]">{event.title}</h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#666666]">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-[#683290]" />
            {new Date(event.startAt).toLocaleString()} · Hosted by {event.host.name ?? event.host.email}
          </p>
        </div>
        {isOwner && (
          <form action={deleteEventAction.bind(null, event.id)}>
            <button type="submit" className="text-xs font-medium text-[#E82027] opacity-80 transition-opacity hover:opacity-100 hover:underline">
              Delete
            </button>
          </form>
        )}
      </div>

      {event.description && <p className="mt-4 text-sm leading-6 text-[#666666]">{event.description}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant={isFull ? "red" : "blue"}>
          <Users aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
          {event._count.rsvps} going{event.capacity ? ` / ${event.capacity}` : ""}
        </Badge>
        {isFull && <Badge variant="red">Full — join waitlist</Badge>}
        {status === "GOING" && <Badge variant="success">RSVP confirmed</Badge>}
        {status === "WAITLIST" && <Badge variant="purple">On the waitlist</Badge>}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          onClick={handleRsvp}
          disabled={pending}
          loading={pending}
          variant={status === "GOING" || status === "WAITLIST" ? "secondary" : "purple"}
          size="sm"
        >
          {status === "GOING" ? "Cancel RSVP" : status === "WAITLIST" ? "Leave waitlist" : isFull ? "Join waitlist" : "RSVP"}
        </Button>
        {event.meetingUrl && (status === "GOING") && (
          <Button href={event.meetingUrl} variant="secondary" size="sm">
            <Video aria-hidden="true" className="h-4 w-4" /> Join meeting <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        )}
        {event.recordingUrl && (
          <Button type="button" onClick={handleViewRecording} variant="secondary" size="sm">Watch recording</Button>
        )}
      </div>

      {recordingUrl && (
        <video src={recordingUrl} controls className="mt-3 w-full rounded-card" />
      )}
    </Card>
  );
}
