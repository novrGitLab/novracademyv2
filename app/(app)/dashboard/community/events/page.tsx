import { getServerSession } from "next-auth";
import { Calendar } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { BackLink, Button, Card, EmptyState, Input, PageHeader, Textarea } from "@/components/DesignSystem";
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
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />
      <PageHeader
        title="Events & Webinars"
        description="Join live sessions, workshops, and community events."
        className="mb-7"
      />

      <Card padding="none" className="mb-7 overflow-hidden">
        <details>
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[#1A1A2E] marker:hidden hover:bg-[#F8F9FB] sm:px-6">
            <span className="flex items-center justify-between gap-4">
              Create an event
              <span className="text-xs font-normal text-[#767782]">For the community</span>
            </span>
          </summary>
          <form action={createEventAction} className="border-t border-[#E5E5E5] bg-[#F8F9FB]/60 p-5 sm:p-6">
            <div className="space-y-4">
              <Input name="title" required label="Event title" placeholder="e.g. Intro to threat modelling" />
              <Textarea name="description" label="Description" rows={3} placeholder="What will attendees learn or experience?" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="startAt" type="datetime-local" required label="Date and time" />
                <Input name="capacity" type="number" min="1" label="Capacity" placeholder="Optional" />
              </div>
              <Input name="meetingUrl" type="url" label="Meeting link" placeholder="https://zoom.us/..." />
              <Button type="submit" variant="purple">Create Event</Button>
            </div>
          </form>
        </details>
      </Card>

      <section aria-label="Upcoming events" className="space-y-4">
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
      </section>
    </main>
  );
}
