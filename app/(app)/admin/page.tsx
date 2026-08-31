"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApi } from "@/lib/useApi";
import { StatCardsSkeleton, TableSkeleton } from "@/components/Skeleton";
import {
  AnnouncementBanner,
  CurriculumWidget,
  ProgramOverview,
  StatsRow,
  UpcomingCohort,
} from "./AdminWidgets";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  FileText,
  GraduationCap,
  Layers,
  Plus,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface OverviewMetrics {
  membersByType: Record<string, number>;
  enrollments: { today: number; thisWeek: number; thisMonth: number };
  revenueCents: { thisMonth: number; lastMonth: number };
  communityPulse24h: { posts: number; messages: number; rsvps: number };
  expiringEnrollments30d: number;
}

const emptyMetrics: OverviewMetrics = {
  membersByType: {},
  enrollments: { today: 0, thisWeek: 0, thisMonth: 0 },
  revenueCents: { thisMonth: 0, lastMonth: 0 },
  communityPulse24h: { posts: 0, messages: 0, rsvps: 0 },
  expiringEnrollments30d: 0,
};

interface Course {
  id: string;
  title: string;
  status: string;
  _count: { lessons: number; enrollments: number };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
}

interface CohortPerformance {
  cohortId: string;
  name: string;
  members: number;
  avgProgressPct: number;
  certificatesEarned: number;
}

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

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* -------------------------------------------------------------------------- */
/*  Shared components                                                          */
/* -------------------------------------------------------------------------- */

const actionColors = {
  blue: { bg: "bg-[#F4ECF8]", text: "text-[#683290]" },
  purple: { bg: "bg-purple-light", text: "text-purple" },
};

function ActionLink({ href, label, icon: Icon, color }: { href: string; label: string; icon: LucideIcon; color: keyof typeof actionColors }) {
  const c = actionColors[color];
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-[8px] border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(26,26,46,0.08)] transition hover:-translate-y-0.5 hover:border-[#683290]/30 hover:shadow-[0_8px_24px_rgba(26,26,46,0.12)]">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] ${c.bg} ${c.text}`}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <span className="text-[14px] font-medium text-[#1A1A2E]">{label}</span>
    </Link>
  );
}

