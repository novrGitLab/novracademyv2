"use client";

import { Briefcase } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { deleteJobAdminAction, setJobFeaturedAction, setJobStatusAction } from "./actions";

interface JobListing {
  id: string;
  title: string;
  company: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  isFeatured: boolean;
  postedBy: { name: string | null; email: string };
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-surface text-text-secondary",
  APPROVED: "bg-success-light text-success",
  REJECTED: "bg-red-light text-red",
  EXPIRED: "bg-surface text-text-secondary",
};

export default function AdminJobsPage() {
  const { data, loading, refetch } = useApi<{ listings: JobListing[] }>("/jobs", { listings: [] });
  const listings = data.listings;

  async function run(action: () => Promise<unknown>) {
    await action();
    refetch();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Job board moderation</h1>
      <p className="mt-1 text-[15px] text-text-secondary">Approve, reject, or feature listings.</p>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton />
        ) : listings.length === 0 ? (
          <EmptyState icon={Briefcase} title="No listings yet" description="Approved job posts from admins and alumni will appear here." />
        ) : (
          <div className="overflow-hidden rounded-card border border-border">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-surface text-[13px] text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Listing</th>
                  <th className="px-4 py-3 font-medium">Posted by</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {listings.map((job) => (
                  <tr key={job.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {job.isFeatured && "⭐ "}
                      {job.title} · {job.company}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{job.postedBy.name ?? job.postedBy.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-pill px-2 py-1 text-[13px] ${statusStyles[job.status]}`}>{job.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 text-[13px]">
                        {job.status !== "APPROVED" && (
                          <button
                            onClick={() => run(() => setJobStatusAction(job.id, "APPROVED"))}
                            className="text-success hover:underline"
                          >
                            Approve
                          </button>
                        )}
                        {job.status !== "REJECTED" && (
                          <button
                            onClick={() => run(() => setJobStatusAction(job.id, "REJECTED"))}
                            className="text-red hover:underline"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => run(() => setJobFeaturedAction(job.id, !job.isFeatured))}
                          className="text-blue hover:underline"
                        >
                          {job.isFeatured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          onClick={() => run(() => deleteJobAdminAction(job.id))}
                          className="text-text-secondary hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
