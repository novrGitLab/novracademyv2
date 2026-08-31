"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  Filter,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Program Overview Hero                                                      */
/* -------------------------------------------------------------------------- */

interface TierData {
  label: string;
  count: number;
  percentage: number;
}

export function ProgramOverview({
  title = "CEAP Program Overview",
  subtitle = "Cybersecurity Education and Awareness Program",
  activeStudents,
  tiers,
}: {
  title?: string;
  subtitle?: string;
  activeStudents: number;
  tiers: TierData[];
}) {
  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Title + stat */}
        <div className="border-b border-[#E5E7EB] p-6 lg:border-b-0 lg:border-r lg:p-8">
          <h2 className="font-serif text-[28px] font-semibold leading-tight tracking-tight text-[#1A1A2E] sm:text-[32px]">
            {title}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280]">
            {subtitle}
          </p>
          <div className="mt-6">
            <p className="text-[40px] font-bold tabular-nums text-[#683290]">
              {activeStudents.toLocaleString()}
            </p>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Active Students
            </p>
          </div>
        </div>

        {/* Right: Tier distribution */}
        <div className="p-6 lg:p-8">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Distribution by Tier
          </h3>
          <div className="mt-4 space-y-4">
            {tiers.map((tier) => (
              <div key={tier.label}>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#1A1A2E]">
                    {tier.label}
                  </span>
                  <span className="text-[14px] font-semibold tabular-nums text-[#1A1A2E]">
                    {tier.count}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#F1F3F5]">
                  <div
                    className="h-full rounded-full bg-[#683290] transition-all"
                    style={{ width: `${tier.percentage}%` }}
                  />
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
/*  Stats Row                                                                  */
/* -------------------------------------------------------------------------- */

interface StatItem {
  label: string;
  value: string | number;
  color?: "default" | "red" | "purple";
}

export function StatsRow({ stats }: { stats: StatItem[] }) {
  const colorMap = {
    default: "text-[#1A1A2E]",
    red: "text-[#DC2626]",
    purple: "text-[#683290]",
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]"
        >
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
            {stat.label}
          </p>
          <p
            className={`mt-2 text-[28px] font-bold tabular-nums ${
              colorMap[stat.color ?? "default"]
            }`}
          >
            {typeof stat.value === "number"
              ? stat.value.toLocaleString()
              : stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Student Management Table                                                   */
/* -------------------------------------------------------------------------- */

interface Student {
  id: string;
  name: string;
  program: string;
  level: string;
  status: "CERTIFIED" | "IN_PROGRESS" | "AT_RISK";
  avatar?: string;
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  CERTIFIED: {
    bg: "bg-[#F0FDF4]",
    text: "text-[#16A34A]",
    dot: "bg-[#16A34A]",
  },
  IN_PROGRESS: {
    bg: "bg-[#F4ECF8]",
    text: "text-[#683290]",
    dot: "bg-[#683290]",
  },
  AT_RISK: {
    bg: "bg-[#FEF2F2]",
    text: "text-[#DC2626]",
    dot: "bg-[#DC2626]",
  },
};

function StatusBadge({ status }: { status: Student["status"] }) {
  const s = statusStyles[status];
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function StudentTable({ students }: { students: Student[] }) {
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.program.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
        <h3 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">
          Student Management
        </h3>
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
            aria-label="Filter students"
          >
            <Filter className="h-4 w-4" strokeWidth={2} />
          </button>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-40 rounded-[6px] border border-[#E5E7EB] bg-[#F8F9FB] pl-8 pr-3 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
              <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Student
              </th>
              <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Program
              </th>
              <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Level
              </th>
              <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Status
              </th>
              <th className="px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr
                key={student.id}
                className="border-b border-[#E5E7EB] last:border-b-0 transition hover:bg-[#F8F9FB]"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4ECF8] text-[12px] font-semibold text-[#683290]">
                      {initials(student.name)}
                    </div>
                    <span className="text-[14px] font-medium text-[#1A1A2E]">
                      {student.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[14px] text-[#6B7280]">
                  {student.program}
                </td>
                <td className="px-6 py-4 text-[14px] text-[#6B7280]">
                  {student.level}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-6 py-4">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#9CA3AF] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
                    aria-label={`Actions for ${student.name}`}
                  >
                    <MoreVertical className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]"
                >
                  No students match your search.
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
/*  Curriculum Widget                                                          */
/* -------------------------------------------------------------------------- */

interface CurriculumTrack {
  name: string;
  status: string;
  percentage: number;
}

export function CurriculumWidget({
  tracks,
  onEdit,
  loading,
}: {
  tracks: CurriculumTrack[];
  onEdit?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
          CEAP Curriculum
        </h4>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-[#683290] transition hover:text-[#542573]"
            aria-label="Edit curriculum"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-5">
        {loading ? (
          <div className="space-y-4">
            <div className="h-3 w-full animate-pulse rounded bg-[#E8E9F1]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[#E8E9F1]" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-[#E8E9F1]" />
          </div>
        ) : (
        <div className="space-y-4">
          {tracks.map((track) => (
            <div key={track.name}>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#1A1A2E]">
                  {track.name}
                </span>
                <span className="text-[12px] text-[#6B7280]">
                  {track.percentage}% {track.status}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F1F3F5]">
                <div
                  className="h-full rounded-full bg-[#683290] transition-all"
                  style={{ width: `${track.percentage}%` }}
                />
              </div>
            </div>
          ))}
          {tracks.length === 0 && (
            <p className="text-[13px] text-[#9CA3AF]">No courses yet.</p>
          )}
        </div>
        )}
        <Link
          href="/admin/courses/new"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[6px] border border-dashed border-[#E5E7EB] py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:border-[#683290] hover:bg-[#F4ECF8] hover:text-[#683290]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Create New Track
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Upcoming Cohort Widget                                                     */
/* -------------------------------------------------------------------------- */

export function UpcomingCohort({
  cohortName,
  registrationOpensIn,
  seats,
  department,
}: {
  cohortName: string;
  registrationOpensIn: string;
  seats: number;
  department: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
      <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] px-5 py-4">
        <Calendar className="h-4 w-4 text-[#683290]" strokeWidth={2} />
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
          Upcoming Launch
        </h4>
      </div>
      <div className="p-5">
        <p className="text-[16px] font-semibold text-[#1A1A2E]">
          {cohortName}
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280]">
          Registration opens in {registrationOpensIn}. {seats} seats allocated
          for {department}.
        </p>
        <Link
          href="/admin/cohorts"
          className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide text-[#683290] transition hover:text-[#542573]"
        >
          Manage Allocation
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Recent Certificates                                                        */
/* -------------------------------------------------------------------------- */

interface Certificate {
  id: string;
  recipientName: string;
  trackName: string;
}

export function RecentCertificates({
  certificates,
}: {
  certificates: Certificate[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-[20px] font-semibold text-[#1A1A2E]">
          Recent Certificates Issued
        </h3>
        <button className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]">
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          Batch Issue
        </button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="flex flex-col items-center rounded-[8px] border border-[#E5E7EB] bg-white p-6 text-center shadow-[0_1px_3px_rgba(26,26,46,0.08)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4ECF8]">
              <Trophy className="h-6 w-6 text-[#683290]" strokeWidth={1.5} />
            </div>
            <p className="mt-3 text-[13px] font-semibold text-[#1A1A2E]">
              {cert.recipientName}
            </p>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              {cert.trackName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Announcement Banner                                                        */
/* -------------------------------------------------------------------------- */

export function AnnouncementBanner({
  message,
  actionLabel = "View Toolkit",
  actionHref = "#",
  onDismiss,
}: {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[8px] bg-gradient-to-r from-[#4451A2] to-[#683290] px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-[18px]">📢</span>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-white">
          {message}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={actionHref}
          className="rounded-[6px] border border-white/30 bg-white/10 px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-white/20"
        >
          {actionLabel}
        </Link>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white/60 transition hover:text-white"
            aria-label="Dismiss announcement"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
