import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@novr/types";
import {
  Award,
  BookOpen,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Org Admin",
  MANAGER: "Manager",
  LEARNER: "Learner",
  LEGACY_ALUMNI: "Alumni",
  COMMUNITY_ONLY: "Community Member",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const isAdmin = Boolean(user?.role && ADMIN_ROLES.includes(user.role));
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Courses enrolled", value: user?.enrollmentCount ?? 0, icon: BookOpen, color: "blue" as const },
    { label: "Certificates earned", value: user?.certificateCount ?? 0, icon: Award, color: "success" as const },
    { label: "Community posts", value: user?.postCount ?? 0, icon: MessageSquare, color: "purple" as const },
    { label: "XP points", value: user?.xp ?? 0, icon: TrendingUp, color: "red" as const },
  ];

  const actions = [
    {
      label: "Browse courses",
      description: "Explore what's available to learn",
      href: "/dashboard/learn",
      icon: BookOpen,
      gradient: "bg-gradient-blue",
    },
    {
      label: "Join the community",
      description: "Posts, events, mentors & jobs",
      href: "/dashboard/community",
      icon: Users,
      gradient: "bg-gradient-purple",
    },
    {
      label: "View certificates",
      description: "See and share what you've earned",
      href: "/dashboard/profile",
      icon: Award,
      gradient: "bg-gradient-blue",
    },
    ...(isAdmin
      ? [
          {
            label: "Admin dashboard",
            description: "Manage courses, users & platform",
            href: "/admin",
            icon: ShieldCheck,
            gradient: "bg-gradient-purple",
          },
        ]
      : [
          {
            label: "Job board",
            description: "Opportunities from the network",
            href: "/dashboard/community/jobs",
            icon: Briefcase,
            gradient: "bg-gradient-purple",
          },
        ]),
  ];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero */}
      <div className="overflow-hidden rounded-card bg-gradient-brand p-8 text-white shadow-premium">
        <div className="flex items-center gap-2 text-[13px] font-medium text-white/80">
          <Sparkles className="h-4 w-4" strokeWidth={2.25} />
          {greeting}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-semibold tracking-tight">Welcome back, {firstName}</h1>
          {user?.role && (
            <span className="rounded-pill bg-white/15 px-3 py-1 text-[13px] font-medium backdrop-blur">
              {roleLabels[user.role] ?? user.role}
            </span>
          )}
        </div>
        <p className="mt-2 max-w-xl text-[15px] text-white/85">
          Pick up where you left off, catch up with the community, or explore something new.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="mt-8 text-[15px] font-semibold text-text-primary">Quick actions</h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-card border border-border bg-background p-5 shadow-card transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-card-hover"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.gradient} text-white shadow-card transition group-hover:scale-105`}
            >
              <action.icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <p className="mt-3 text-[15px] font-semibold text-text-primary">{action.label}</p>
            <p className="mt-1 text-[13px] text-text-secondary">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <h2 className="mt-8 text-[15px] font-semibold text-text-primary">Recent activity</h2>
      <div className="mt-3 rounded-card border border-dashed border-border bg-background p-8 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-secondary">
          <TrendingUp className="h-5 w-5" strokeWidth={2} />
        </div>
        <p className="mt-3 text-[15px] font-medium text-text-primary">Nothing to show yet</p>
        <p className="mt-1 text-[13px] text-text-secondary">
          Your enrollments, posts, and achievements will show up here as you go.
        </p>
      </div>
    </div>
  );
}

const statColors = {
  blue: { bg: "bg-blue-light", text: "text-blue" },
  purple: { bg: "bg-purple-light", text: "text-purple" },
  red: { bg: "bg-red-light", text: "text-red" },
  success: { bg: "bg-success-light", text: "text-success" },
};

function StatTile({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof BookOpen;
  color: keyof typeof statColors;
}) {
  const c = statColors[color];
  return (
    <div className="rounded-card border border-border bg-background p-4 shadow-card transition hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-text-secondary">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${c.bg} ${c.text}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
      <p className="mt-2 text-[26px] font-semibold tabular-nums text-text-primary">{value.toLocaleString()}</p>
    </div>
  );
}
