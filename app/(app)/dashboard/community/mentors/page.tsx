import Link from "next/link";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
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
  REQUESTED: "bg-surface text-text-secondary",
  ACCEPTED: "bg-success-light text-success",
  DECLINED: "bg-red-light text-red",
  COMPLETED: "bg-purple-light text-purple",
  CANCELLED: "bg-surface text-text-secondary",
};

export default async function MentorsPage() {
  const [{ mentors }, myProfile, sessions] = await Promise.all([
    getMentorsAction(),
    getMyMentorProfileAction(),
    getMySessionsAction(),
  ]);

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/community" className="text-[13px] text-text-secondary hover:text-purple">
        ← Community
      </Link>
      <h1 className="mt-2 text-[24px] font-semibold text-text-primary">Mentors</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Give back by mentoring, or find someone to help you grow. No payment involved — this is a community give-back.
      </p>

      <details className="mt-6 rounded-card border border-border bg-surface p-4">
        <summary className="cursor-pointer text-[15px] font-medium text-text-primary">
          {myProfile?.isActive ? "Update your mentor profile" : "Become a mentor"}
        </summary>
        <form action={saveMentorProfileAction} className="mt-4 space-y-3">
          <input
            name="topics"
            defaultValue={myProfile?.topics.join(", ")}
            placeholder="Topics (comma-separated, e.g. Leadership, Sales)"
            className="w-full rounded-card border border-border bg-background px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          />
          <input
            name="availability"
            defaultValue={myProfile?.availability ?? ""}
            placeholder="Availability (e.g. Weekday evenings)"
            className="w-full rounded-card border border-border bg-background px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          />
          <input
            name="capacityPerMonth"
            type="number"
            defaultValue={myProfile?.capacityPerMonth ?? 4}
            placeholder="Sessions per month"
            className="w-40 rounded-card border border-border bg-background px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          />
          <label className="flex items-center gap-2 text-[15px] text-text-primary">
            <input type="checkbox" name="isActive" defaultChecked={myProfile?.isActive ?? true} className="h-4 w-4" />
            Listed in the mentor directory
          </label>
          <button type="submit" className="rounded-card bg-purple px-4 py-2 text-[15px] font-medium text-white hover:bg-purple/90">
            Save
          </button>
        </form>
      </details>

      <h2 className="mt-8 text-[18px] font-semibold text-text-primary">Directory</h2>
      <div className="mt-3 space-y-3">
        {mentors.map((m) => (
          <div key={m.userId} className="rounded-card border border-border bg-background p-4">
            <p className="text-[15px] font-medium text-text-primary">{m.user.name ?? m.user.email}</p>
            {m.user.bio && <p className="mt-1 text-[13px] text-text-secondary">{m.user.bio}</p>}
            <div className="mt-2 flex flex-wrap gap-1">
              {m.topics.map((t) => (
                <span key={t} className="rounded-pill bg-purple-light px-2 py-1 text-[13px] text-purple">
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[13px] text-text-secondary">
              {m.bookedThisMonth}/{m.capacityPerMonth} sessions this month
              {m.availability ? ` · ${m.availability}` : ""}
            </p>
            <RequestSessionForm mentorId={m.userId} />
          </div>
        ))}
        {mentors.length === 0 && (
          <EmptyState icon={Users} title="No mentors listed yet" description="Be the first — set up your mentor profile above." />
        )}
      </div>

      <h2 className="mt-8 text-[18px] font-semibold text-text-primary">Session requests (as mentor)</h2>
      <div className="mt-3 space-y-2">
        {sessions.asMentor.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3">
            <div>
              <p className="text-[15px] text-text-primary">{s.topic}</p>
              <p className="text-[13px] text-text-secondary">with {s.mentee.name ?? s.mentee.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-pill px-2 py-1 text-[13px] ${statusStyles[s.status]}`}>{s.status}</span>
              {s.status === "REQUESTED" && (
                <>
                  <form action={respondToSessionAction.bind(null, s.id, true)}>
                    <button type="submit" className="text-[13px] text-success hover:underline">
                      Accept
                    </button>
                  </form>
                  <form action={respondToSessionAction.bind(null, s.id, false)}>
                    <button type="submit" className="text-[13px] text-red hover:underline">
                      Decline
                    </button>
                  </form>
                </>
              )}
              {s.status === "ACCEPTED" && (
                <form action={completeSessionAction.bind(null, s.id, undefined)}>
                  <button type="submit" className="text-[13px] text-purple hover:underline">
                    Mark complete
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        {sessions.asMentor.length === 0 && <p className="text-[13px] text-text-secondary">No requests yet.</p>}
      </div>

      <h2 className="mt-8 text-[18px] font-semibold text-text-primary">Your requests (as mentee)</h2>
      <div className="mt-3 space-y-2">
        {sessions.asMentee.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3">
            <div>
              <p className="text-[15px] text-text-primary">{s.topic}</p>
              <p className="text-[13px] text-text-secondary">with {s.mentor.name ?? s.mentor.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-pill px-2 py-1 text-[13px] ${statusStyles[s.status]}`}>{s.status}</span>
              {(s.status === "REQUESTED" || s.status === "ACCEPTED") && (
                <form action={cancelSessionAction.bind(null, s.id)}>
                  <button type="submit" className="text-[13px] text-red hover:underline">
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        {sessions.asMentee.length === 0 && <p className="text-[13px] text-text-secondary">No requests yet.</p>}
      </div>
    </div>
  );
}
