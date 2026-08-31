import { Users } from "lucide-react";
import { Badge, BackLink, Button, Card, EmptyState, Input, PageHeader, SectionHeader } from "@/components/DesignSystem";
import {
  cancelSessionAction,
  completeSessionAction,
  getMentorsAction,
  getMyMentorProfileAction,
  getMySessionsAction,
  respondToSessionAction,
  saveMentorProfileAction,
} from "./actions";
import { RequestSessionForm } from "./RequestSessionForm";

const statusStyles: Record<string, string> = {
  REQUESTED: "border-[#4451A2]/20 bg-[#4451A2]/10 text-[#4451A2]",
  ACCEPTED: "border-emerald-600/20 bg-emerald-50 text-emerald-700",
  DECLINED: "border-[#E82027]/20 bg-[#E82027]/10 text-[#E82027]",
  COMPLETED: "border-[#683290]/20 bg-[#683290]/10 text-[#683290]",
  CANCELLED: "border-[#E82027]/20 bg-[#E82027]/10 text-[#E82027]",
};

export default async function MentorsPage() {
  const [{ mentors }, myProfile, sessions] = await Promise.all([
    getMentorsAction(),
    getMyMentorProfileAction(),
    getMySessionsAction(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-3" />
      <PageHeader
        title="Mentors"
        description="Give back by mentoring, or find someone to help you grow."
      />

      <Card padding="none" className="overflow-hidden">
        <details>
          <summary className="cursor-pointer list-inside px-5 py-4 text-sm font-semibold text-[#1A1A2E] marker:text-[#683290]">
            {myProfile?.isActive ? "Update your mentor profile" : "Become a mentor"}
          </summary>
          <form action={saveMentorProfileAction} className="space-y-4 border-t border-[#E5E5E5] px-5 py-5">
            <Input
              id="mentor-topics"
              name="topics"
              label="Topics"
              defaultValue={myProfile?.topics.join(", ")}
              placeholder="e.g. Leadership, Sales"
              hint="Separate multiple topics with commas."
            />
            <Input
              id="mentor-availability"
              name="availability"
              label="Availability"
              defaultValue={myProfile?.availability ?? ""}
              placeholder="e.g. Weekday evenings"
            />
            <Input
              id="mentor-capacity"
              name="capacityPerMonth"
              type="number"
              label="Sessions per month"
              defaultValue={myProfile?.capacityPerMonth ?? 4}
              className="max-w-40"
            />
            <label className="flex items-center gap-2 text-sm text-[#1A1A2E]">
              <input type="checkbox" name="isActive" defaultChecked={myProfile?.isActive ?? true} className="h-4 w-4 accent-[#683290]" />
              Listed in the mentor directory
            </label>
            <Button type="submit" variant="purple">Save</Button>
          </form>
        </details>
      </Card>

      <section className="mt-10">
        <SectionHeader title="Mentor directory" description="Find someone with experience in the area you want to grow." />
        <div className="mt-4 space-y-4">
          {mentors.map((m) => (
            <Card key={m.userId} hover className="transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-[#1A1A2E]">{m.user.name ?? m.user.email}</p>
                  {m.user.bio && <p className="mt-1 text-sm leading-5 text-[#666666]">{m.user.bio}</p>}
                </div>
                <p className="shrink-0 text-xs font-medium text-[#767782]">
                  {m.bookedThisMonth}/{m.capacityPerMonth} sessions this month
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {m.topics.map((topic) => <Badge key={topic} variant="purple">{topic}</Badge>)}
              </div>
              {m.availability && <p className="mt-3 text-xs text-[#666666]">Available: {m.availability}</p>}
              <RequestSessionForm mentorId={m.userId} />
            </Card>
          ))}
          {mentors.length === 0 && (
            <EmptyState icon={<Users aria-hidden="true" className="h-6 w-6" />} title="No mentors listed yet" description="Be the first — set up your mentor profile above." />
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Session requests" description="Requests from members who want your guidance." />
        <div className="mt-4 space-y-3">
          {sessions.asMentor.map((s) => (
            <Card key={s.id} padding="md" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[#1A1A2E]">{s.topic}</p>
                <p className="mt-1 text-sm text-[#666666]">Mentee: {s.mentee.name ?? s.mentee.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusStyles[s.status]}>{s.status.replace(/_/g, " ")}</Badge>
                {s.status === "REQUESTED" && (
                  <>
                    <form action={respondToSessionAction.bind(null, s.id, true)}><Button type="submit" size="sm">Accept</Button></form>
                    <form action={respondToSessionAction.bind(null, s.id, false)}><Button type="submit" size="sm" variant="danger">Decline</Button></form>
                  </>
                )}
                {s.status === "ACCEPTED" && (
                  <form action={completeSessionAction.bind(null, s.id, undefined)}><Button type="submit" size="sm" variant="purple">Mark complete</Button></form>
                )}
              </div>
            </Card>
          ))}
          {sessions.asMentor.length === 0 && <p className="text-sm text-[#666666]">No requests yet.</p>}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Your requests" description="Keep track of the mentoring sessions you have requested." />
        <div className="mt-4 space-y-3">
          {sessions.asMentee.map((s) => (
            <Card key={s.id} padding="md" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[#1A1A2E]">{s.topic}</p>
                <p className="mt-1 text-sm text-[#666666]">Mentor: {s.mentor.name ?? s.mentor.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusStyles[s.status]}>{s.status.replace(/_/g, " ")}</Badge>
                {(s.status === "REQUESTED" || s.status === "ACCEPTED") && (
                  <form action={cancelSessionAction.bind(null, s.id)}><Button type="submit" size="sm" variant="danger">Cancel</Button></form>
                )}
              </div>
            </Card>
          ))}
          {sessions.asMentee.length === 0 && <p className="text-sm text-[#666666]">No requests yet.</p>}
        </div>
      </section>
    </div>
  );
}
