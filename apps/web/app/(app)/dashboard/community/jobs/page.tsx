import Link from "next/link";
import { getServerSession } from "next-auth";
import { Briefcase } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { getJobListingsAction, postJobAction, setOpenToWorkAction } from "./actions";

const locationLabels: Record<string, string> = { REMOTE: "Remote", ONSITE: "On-site", HYBRID: "Hybrid" };

export default async function JobBoardPage() {
  const session = await getServerSession(authOptions);
  const { listings } = await getJobListingsAction();

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/community" className="text-[13px] text-text-secondary hover:text-purple">
        ← Community
      </Link>
      <h1 className="mt-2 text-[24px] font-semibold text-text-primary">Job board</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Opportunities posted by admins and alumni. New listings need admin approval before they're visible here.
      </p>

      <form action={setOpenToWorkAction.bind(null, true, session!.user.id)} className="mt-4 inline-block">
        <button type="submit" className="rounded-card border border-purple px-3 py-1.5 text-[13px] font-medium text-purple hover:bg-purple-light">
          Mark myself "open to work"
        </button>
      </form>
      <form action={setOpenToWorkAction.bind(null, false, session!.user.id)} className="mt-4 ml-2 inline-block">
        <button type="submit" className="rounded-card border border-border px-3 py-1.5 text-[13px] text-text-secondary hover:border-red hover:text-red">
          Not looking
        </button>
      </form>

      <details className="mt-6 rounded-card border border-dashed border-border p-4">
        <summary className="cursor-pointer text-[13px] font-medium text-text-secondary">Post an opportunity</summary>
        <form action={postJobAction} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="title"
              required
              placeholder="Role title"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
            />
            <input
              name="company"
              required
              placeholder="Company"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              name="locationType"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
            >
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
            </select>
            <input
              name="location"
              placeholder="Location (e.g. Lagos, NG)"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
            />
          </div>
          <input
            name="link"
            type="url"
            placeholder="Application link"
            className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="Description"
            className="w-full resize-none rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
          />
          <button type="submit" className="rounded-card bg-purple px-4 py-2 text-[15px] font-medium text-white hover:bg-purple/90">
            Submit for approval
          </button>
        </form>
      </details>

      <div className="mt-6 space-y-3">
        {listings.map((job) => (
          <div key={job.id} className="rounded-card border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-medium text-text-primary">
                {job.isFeatured && "⭐ "}
                {job.title} · {job.company}
              </p>
              <span className="rounded-pill bg-purple-light px-2 py-1 text-[13px] text-purple">
                {locationLabels[job.locationType]}
                {job.location ? ` · ${job.location}` : ""}
              </span>
            </div>
            {job.description && <p className="mt-2 text-[15px] text-text-secondary">{job.description}</p>}
            {job.link && (
              <a href={job.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[13px] text-purple hover:underline">
                Apply →
              </a>
            )}
          </div>
        ))}
        {listings.length === 0 && (
          <EmptyState icon={Briefcase} title="No open opportunities right now" description="Check back soon, or post one above." />
        )}
      </div>
    </div>
  );
}
