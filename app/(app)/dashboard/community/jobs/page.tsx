import Link from "next/link";
import { getServerSession } from "next-auth";
import { Briefcase } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { BackLink, Badge, Button, Card, EmptyState, Input, PageHeader, Textarea } from "@/components/DesignSystem";
import { getJobListingsAction, postJobAction, setOpenToWorkAction } from "./actions";

const locationLabels: Record<string, string> = { REMOTE: "Remote", ONSITE: "On-site", HYBRID: "Hybrid" };

export default async function JobBoardPage() {
  const session = await getServerSession(authOptions);
  const { listings } = await getJobListingsAction();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />
      <PageHeader title="Job Board" description="Opportunities posted by admins and alumni." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form action={setOpenToWorkAction.bind(null, true, session!.user.id)}>
          <Button type="submit" variant="secondary" className="w-full border-[#683290] text-[#683290] hover:bg-[#683290]/5 sm:w-auto">
            Mark myself open to work
          </Button>
        </form>
        <form action={setOpenToWorkAction.bind(null, false, session!.user.id)}>
          <Button type="submit" variant="secondary" className="w-full border-[#E82027] text-[#E82027] hover:bg-[#E82027]/5 sm:w-auto">
            Not looking
          </Button>
        </form>
      </div>

      <details className="mt-8 overflow-hidden rounded-[8px] border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-[#1A1A2E] marker:text-[#683290]">
          Post an opportunity
        </summary>
        <Card padding="none" className="rounded-none border-0 border-t border-[#E5E5E5] shadow-none">
          <form action={postJobAction} className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="title" required label="Role title" placeholder="e.g. Product Designer" />
              <Input name="company" required label="Company" placeholder="e.g. Cybernovr" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="locationType" className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">Location type</label>
                <select id="locationType" name="locationType" className="w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm text-[#1A1A2E] outline-none transition-colors focus:border-[#4451A2] focus:ring-2 focus:ring-[#4451A2]/15">
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <Input name="location" label="Location" placeholder="e.g. Lagos, NG" />
            </div>
            <Input name="link" type="url" label="Application link" placeholder="https://..." />
            <Textarea name="description" label="Description" rows={3} placeholder="Tell the community about this opportunity" />
            <Button type="submit" variant="purple">Submit for approval</Button>
          </form>
        </Card>
      </details>

      <div className="mt-8 space-y-4">
        {listings.map((job) => (
          <Card key={job.id} hover className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1A1A2E]">
                  {job.isFeatured && <span aria-label="Featured" title="Featured">⭐ </span>}
                  {job.title}
                </h2>
                <p className="mt-1 text-sm text-[#666666]">{job.company}</p>
              </div>
              <Badge variant="purple" className="w-fit">
                {locationLabels[job.locationType]}
                {job.location ? ` · ${job.location}` : ""}
              </Badge>
            </div>
            {job.description && <p className="mt-4 text-sm leading-6 text-[#666666]">{job.description}</p>}
            {job.link && (
              <Link href={job.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-medium text-[#4451A2] hover:underline">
                Apply <span aria-hidden="true" className="ml-1">→</span>
              </Link>
            )}
          </Card>
        ))}
        {listings.length === 0 && (
          <EmptyState icon={Briefcase} title="No open opportunities right now" description="Check back soon, or post one above." />
        )}
      </div>
    </div>
  );
}
