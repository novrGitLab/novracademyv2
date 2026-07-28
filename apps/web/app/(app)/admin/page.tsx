"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { StatCardsSkeleton } from "@/components/Skeleton";
import { StatCard } from "./StatCard";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Hash,
  Layers,
  MessageSquare,
  UserPlus,
  Users,
} from "lucide-react";

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

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminPage() {
  const { data: metrics, loading } = useApi<OverviewMetrics>("/analytics/overview", emptyMetrics);
  const totalMembers = Object.values(metrics.membersByType).reduce((a, b) => a + b, 0);
  const revenueDelta = metrics.revenueCents.thisMonth - metrics.revenueCents.lastMonth;
  const revenueTrendPct =
    metrics.revenueCents.lastMonth > 0 ? (revenueDelta / metrics.revenueCents.lastMonth) * 100 : undefined;

  return (
    <div>
      <h1 className="text-[24px] font-semibold text-text-primary">Admin overview</h1>
      <p className="mt-1 text-[15px] text-text-secondary">Live platform metrics.</p>

      <div className="mt-6">
        {loading ? (
          <StatCardsSkeleton count={7} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard
              label="Total members"
              value={totalMembers}
              icon={Users}
              color="blue"
              sublabel={`${metrics.membersByType.NEW_LEARNER ?? 0} learners · ${metrics.membersByType.LEGACY_ALUMNI ?? 0} alumni · ${metrics.membersByType.COMMUNITY_ONLY ?? 0} community`}
            />
            <StatCard
              label="Enrollments today"
              value={metrics.enrollments.today}
              icon={UserPlus}
              color="blue"
              sublabel={`${metrics.enrollments.thisMonth} this month`}
            />
            <StatCard
              label="Revenue this month"
              value={formatCents(metrics.revenueCents.thisMonth)}
              icon={DollarSign}
              color="success"
              trend={revenueTrendPct}
              sublabel={`vs ${formatCents(metrics.revenueCents.lastMonth)} last month`}
            />
            <StatCard
              label="Expiring in 30 days"
              value={metrics.expiringEnrollments30d}
              icon={Clock}
              color="red"
              sublabel="Active enrollments"
            />
            <StatCard label="Posts (24h)" value={metrics.communityPulse24h.posts} icon={MessageSquare} color="purple" />
            <StatCard label="Messages (24h)" value={metrics.communityPulse24h.messages} icon={MessageSquare} color="purple" />
            <StatCard label="Event RSVPs (24h)" value={metrics.communityPulse24h.rsvps} icon={Calendar} color="purple" />
          </div>
        )}
      </div>

      <h2 className="mt-8 text-[15px] font-semibold text-text-primary">Quick actions</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionLink href="/admin/alumni" label="Import alumni" icon={UserPlus} color="blue" />
        <ActionLink href="/admin/courses/new" label="Create course" icon={BookOpen} color="blue" />
        <ActionLink href="/admin/notifications" label="Send notification" icon={Bell} color="blue" />
        <ActionLink href="/dashboard/community/events" label="Add event" icon={Calendar} color="purple" />
      </div>

      <h2 className="mt-8 text-[15px] font-semibold text-text-primary">Manage</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionLink href="/admin/courses" label="Courses" icon={BookOpen} color="blue" />
        <ActionLink href="/admin/analytics" label="LMS analytics" icon={BarChart3} color="blue" />
        <ActionLink href="/admin/reports" label="Reports" icon={FileText} color="blue" />
        <ActionLink href="/admin/users" label="Users & bulk actions" icon={Users} color="blue" />
        <ActionLink href="/admin/cohorts" label="Cohorts" icon={Layers} color="blue" />
        <ActionLink href="/admin/alumni" label="Alumni database" icon={GraduationCap} color="blue" />
        <ActionLink href="/admin/community" label="Community channels" icon={Hash} color="purple" />
        <ActionLink href="/admin/community-analytics" label="Community analytics" icon={BarChart3} color="purple" />
        <ActionLink href="/admin/jobs" label="Job board moderation" icon={Briefcase} color="purple" />
        <ActionLink href="/admin/revenue" label="Revenue" icon={DollarSign} color="blue" />
      </div>
    </div>
  );
}

const actionColors = {
  blue: { bg: "bg-blue-light", text: "text-blue" },
  purple: { bg: "bg-purple-light", text: "text-purple" },
};

function ActionLink({
  href,
  label,
  icon: Icon,
  color,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  color: keyof typeof actionColors;
}) {
  const c = actionColors[color];
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-card border border-border bg-background p-4 shadow-card transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-card-hover"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
        <Icon className="h-4.5 w-4.5" strokeWidth={2} />
      </div>
      <span className="text-[14px] font-medium text-text-primary">{label}</span>
    </Link>
  );
}
