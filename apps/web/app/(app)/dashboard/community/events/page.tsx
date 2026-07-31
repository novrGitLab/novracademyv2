import Link from "next/link";
import { getServerSession } from "next-auth";
import { Calendar } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { createEventAction, getEventsAction, getMyRsvpAction } from "./actions";
import { EventCard } from "./EventCard";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  const { events } = await getEventsAction();

  const rsvpStatuses = await Promise.all(
    events.map((e) => getMyRsvpAction(e.id).then((r) => [e.id, r?.status ?? null] as const))
  );
  const rsvpByEvent = new Map(rsvpStatuses);

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/community" className="text-[13px] text-text-secondary hover:text-purple">
        ← Community
      </Link>
      <h1 className="mt-2 text-[24px] font-semibold text-text-primary">Events & webinars</h1>

      <details className="mt-6 rounded-card border border-dashed border-border p-4">
        <summary className="cursor-pointer text-[13px] font-medium text-text-secondary">Create an event</summary>
        <form action={createEventAction} className="mt-4 space-y-3">
          <input
            name="title"
            required
            placeholder="Title"
            className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          />
          <textarea
            name="description"
            rows={2}
            placeholder="Description"
            className="w-full resize-none rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="startAt"
              type="datetime-local"
              required
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
            />
            <input
              name="capacity"
              type="number"
              placeholder="Capacity (optional)"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
            />
          </div>
          <input
            name="meetingUrl"
            type="url"
            placeholder="Zoom / Meet link"
            className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          />
          <button type="submit" className="rounded-card bg-purple px-4 py-2 text-[15px] font-medium text-white hover:bg-purple/90">
            Create event
          </button>
        </form>
      </details>

      <div className="mt-6 space-y-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            initialRsvpStatus={rsvpByEvent.get(event.id) ?? null}
            isOwner={event.host.id === session!.user.id}
          />
        ))}
        {events.length === 0 && (
          <EmptyState icon={Calendar} title="No events scheduled yet" description="Create one above to get the community together." />
        )}
      </div>
    </div>
  );
}
