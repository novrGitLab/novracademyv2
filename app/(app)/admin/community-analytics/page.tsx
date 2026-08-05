"use client";

import { useApi } from "@/lib/useApi";
import { StatCardsSkeleton } from "@/components/Skeleton";
import { StatCard } from "../StatCard";

interface CommunityAnalytics {
  dailyActiveMembers: number;
  weeklyActiveMembers: number;
  topChannels: { id: string; name: string; _count: { members: number; posts: number } }[];
  topContributors: { user: { id: string; name: string | null; email: string } | undefined; posts: number }[];
  events: { totalEvents: number; totalRsvps: number };
  jobs: { total: number; approved: number };
  mentoring: { completedSessions: number; avgRating: number | null };
  inactiveMembers: number;
}

const empty: CommunityAnalytics = {
  dailyActiveMembers: 0,
  weeklyActiveMembers: 0,
  topChannels: [],
  topContributors: [],
  events: { totalEvents: 0, totalRsvps: 0 },
  jobs: { total: 0, approved: 0 },
  mentoring: { completedSessions: 0, avgRating: null },
  inactiveMembers: 0,
};

export default function CommunityAnalyticsPage() {
  const { data, loading } = useApi<CommunityAnalytics>("/analytics/community", empty);

  return (
    <div className="max-w-3xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Community analytics</h1>

      <div className="mt-6">
        {loading ? (
          <StatCardsSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Daily active members" value={data.dailyActiveMembers} />
            <StatCard label="Weekly active members" value={data.weeklyActiveMembers} />
            <StatCard label="Members with zero activity" value={data.inactiveMembers} />
            <StatCard label="Event RSVPs (going)" value={data.events.totalRsvps} sublabel={`${data.events.totalEvents} events total`} />
            <StatCard label="Job listings approved" value={data.jobs.approved} sublabel={`${data.jobs.total} total submitted`} />
            <StatCard
              label="Mentoring sessions completed"
              value={data.mentoring.completedSessions}
              sublabel={data.mentoring.avgRating ? `${data.mentoring.avgRating.toFixed(1)}★ avg rating` : "No ratings yet"}
            />
          </div>
        )}
      </div>

      {!loading && (
        <>
          <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Most active channels</h2>
          <div className="mt-3 space-y-2">
            {data.topChannels.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3">
                <span className="text-[15px] text-text-primary"># {g.name}</span>
                <span className="text-[13px] text-text-secondary">{g._count.members} members · {g._count.posts} posts</span>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Top contributors</h2>
          <div className="mt-3 space-y-2">
            {data.topContributors.map((c, i) => (
              <div key={c.user?.id ?? i} className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3">
                <span className="text-[15px] text-text-primary">{c.user?.name ?? c.user?.email ?? "Unknown"}</span>
                <span className="text-[13px] text-text-secondary">{c.posts} posts</span>
              </div>
            ))}
            {data.topContributors.length === 0 && <p className="text-[13px] text-text-secondary">No posts yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
