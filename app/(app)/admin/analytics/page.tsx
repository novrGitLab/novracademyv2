"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Building2, GraduationCap, TrendingUp, Users } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { TableSkeleton } from "@/components/Skeleton";
import { StatsRow } from "../AdminWidgets";

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

interface PlatformAnalytics {
  totals: {
    organizations: number;
    users: number;
    activeEnrollments: number;
    certificatesIssued: number;
    revenueAllTimeCents: number;
  };
  revenue: {
    thisMonthCents: number;
    lastMonthCents: number;
    momGrowthPct: number;
    byProvider: Record<string, number>;
    byMonth: Record<string, number>;
  };
  tenantGrowthByMonth: Record<string, number>;
  usersByMemberType: Record<string, number>;
  topTenants: { id: string; name: string; users: number }[];
  months: string[];
}

const healthDot: Record<CourseHealth["health"], string> = {
  green: "bg-success",
  amber: "bg-yellow-500",
  red: "bg-red",
};

/* -------------------------------------------------------------------------- */
/*  Platform Analytics (Super Admin)                                           */
/* -------------------------------------------------------------------------- */

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMoney(cents: number): string {
  if (cents >= 1_000_000) return `$${(cents / 100_000).toFixed(1)}k`;
  if (cents >= 100_000) return `$${(cents / 100_000).toFixed(1)}k`;
  return `$${(cents / 100).toLocaleString()}`;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function monthLabel(ym: string): string {
  const [, m] = ym.split("-");
  const idx = Number(m) - 1;
  return MONTH_LABELS[idx] ?? ym;
}

function PlatformAnalytics() {
  const { data, loading } = useApi<PlatformAnalytics>("/analytics/platform", {
    totals: {
      organizations: 0,
      users: 0,
      activeEnrollments: 0,
      certificatesIssued: 0,
      revenueAllTimeCents: 0,
    },
    revenue: { thisMonthCents: 0, lastMonthCents: 0, momGrowthPct: 0, byProvider: {}, byMonth: {} },
    tenantGrowthByMonth: {},
    usersByMemberType: {},
    topTenants: [],
    months: [],
  });

  const months = data.months.length > 0 ? data.months : Object.keys(data.tenantGrowthByMonth);
  const maxTenantGrowth = Math.max(1, ...months.map((m) => data.tenantGrowthByMonth[m] ?? 0));
  const maxRevenue = Math.max(1, ...months.map((m) => data.revenue.byMonth[m] ?? 0));

  const memberTypeLabels: Record<string, string> = {
    NEW_LEARNER: "Learners",
    COMMUNITY_ONLY: "Community",
    LEGACY_ALUMNI: "Alumni",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Platform Analytics</h1>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[8px] border border-[#E5E7EB] bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-[8px] border border-[#E5E7EB] bg-white" />
          <div className="h-72 animate-pulse rounded-[8px] border border-[#E5E7EB] bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Platform Analytics</h1>

      <StatsRow stats={[
        { label: "Total Tenants", value: formatCompact(data.totals.organizations) },
        { label: "Total Users", value: formatCompact(data.totals.users) },
        { label: "Active Enrollments", value: formatCompact(data.totals.activeEnrollments) },
        {
          label: "All-time Revenue",
          value: formatMoney(data.totals.revenueAllTimeCents),
          color: "purple",
        },
      ]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tenant Growth */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Tenant Growth</h3>
          {months.length === 0 ? (
            <p className="mt-4 text-[13px] text-[#9CA3AF]">No tenant data yet.</p>
          ) : (
            <div className="mt-4 flex items-end gap-2">
              {months.map((m) => (
                <div key={m} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-[#F4ECF8]" style={{ height: `${((data.tenantGrowthByMonth[m] ?? 0) / maxTenantGrowth) * 80}px` }} />
                  <span className="text-[11px] text-[#9CA3AF]">{monthLabel(m)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
              <span className="h-2 w-2 rounded-sm bg-[#F4ECF8]" />
              New tenants / month
            </span>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <h3 className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Revenue Trend
            <span className="flex items-center gap-1 text-[13px] font-medium normal-case text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {data.revenue.momGrowthPct >= 0 ? "+" : ""}
              {Math.round(data.revenue.momGrowthPct)}% MoM
            </span>
          </h3>
          {months.length === 0 ? (
            <p className="mt-4 text-[13px] text-[#9CA3AF]">No revenue data yet.</p>
          ) : (
            <div className="mt-4 flex items-end gap-2">
              {months.map((m) => (
                <div key={m} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-[#4451A2]" style={{ height: `${((data.revenue.byMonth[m] ?? 0) / maxRevenue) * 100}px` }} />
                  <span className="text-[11px] text-[#9CA3AF]">{monthLabel(m)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[12px] text-[#9CA3AF]">
            {formatMoney(data.revenue.thisMonthCents)} this month
            {Object.entries(data.revenue.byProvider).length > 0 && (
              <> · {Object.entries(data.revenue.byProvider).map(([p, c]) => `${p}: ${formatMoney(c)}`).join(" · ")}</>
            )}
          </p>
        </div>
      </div>

      {/* Membership + top tenants */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Members by type</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["NEW_LEARNER", "COMMUNITY_ONLY", "LEGACY_ALUMNI"] as const).map((t) => (
              <div key={t}>
                <div className="flex items-center gap-2">
                  {t === "NEW_LEARNER" ? (
                    <GraduationCap className="h-4 w-4 text-[#2563EB]" />
                  ) : t === "COMMUNITY_ONLY" ? (
                    <Building2 className="h-4 w-4 text-[#683290]" />
                  ) : (
                    <Users className="h-4 w-4 text-[#2563EB]" />
                  )}
                  <span className="text-[14px] font-medium text-[#1A1A2E]">{memberTypeLabels[t] ?? t}</span>
                </div>
                <p className="mt-2 text-[28px] font-bold tabular-nums text-[#1A1A2E]">
                  {formatCompact(data.usersByMemberType[t] ?? 0)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-[#F3F4F6] pt-3 text-[12px] text-[#9CA3AF]">
            {formatCompact(data.totals.certificatesIssued)} certificates issued · {formatCompact(data.totals.organizations)} total tenants
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Top tenants by members</h3>
          {data.topTenants.length === 0 ? (
            <p className="mt-4 text-[13px] text-[#9CA3AF]">No tenant data yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.topTenants.map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <span className="flex min-w-0 items-center gap-2 text-[14px] text-[#1A1A2E]">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-[#683290]" />
                    <span className="truncate">{t.name}</span>
                  </span>
                  <span className="ml-3 shrink-0 text-[13px] tabular-nums text-[#6B7280]">
                    {formatCompact(t.users)} members
                  </span>
                </li>
              ))}
            </ul>
          )}
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
