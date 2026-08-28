"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApi } from "@/lib/useApi";
import { TableSkeleton } from "@/components/Skeleton";
import { StatsRow } from "../AdminWidgets";
import { Building2, GraduationCap, TrendingUp, Users } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CourseHealth {
  courseId: string;
  title: string;
  enrollments: number;
  certificatesIssued: number;
  completionRatePct: number;
  avgProgressPct: number;
  avgQuizScorePct: number | null;
  health: "green" | "amber" | "red";
}

interface CohortPerformance {
  cohortId: string;
  name: string;
  members: number;
  avgProgressPct: number;
  certificatesEarned: number;
}

interface AssessmentAnalytics {
  monthlyTrend: { month: number; year: number; avgScore: number }[];
  topPerformers: { userId: string; name: string; avgScore: number }[];
  bottomPerformers: { userId: string; name: string; avgScore: number }[];
  growthLeaderboard: { userId: string; name: string; baselineScore: number; closingScore: number; growthRate: number }[];
}

const healthDot: Record<CourseHealth["health"], string> = {
  green: "bg-success",
  amber: "bg-yellow-500",
  red: "bg-red",
};

/* -------------------------------------------------------------------------- */
/*  Platform Analytics (Super Admin)                                           */
/* -------------------------------------------------------------------------- */

const tenantGrowth = [
  { month: "Jan", orgs: 32, insts: 14 },
  { month: "Feb", orgs: 35, insts: 16 },
  { month: "Mar", orgs: 38, insts: 17 },
  { month: "Apr", orgs: 40, insts: 19 },
  { month: "May", orgs: 43, insts: 21 },
  { month: "Jun", orgs: 47, insts: 23 },
];

const revenueData = [
  { month: "Jan", revenue: 620 },
  { month: "Feb", revenue: 680 },
  { month: "Mar", revenue: 710 },
  { month: "Apr", revenue: 750 },
  { month: "May", revenue: 800 },
  { month: "Jun", revenue: 845 },
];

