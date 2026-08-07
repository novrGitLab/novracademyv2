"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApi } from "@/lib/useApi";
import { StatCardsSkeleton } from "@/components/Skeleton";
import {
  AnnouncementBanner,
  CurriculumWidget,
  ProgramOverview,
  RecentCertificates,
  StatsRow,
  StudentTable,
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

/* -------------------------------------------------------------------------- */
/*  Static data                                                                */
/* -------------------------------------------------------------------------- */

const tiers = [
  { label: "Fundamental", count: 154, percentage: 45 },
  { label: "Intermediate", count: 102, percentage: 30 },
  { label: "Advanced", count: 62, percentage: 18 },
  { label: "Expert", count: 24, percentage: 7 },
];

const students = [
  { id: "1", name: "Oluwaseun Adeyemi", program: "CEAP 2026-B", level: "Advanced", status: "CERTIFIED" as const },
  { id: "2", name: "Chidi Eze", program: "CEAP 2026-B", level: "Intermediate", status: "IN_PROGRESS" as const },
  { id: "3", name: "Ngozi Okafor", program: "CEAP 2026-B", level: "Fundamental", status: "AT_RISK" as const },
  { id: "4", name: "Tunde Balogun", program: "CEAP 2026-A", level: "Intermediate", status: "IN_PROGRESS" as const },
  { id: "5", name: "Fatima Nwachukwu", program: "CEAP 2026-B", level: "Expert", status: "CERTIFIED" as const },
];

const curriculumTracks = [
  { name: "Fundamental Track", status: "Active", percentage: 100 },
  { name: "Intermediate Track", status: "Active", percentage: 65 },
];

const certificates = [
  { id: "1", recipientName: "O. Adeyemi", trackName: "CEAP Advanced" },
  { id: "2", recipientName: "T. Balogun", trackName: "CEAP Intermediate" },
  { id: "3", recipientName: "F. Nwachukwu", trackName: "CEAP Fundamental" },
  { id: "4", recipientName: "A. Ibrahim", trackName: "CEAP Advanced" },
];

const platformTenants = [
  { id: "1", name: "Dangote Group", type: "ORG" as const, plan: "Enterprise", users: 2450, compliance: 92, status: "ACTIVE" },
  { id: "2", name: "Lagos State University", type: "INST" as const, plan: "Academic Pro", users: 8120, compliance: 78, status: "ACTIVE" },
  { id: "3", name: "Airtel Nigeria", type: "ORG" as const, plan: "Enterprise Plus", users: 1890, compliance: 45, status: "ACTIVE" },
  { id: "4", name: "University of Lagos", type: "INST" as const, plan: "Academic Pro", users: 6400, compliance: 85, status: "ACTIVE" },
  { id: "5", name: "GTBank", type: "ORG" as const, plan: "Enterprise", users: 3200, compliance: 88, status: "ACTIVE" },
];

const recentActivity = [
  { id: "1", message: "Compliance Failure: Airtel Nigeria fell below threshold.", time: "10 mins ago", color: "bg-[#DC2626]" },
  { id: "2", message: "New Deployment: Dangote Group added 500 nodes.", time: "1 hour ago", color: "bg-[#683290]" },
  { id: "3", message: "Policy Update: Lagos State University modified access controls.", time: "3 hours ago", color: "bg-[#4451A2]" },
];

const orgEmployees = [
  { id: "1", name: "Sarah Jenkins", department: "Engineering", phishing: "Passed (3/3)", courseProgress: 100, status: "Compliant" },
  { id: "2", name: "Marcus Chen", department: "Sales", phishing: "Failed (1/3)", courseProgress: 40, status: "At Risk" },
  { id: "3", name: "Elena Rostova", department: "HR", phishing: "Passed (2/3)", courseProgress: 75, status: "Remedial" },
];

const courseStats = [
  { id: "1", title: "Security Basics", status: "PUBLISHED", enrollments: 1240, completionRate: 82, lessons: 8 },
  { id: "2", title: "Data Privacy Fundamentals", status: "PUBLISHED", enrollments: 890, completionRate: 76, lessons: 6 },
  { id: "3", title: "Incident Response 101", status: "PUBLISHED", enrollments: 650, completionRate: 71, lessons: 5 },
  { id: "4", title: "Phishing Awareness", status: "DRAFT", enrollments: 0, completionRate: 0, lessons: 4 },
];

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
  return (
    <div className="space-y-6">
      <StatsRow stats={[
        { label: "Total Active Users", value: "14,285" },
        { label: "Monthly Revenue", value: "$845k", color: "purple" },
        { label: "Org Tenants", value: 47 },
        { label: "Inst Tenants", value: 23 },
        { label: "System Uptime", value: "99.97%" },
      ]} />

      <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h3 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">Tenant Overview</h3>
          <Link href="/admin/organizations" className="text-[13px] font-semibold text-[#683290] hover:underline">VIEW ALL →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Tenant Name</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Type</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Plan</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Active Users</th>
                <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliance</th>
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
                  <td className="px-6 py-4"><ComplianceBar value={t.compliance} /></td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />{t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Quick Actions</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ActionLink href="/admin/organizations" label="New Tenant" icon={Plus} color="blue" />
            <ActionLink href="/admin/analytics" label="Audit Logs" icon={BarChart3} color="blue" />
            <ActionLink href="/admin/settings" label="Global Policies" icon={ShieldCheck} color="blue" />
            <ActionLink href="/admin/reports" label="Export Report" icon={FileText} color="blue" />
          </div>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Recent Activity</h4>
          <div className="mt-4 space-y-4">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.color}`} />
                <div>
                  <p className="text-[13px] text-[#1A1A2E]">{a.message}</p>
                  <p className="mt-0.5 text-[12px] text-[#9CA3AF]">{a.time}</p>
                </div>
              </div>
            ))}
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
  return (
    <div className="space-y-6">
      <StatsRow stats={[
        { label: "Total Courses", value: 12 },
        { label: "Published", value: 9, color: "purple" },
        { label: "Total Enrollments", value: "4,820" },
        { label: "Avg Completion", value: "78%" },
      ]} />

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
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Course</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Enrollments</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Completion</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Lessons</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStats.map((c) => (
                    <tr key={c.id} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                      <td className="px-6 py-4 text-[14px] font-medium text-[#1A1A2E]">{c.title}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.status === "PUBLISHED" ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FFF7ED] text-[#EA580C]"}`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4 text-[14px] tabular-nums text-[#1A1A2E]">{c.enrollments.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[14px] tabular-nums text-[#1A1A2E]">{c.completionRate}%</td>
                      <td className="px-6 py-4 text-[14px] text-[#6B7280]">{c.lessons}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              {[
                { msg: "\"Security Basics\" published", time: "2 hours ago", color: "bg-[#16A34A]" },
                { msg: "\"Data Privacy\" updated with new lesson", time: "1 day ago", color: "bg-[#683290]" },
                { msg: "150 enrollments this week", time: "3 days ago", color: "bg-[#2563EB]" },
              ].map((a, i) => (
                <div key={i} className="flex gap-3">
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

const orgCourses = [
  { id: "1", name: "Security Basics", completions: 45, atRisk: 3, status: "Active" },
  { id: "2", name: "Data Privacy Fundamentals", completions: 28, atRisk: 0, status: "Active" },
  { id: "3", name: "Incident Response 101", completions: 12, atRisk: 8, status: "Active" },
];

const atRiskEmployees = [
  { id: "1", name: "Marcus Chen", department: "Sales", lastActive: "3 days ago", progress: 40 },
  { id: "2", name: "Amina Yusuf", department: "Marketing", lastActive: "1 week ago", progress: 15 },
  { id: "3", name: "Tunde Bakare", department: "Operations", lastActive: "2 weeks ago", progress: 0 },
];

function OrgAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-[28px] font-semibold text-[#1A1A2E]">Acme Corp Overview</h2>
            <p className="mt-2 text-[14px] text-[#6B7280]">Employee training and compliance summary.</p>
            <div className="mt-6">
              <p className="text-[48px] font-bold text-[#683290]">87<span className="text-[24px] text-[#6B7280]">/100</span></p>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Compliance Score</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F3F5" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#16A34A" strokeWidth="10" strokeDasharray="314" strokeDashoffset="40" strokeLinecap="round" transform="rotate(-90 60 60)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[14px] font-semibold text-[#16A34A]">HEALTHY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatsRow stats={[
        { label: "Total Employees", value: "1,247" },
        { label: "Active Courses", value: 12 },
        { label: "Completion Rate", value: "76.4%" },
        { label: "At-Risk", value: 23, color: "red" },
      ]} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Course Activity</h3>
              <Link href="/admin/courses" className="text-[13px] font-semibold text-[#683290] hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Course</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Completions</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">At-Risk</th>
                    <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orgCourses.map((c) => (
                    <tr key={c.id} className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]">
                      <td className="px-6 py-4 text-[14px] font-medium text-[#1A1A2E]">{c.name}</td>
                      <td className="px-6 py-4 text-[14px] tabular-nums text-[#1A1A2E]">{c.completions}</td>
                      <td className="px-6 py-4 text-[14px] tabular-nums text-[#DC2626]">{c.atRisk}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Quick Actions</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ActionLink href="/admin/users" label="Invite Employee" icon={UserPlus} color="blue" />
              <ActionLink href="/admin/courses/new" label="Create Course" icon={BookOpen} color="blue" />
              <ActionLink href="/admin/compliance" label="View Compliance" icon={ShieldCheck} color="blue" />
              <ActionLink href="/admin/notifications" label="Send Notification" icon={Bell} color="blue" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">At-Risk Employees</h4>
            <div className="mt-4 space-y-3">
              {atRiskEmployees.map((e) => (
                <div key={e.id} className="rounded-[6px] border border-[#E5E7EB] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#1A1A2E]">{e.name}</span>
                    <span className="text-[12px] text-[#6B7280]">{e.department}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1F3F5]">
                      <div className="h-full rounded-full bg-[#DC2626]" style={{ width: `${e.progress}%` }} />
                    </div>
                    <span className="text-[11px] tabular-nums text-[#DC2626]">{e.progress}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#9CA3AF]">Last active: {e.lastActive}</p>
                </div>
              ))}
            </div>
            <Link href="/admin/users" className="mt-4 block text-center text-[13px] font-semibold text-[#683290] hover:underline">VIEW ALL EMPLOYEES</Link>
          </div>

          <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">Completion by Department</h4>
            <div className="mt-4 space-y-3">
              {[
                { dept: "Engineering", pct: 98 },
                { dept: "Sales", pct: 64 },
                { dept: "HR", pct: 82 },
                { dept: "Marketing", pct: 71 },
              ].map((d) => (
                <div key={d.dept}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#1A1A2E]">{d.dept}</span>
                    <span className="text-[12px] font-medium" style={{ color: d.pct >= 80 ? "#16A34A" : "#DC2626" }}>{d.pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F1F3F5]">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.pct >= 80 ? "#16A34A" : "#DC2626" }} />
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
/*  Institution Admin Dashboard                                                */
/* -------------------------------------------------------------------------- */

function InstitutionAdminDashboard() {
  return (
    <div className="space-y-6">
      <ProgramOverview activeStudents={342} tiers={tiers} />

      <StatsRow stats={[
        { label: "Total Enrolled", value: 1156 },
        { label: "Certificates Earned", value: 89 },
        { label: "Completion Rate", value: "76.4%" },
        { label: "At-Risk", value: 34, color: "red" },
      ]} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <StudentTable students={students} />
          <div>
            <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Quick Actions</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ActionLink href="/admin/certifications" label="Issue Certificate" icon={GraduationCap} color="blue" />
              <ActionLink href="/admin/courses/new" label="Create Track" icon={BookOpen} color="blue" />
              <ActionLink href="/admin/cohorts" label="Manage Cohort" icon={Layers} color="blue" />
              <ActionLink href="/admin/notifications" label="Send Notification" icon={Bell} color="blue" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <CurriculumWidget tracks={curriculumTracks} />
          <UpcomingCohort cohortName="Cohort 2027-A (Spring)" registrationOpensIn="14 days" seats={250} department="Computer Science" />
        </div>
      </div>

      <RecentCertificates certificates={certificates} />
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