function ComplianceBar({ value }: { value: number }) {
  const color = value >= 80 ? "#16A34A" : value >= 50 ? "#EA580C" : "#DC2626";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-[#F1F3F5]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[13px] font-medium tabular-nums" style={{ color }}>{value}%</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Super Admin Dashboard                                                      */
/* -------------------------------------------------------------------------- */

function SuperAdminDashboard() {
  const { data: metrics, loading: metricsLoading } = useApi<OverviewMetrics>("/analytics/overview", emptyMetrics);
  const { data: usersData, loading: usersLoading } = useApi<{ users: User[] }>("/users?pageSize=100", { users: [] });
  const { data: orgsData, loading: orgsLoading } = useApi<{ id: string; name: string; slug: string; plan: string; _count: { users: number } }[]>("/organizations", []);

  const loading = metricsLoading || usersLoading || orgsLoading;

  const totalUsers = Object.values(metrics.membersByType).reduce((a, b) => a + b, 0);
  const revenue = formatCents(metrics.revenueCents.thisMonth);

  const platformTenants = (orgsData ?? []).map((org) => ({
    id: org.id,
    name: org.name,
    type: "ORG" as const,
    plan: org.plan,
    users: org._count?.users ?? 0,
    status: "ACTIVE" as const,
  }));

  // Real activity feed derived from live metrics.
  const activityItems = [
    { id: "enroll-today", message: `${metrics.enrollments.today} new enrollment${metrics.enrollments.today === 1 ? "" : "s"} today`, time: "today", color: "bg-[#16A34A]" },
    { id: "expiring", message: `${metrics.expiringEnrollments30d} enrollment${metrics.expiringEnrollments30d === 1 ? "" : "s"} expiring in 30 days`, time: "window", color: "bg-[#DC2626]" },
    { id: "posts-24h", message: `${metrics.communityPulse24h.posts} posts in the last 24 hours`, time: "24h", color: "bg-[#683290]" },
    { id: "rsvps-24h", message: `${metrics.communityPulse24h.rsvps} event RSVPs in the last 24 hours`, time: "24h", color: "bg-[#4451A2]" },
  ].filter((a) => a.message !== "0 enrollments expiring in 30 days");

  return (
    <div className="space-y-6">
      {loading ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <StatsRow stats={[
          { label: "Total Active Users", value: totalUsers.toLocaleString() || "—" },
          { label: "Monthly Revenue", value: revenue !== "$0" ? revenue : "—", color: "purple" },
          { label: "Enrollments Today", value: metrics.enrollments.today || 0 },
          { label: "Expiring in 30d", value: metrics.expiringEnrollments30d || 0, color: metrics.expiringEnrollments30d > 0 ? "red" : undefined },
        ]} />
      )}

      <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h3 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">Tenant Overview</h3>
          <Link href="/admin/organizations" className="text-[13px] font-semibold text-[#683290] hover:underline">VIEW ALL →</Link>
        </div>
        <div className="overflow-x-auto">
          {orgsLoading ? (
            <TableSkeleton rows={3} />
          ) : (
          <table className="w-full text-left">
            <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Tenant Name</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Type</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Plan</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Active Users</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody>
              {platformTenants.map((t) => (
                <tr key={t.id} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                  <td className="px-6 py-4">
                    <Link href={t.type === "ORG" ? `/admin/organizations/${t.id}` : `/admin/institutions/${t.id}`} className="flex items-center gap-3 text-[14px] font-medium text-[#1A1A2E] hover:text-[#683290]">
                      {t.type === "ORG" ? <Building2 className="h-4 w-4 text-[#683290]" /> : <GraduationCap className="h-4 w-4 text-[#2563EB]" />}
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${t.type === "ORG" ? "bg-[#F4ECF8] text-[#683290]" : "bg-[#EFF6FF] text-[#2563EB]"}`}>{t.type}</span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#6B7280]">{t.plan}</td>
                  <td className="px-6 py-4 text-[14px] font-medium tabular-nums text-[#1A1A2E]">{t.users.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />{t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Quick Actions</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ActionLink href="/admin/courses/new" label="Create Course" icon={BookOpen} color="blue" />
            <ActionLink href="/admin/organizations" label="New Tenant" icon={Plus} color="blue" />
            <ActionLink href="/admin/analytics" label="Audit Logs" icon={BarChart3} color="blue" />
            <ActionLink href="/admin/settings" label="Global Policies" icon={ShieldCheck} color="blue" />
            <ActionLink href="/admin/reports" label="Export Report" icon={FileText} color="blue" />
          </div>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Recent Activity</h4>
          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-3 w-full animate-pulse rounded bg-[#E8E9F1]" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-[#E8E9F1]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#E8E9F1]" />
              </div>
            ) : (
              activityItems.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.color}`} />
                  <div>
                    <p className="text-[13px] text-[#1A1A2E]">{a.message}</p>
                    <p className="mt-0.5 text-[12px] text-[#9CA3AF]">{a.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CyberNovr Admin Dashboard                                                  */
/* -------------------------------------------------------------------------- */

function CybernovrAdminDashboard() {
  const { data: coursesData, loading: coursesLoading } = useApi<{ courses: Course[] }>("/courses?pageSize=50", { courses: [] });
  const { data: metrics } = useApi<OverviewMetrics>("/analytics/overview", emptyMetrics);
  const courses = coursesData.courses;
  const published = courses.filter((c) => c.status === "PUBLISHED");
  const totalEnrollments = courses.reduce((sum, c) => sum + (c._count?.enrollments ?? 0), 0);

  const activityItems = [
    { id: "enroll-today", msg: `${metrics.enrollments.today} enrollment${metrics.enrollments.today === 1 ? "" : "s"} today`, time: "today", color: "bg-[#16A34A]" },
    { id: "expiring", msg: `${metrics.expiringEnrollments30d} expiring in 30 days`, time: "window", color: "bg-[#EA580C]" },
    { id: "posts-24h", msg: `${metrics.communityPulse24h.posts} community posts in 24h`, time: "24h", color: "bg-[#683290]" },
  ];

  return (
    <div className="space-y-6">
      {coursesLoading ? (
        <StatCardsSkeleton count={3} />
      ) : (
        <StatsRow stats={[
          { label: "Total Courses", value: courses.length },
          { label: "Published", value: published.length, color: "purple" },
          { label: "Total Enrollments", value: totalEnrollments.toLocaleString() },
        ]} />
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h3 className="text-[15px] font-semibold text-[#1A1A2E]">All Courses</h3>
              <Link href="/admin/courses/new" className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]">
                <Plus className="h-3.5 w-3.5" /> New Course
              </Link>
            </div>
            <div className="overflow-x-auto">
              {coursesLoading ? (
                <TableSkeleton rows={4} />
              ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Course</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Enrollments</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Lessons</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.slice(0, 5).map((c) => (
                    <tr key={c.id} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                      <td className="px-6 py-4 text-[14px] font-medium text-[#1A1A2E]">{c.title}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.status === "PUBLISHED" ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FFF7ED] text-[#EA580C]"}`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4 text-[14px] tabular-nums text-[#1A1A2E]">{c._count?.enrollments ?? 0}</td>
                      <td className="px-6 py-4 text-[14px] text-[#6B7280]">{c._count?.lessons ?? 0}</td>
                    </tr>
                  ))}
                  {courses.length === 0 && !coursesLoading && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-[14px] text-[#9CA3AF]">No courses yet</td></tr>
                  )}
                </tbody>
              </table>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Quick Actions</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ActionLink href="/admin/courses/new" label="Create Course" icon={BookOpen} color="blue" />
              <ActionLink href="/admin/courses" label="Manage Courses" icon={BookOpen} color="blue" />
              <ActionLink href="/admin/analytics" label="View Analytics" icon={BarChart3} color="blue" />
              <ActionLink href="/admin/settings" label="Settings" icon={Settings} color="blue" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Recent Activity</h4>
            <div className="mt-4 space-y-3">
              {activityItems.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.color}`} />
                  <div>
                    <p className="text-[13px] text-[#1A1A2E]">{a.msg}</p>
                    <p className="mt-0.5 text-[12px] text-[#9CA3AF]">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Org Admin Dashboard                                                        */
/* -------------------------------------------------------------------------- */

interface ComplianceStats {
  rate: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  total: number;
}

function AtRiskEmployeesWidget() {
  const { data: recordsData } = useApi<{ records: { userId: string; name: string | null; email: string; progressPct: number; status: string }[] }>("/compliance/records?status=NON_COMPLIANT&pageSize=5", { records: [] });
  const records = recordsData?.records ?? [];

  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
      <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">At-Risk Employees</h4>
      <div className="mt-4 space-y-3">
        {records.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">No at-risk employees</p>
        ) : (
          records.map((e) => (
            <div key={e.userId} className="rounded-[6px] border border-[#E5E7EB] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#1A1A2E]">{e.name ?? e.email}</span>
                <span className="text-[12px] text-[#DC2626] font-medium">{e.status}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1F3F5]">
                  <div className="h-full rounded-full bg-[#DC2626]" style={{ width: `${e.progressPct}%` }} />
                </div>
                <span className="text-[11px] tabular-nums text-[#DC2626]">{e.progressPct}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function OrgAdminDashboard() {
  const { data: complianceStats } = useApi<ComplianceStats>("/compliance/stats", { rate: 0, compliant: 0, partial: 0, nonCompliant: 0, total: 0 });
  const { data: campaignsData } = useApi<{ _count?: { campaignResults: number }; results?: { clicked?: number; sent?: number } }[]>("/campaigns", []);
  const campaigns = Array.isArray(campaignsData) ? campaignsData : [];
  const totalClicked = campaigns.reduce((sum, c) => sum + (c.results?.clicked ?? 0), 0);
  const totalSent = campaigns.reduce((sum, c) => sum + (c.results?.sent ?? 0), 0);
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-[28px] font-semibold text-[#1A1A2E]">Organization Overview</h2>
            <p className="mt-2 text-[14px] text-[#6B7280]">Employee training and compliance summary.</p>
            <div className="mt-6">
              <p className="text-[48px] font-bold text-[#683290]">{complianceStats.rate}<span className="text-[24px] text-[#6B7280]">/100</span></p>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliance Score</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F3F5" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={complianceStats.rate >= 80 ? "#16A34A" : complianceStats.rate >= 50 ? "#EA580C" : "#DC2626"} strokeWidth="10" strokeDasharray="314" strokeDashoffset={314 - (complianceStats.rate / 100) * 314} strokeLinecap="round" transform="rotate(-90 60 60)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[14px] font-semibold ${complianceStats.rate >= 80 ? "text-[#16A34A]" : complianceStats.rate >= 50 ? "text-[#EA580C]" : "text-[#DC2626]"}`}>
                  {complianceStats.rate >= 80 ? "HEALTHY" : complianceStats.rate >= 50 ? "AT RISK" : "CRITICAL"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatsRow stats={[
        { label: "Total Employees", value: complianceStats.total.toLocaleString() || "0" },
        { label: "Compliant", value: complianceStats.compliant, color: "purple" },
        { label: "At-Risk", value: complianceStats.nonCompliant, color: "red" },
        { label: "Phishing Click Rate", value: `${clickRate}%`, color: clickRate > 10 ? "red" : undefined },
      ]} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Quick Actions</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ActionLink href="/admin/users" label="Invite Employee" icon={UserPlus} color="blue" />
            <ActionLink href="/admin/courses/assign" label="Assign Course" icon={BookOpen} color="blue" />
            <ActionLink href="/admin/compliance" label="View Compliance" icon={ShieldCheck} color="blue" />
            <ActionLink href="/admin/phishing" label="Phishing Campaigns" icon={ShieldCheck} color="blue" />
          </div>
        </div>

        <div>
          <AtRiskEmployeesWidget />
          <Link href="/admin/compliance" className="mt-4 block text-center text-[13px] font-semibold text-[#683290] hover:underline">VIEW ALL EMPLOYEES</Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Institution Admin Dashboard                                                */
/* -------------------------------------------------------------------------- */

function InstitutionAdminDashboard() {
  const { data: overview, loading: overviewLoading } = useApi<OverviewMetrics>("/analytics/overview", emptyMetrics);
  const { data: cohortData, loading: cohortLoading } = useApi<{ cohorts: CohortPerformance[] }>("/analytics/lms/cohort-performance", { cohorts: [] });
  const { data: healthData, loading: healthLoading } = useApi<{ courses: CourseHealth[] }>("/analytics/lms/course-health", { courses: [] });

  const loading = overviewLoading || cohortLoading || healthLoading;
  const totalEnrolled = Object.values(overview.membersByType).reduce((a, b) => a + b, 0);
  const certificatesEarned = cohortData.cohorts.reduce((sum, c) => sum + (c.certificatesEarned ?? 0), 0);
  const completionRate = healthData.courses.length
    ? Math.round(healthData.courses.reduce((sum, c) => sum + (c.completionRatePct ?? 0), 0) / healthData.courses.length)
    : 0;

  // Derive tier distribution from cohort progress.
  const tiers = [
    { label: "Advanced", count: cohortData.cohorts.filter((c) => (c.avgProgressPct ?? 0) >= 80).length, percentage: Math.min(100, Math.round((cohortData.cohorts.filter((c) => (c.avgProgressPct ?? 0) >= 80).length / Math.max(1, cohortData.cohorts.length)) * 100)) },
    { label: "Intermediate", count: cohortData.cohorts.filter((c) => (c.avgProgressPct ?? 0) >= 50 && (c.avgProgressPct ?? 0) < 80).length, percentage: Math.min(100, Math.round((cohortData.cohorts.filter((c) => (c.avgProgressPct ?? 0) >= 50 && (c.avgProgressPct ?? 0) < 80).length / Math.max(1, cohortData.cohorts.length)) * 100)) },
    { label: "Fundamental", count: cohortData.cohorts.filter((c) => (c.avgProgressPct ?? 0) > 0 && (c.avgProgressPct ?? 0) < 50).length, percentage: Math.min(100, Math.round((cohortData.cohorts.filter((c) => (c.avgProgressPct ?? 0) > 0 && (c.avgProgressPct ?? 0) < 50).length / Math.max(1, cohortData.cohorts.length)) * 100)) },
  ].filter((t) => t.count > 0);

  const nextCohort = [...cohortData.cohorts].sort((a, b) => (b.members ?? 0) - (a.members ?? 0))[0];

  return (
    <div className="space-y-6">
      {loading ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <>
          <ProgramOverview activeStudents={totalEnrolled} tiers={tiers} />

          <StatsRow stats={[
            { label: "Total Enrolled", value: totalEnrolled.toLocaleString() || "—" },
            { label: "Certificates Earned", value: certificatesEarned || "—" },
            { label: "Avg Completion Rate", value: `${completionRate}%` },
            { label: "Cohorts", value: cohortData.cohorts.length, color: "purple" },
          ]} />
        </>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Real cohort performance table */}
          <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Cohort Performance</h3>
              <Link href="/admin/cohorts" className="text-[13px] font-semibold text-[#683290] hover:underline">VIEW ALL →</Link>
            </div>
            {cohortLoading ? (
              <TableSkeleton rows={4} />
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Cohort</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Members</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Avg Progress</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Certificates</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.cohorts.map((c) => (
                    <tr key={c.cohortId} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                      <td className="px-6 py-4 text-[14px] font-medium text-[#1A1A2E]">{c.name}</td>
                      <td className="px-6 py-4 text-[14px] tabular-nums text-[#1A1A2E]">{c.members ?? 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#F1F3F5]">
                            <div className="h-full rounded-full bg-[#683290]" style={{ width: `${c.avgProgressPct ?? 0}%` }} />
                          </div>
                          <span className="text-[13px] font-medium tabular-nums text-[#1A1A2E]">{c.avgProgressPct ?? 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] tabular-nums text-[#1A1A2E]">{c.certificatesEarned ?? 0}</td>
                    </tr>
                  ))}
                  {cohortData.cohorts.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-[14px] text-[#9CA3AF]">No cohorts yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Quick Actions</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ActionLink href="/admin/courses/new" label="Create Track" icon={BookOpen} color="blue" />
              <ActionLink href="/admin/cohorts" label="Manage Cohort" icon={Layers} color="blue" />
              <ActionLink href="/admin/notifications" label="Send Notification" icon={Bell} color="blue" />
              <ActionLink href="/admin/analytics" label="View Analytics" icon={BarChart3} color="blue" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Real course health as curriculum widget */}
          <CurriculumWidget
            tracks={(healthData.courses ?? []).map((c) => ({
              name: c.title,
              status: c.health === "green" ? "On track" : c.health === "amber" ? "Needs attention" : "At risk",
              percentage: Math.round(c.completionRatePct ?? 0),
            }))}
            loading={healthLoading}
          />
          {nextCohort && (
            <UpcomingCohort
              cohortName={nextCohort.name}
              registrationOpensIn={`${nextCohort.members ?? 0} members`}
              seats={nextCohort.members ?? 0}
              department="Across cohorts"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (role === "SUPER_ADMIN") {
    return <SuperAdminDashboard />;
  }

  if (role === "CYBERNOVR_ADMIN") {
    return <CybernovrAdminDashboard />;
  }

  if (role === "INSTITUTION_ADMIN") {
    return <InstitutionAdminDashboard />;
  }

  return <OrgAdminDashboard />;
}