function PlatformAnalytics() {
  const maxRevenue = Math.max(...revenueData.map((r) => r.revenue));

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Platform Analytics</h1>

      <StatsRow stats={[
        { label: "Total Tenants", value: 70 },
        { label: "Total Users", value: "14,285" },
        { label: "Monthly Revenue", value: "$845k", color: "purple" },
        { label: "Growth (MoM)", value: "+12%", color: "purple" },
      ]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tenant Growth */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Tenant Growth</h3>
          <div className="mt-4 flex items-end gap-2">
            {tenantGrowth.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-col items-center gap-0.5">
                  <div className="w-full rounded-t bg-[#683290]" style={{ height: `${(d.insts / 25) * 80}px` }} />
                  <div className="w-full rounded-t bg-[#F4ECF8]" style={{ height: `${(d.orgs / 50) * 80}px` }} />
                </div>
                <span className="text-[11px] text-[#9CA3AF]">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[12px] text-[#6B7280]"><span className="h-2 w-2 rounded-sm bg-[#F4ECF8]" />Orgs</span>
            <span className="flex items-center gap-1.5 text-[12px] text-[#6B7280]"><span className="h-2 w-2 rounded-sm bg-[#683290]" />Insts</span>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Revenue Trend ($k)</h3>
          <div className="mt-4 flex items-end gap-2">
            {revenueData.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-[#4451A2]" style={{ height: `${(d.revenue / maxRevenue) * 100}px` }} />
                <span className="text-[11px] text-[#9CA3AF]">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Engagement */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">User Engagement by Tenant Type</h3>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#683290]" />
              <span className="text-[14px] font-medium text-[#1A1A2E]">Organizations</span>
            </div>
            <p className="mt-2 text-[32px] font-bold tabular-nums text-[#1A1A2E]">8,260</p>
            <p className="text-[13px] text-[#6B7280]">active users across 47 tenants</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#2563EB]" />
              <span className="text-[14px] font-medium text-[#1A1A2E]">Institutions</span>
            </div>
            <p className="mt-2 text-[32px] font-bold tabular-nums text-[#1A1A2E]">6,025</p>
            <p className="text-[13px] text-[#6B7280]">active users across 23 tenants</p>
          </div>
        </div>
      </div>

      <AssessmentAnalyticsSection />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  LMS Analytics (Org Admin)                                                  */
/* -------------------------------------------------------------------------- */

function LmsAnalytics() {
  const { data: courseData, loading: coursesLoading } = useApi<{ courses: CourseHealth[] }>(
    "/analytics/lms/course-health",
    { courses: [] }
  );
  const { data: cohortData, loading: cohortsLoading } = useApi<{ cohorts: CohortPerformance[] }>(
    "/analytics/lms/cohort-performance",
    { cohorts: [] }
  );
  const { data: validity, loading: validityLoading } = useApi<{ in7d: number; in30d: number; in60d: number; in90d: number }>(
    "/analytics/lms/enrollment-validity",
    { in7d: 0, in30d: 0, in60d: 0, in90d: 0 }
  );

  const courses = courseData.courses;
  const cohorts = cohortData.cohorts;

  return (
    <div className="max-w-4xl">
      <h1 className="text-[24px] font-semibold text-text-primary">LMS analytics</h1>

      <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Enrollments expiring</h2>
      {validityLoading ? (
        <div className="mt-3 grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-card border border-border bg-surface" />
          ))}
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-4">
          {[
            ["7 days", validity.in7d],
            ["30 days", validity.in30d],
            ["60 days", validity.in60d],
            ["90 days", validity.in90d],
          ].map(([label, count]) => (
            <div key={label as string} className="rounded-card border border-border bg-background p-4 text-center">
              <p className="text-[20px] font-semibold text-text-primary">{count}</p>
              <p className="text-[13px] text-text-secondary">within {label}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Course health</h2>
      {coursesLoading ? (
        <div className="mt-3"><TableSkeleton /></div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Enrollments</th>
                <th className="px-4 py-3 font-medium">Completion</th>
                <th className="px-4 py-3 font-medium">Avg progress</th>
                <th className="px-4 py-3 font-medium">Avg quiz score</th>
                <th className="px-4 py-3 font-medium">Certificates</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.courseId} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${healthDot[c.health]}`} />
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.enrollments}</td>
                  <td className="px-4 py-3 text-text-secondary">{Math.round(c.completionRatePct)}%</td>
                  <td className="px-4 py-3 text-text-secondary">{Math.round(c.avgProgressPct)}%</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {c.avgQuizScorePct != null ? `${Math.round(c.avgQuizScorePct)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.certificatesIssued}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/analytics/${c.courseId}`} className="text-[13px] text-[#683290] hover:underline">
                      Drop-off →
                    </Link>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">No published courses yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Cohort performance</h2>
      {cohortsLoading ? (
        <div className="mt-3"><TableSkeleton /></div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Cohort</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">Avg progress</th>
                <th className="px-4 py-3 font-medium">Certificates earned</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.cohortId} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.members}</td>
                  <td className="px-4 py-3 text-text-secondary">{Math.round(c.avgProgressPct)}%</td>
                  <td className="px-4 py-3 text-text-secondary">{c.certificatesEarned}</td>
                </tr>
              ))}
              {cohorts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">No cohorts yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AssessmentAnalyticsSection />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Assessment Analytics (shared)                                              */
/* -------------------------------------------------------------------------- */

function AssessmentAnalyticsSection() {
  const { data, loading } = useApi<AssessmentAnalytics>("/analytics/assessments", {
    monthlyTrend: [],
    topPerformers: [],
    bottomPerformers: [],
    growthLeaderboard: [],
  });

  if (loading) {
    return <div className="mt-8"><TableSkeleton /></div>;
  }

  const maxScore = Math.max(1, ...data.monthlyTrend.map((m) => m.avgScore));

  return (
    <div className="mt-10">
      <h2 className="text-[15px] font-medium text-text-secondary">Assessment analytics</h2>

      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-background p-5">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-secondary">
            Monthly avg score trend
          </h3>
          {data.monthlyTrend.length === 0 ? (
            <p className="mt-4 text-[13px] text-text-secondary">No monthly assessment data yet.</p>
          ) : (
            <div className="mt-4 flex items-end gap-2">
              {data.monthlyTrend.map((m) => (
                <div key={`${m.year}-${m.month}`} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-blue" style={{ height: `${(m.avgScore / maxScore) * 100}px` }} />
                  <span className="text-[11px] text-text-secondary">
                    {m.month}/{String(m.year).slice(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-card border border-border bg-background p-5">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-secondary">Growth leaderboard</h3>
          {data.growthLeaderboard.length === 0 ? (
            <p className="mt-4 text-[13px] text-text-secondary">No closing assessments completed yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.growthLeaderboard.slice(0, 8).map((g) => (
                <li key={g.userId} className="flex items-center justify-between text-[14px]">
                  <span className="text-text-primary">{g.name}</span>
                  <span className={g.growthRate >= 0 ? "font-medium text-success" : "font-medium text-red"}>
                    {g.growthRate >= 0 ? "+" : ""}
                    {g.growthRate} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-[15px]">
          <thead className="bg-surface text-[13px] text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Top performers</th>
              <th className="px-4 py-3 font-medium">Avg score</th>
              <th className="px-4 py-3 font-medium">Bottom performers</th>
              <th className="px-4 py-3 font-medium">Avg score</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(data.topPerformers.length, data.bottomPerformers.length) }).map((_, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-3 text-text-primary">{data.topPerformers[i]?.name ?? "—"}</td>
                <td className="px-4 py-3 text-text-secondary">{data.topPerformers[i] ? `${data.topPerformers[i].avgScore}%` : ""}</td>
                <td className="px-4 py-3 text-text-primary">{data.bottomPerformers[i]?.name ?? "—"}</td>
                <td className="px-4 py-3 text-text-secondary">{data.bottomPerformers[i] ? `${data.bottomPerformers[i].avgScore}%` : ""}</td>
              </tr>
            ))}
            {data.topPerformers.length === 0 && data.bottomPerformers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                  No monthly assessment attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (role === "SUPER_ADMIN") {
    return <PlatformAnalytics />;
  }

  return <LmsAnalytics />;
}
