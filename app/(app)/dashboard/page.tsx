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
import {
  AchievementBadge,
  CertificateItem,
  CourseCard,
  FeatureCard,
  ProgressRing,
  featureCards,
  placeholderCertificates,
} from "./DashboardComponents";

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

  const overallCompletion = user?.enrollmentCount ? Math.min(100, Math.max(8, Math.round(((user.certificateCount ?? 0) / user.enrollmentCount) * 100))) : 0;
  const roleLabel = user?.role ? roleLabels[user.role] ?? user.role : undefined;

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-8">
      <section className="flex flex-col justify-between gap-8 overflow-hidden rounded-card bg-gradient-brand p-6 text-white shadow-premium sm:flex-row sm:items-center sm:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/75"><Sparkles className="h-4 w-4" /> {greeting}</div>
          <h1 className="mt-3 font-serif text-[28px] leading-tight">{greeting}, {firstName}!</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">Keep making progress toward your goals. Pick up where you left off and continue learning with Novr Academy.</p>
          <Link href="/dashboard/learn" className="mt-6 inline-flex items-center gap-2 rounded-auth bg-white px-4 py-2.5 text-xs font-bold text-auth-primary transition hover:bg-white/90">Resume Learning <BookOpen className="h-4 w-4" /></Link>
          {roleLabel && <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-white/60">{roleLabel}</p>}
        </div>
        <ProgressRing value={overallCompletion} />
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map((stat) => <StatTile key={stat.label} {...stat} />)}</section>

      <section>
        <SectionHeader title="My Courses" action={<Link href="/dashboard/learn" className="text-xs font-bold text-auth-primary hover:underline">View All</Link>} />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <CourseCard eyebrow="Module 4" title="Cybersecurity Fundamentals" progress={67} tone="blue" />
          <CourseCard eyebrow="Workshop" title="Practical Security Operations" progress={42} tone="purple" />
          <CourseCard eyebrow="Start learning" title="Explore Courses" tone="blue" />
        </div>
      </section>

      <section>
        <SectionHeader title="Learning Features" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">{featureCards.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</div>
      </section>

      <section>
        <SectionHeader title="Achievements" eyebrow="Achievements" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AchievementBadge unlocked label="First steps" /><AchievementBadge label="On a roll" /><AchievementBadge label="Knowledge seeker" /><AchievementBadge label="Goal getter" />
        </div>
        <p className="mt-3 text-center text-xs text-text-secondary">More achievements are coming soon. Keep learning to unlock them.</p>
      </section>

      <section>
        <SectionHeader title="Your Certificates" />
        <div className="mt-4 space-y-3">
          {user?.certificateCount ? Array.from({ length: user.certificateCount }, (_, index) => <CertificateItem key={index} title={placeholderCertificates[index] ?? `Novr Academy Certificate ${index + 1}`} index={index} />) : <div className="rounded-card border border-dashed border-border bg-background p-7 text-center"><Award className="mx-auto h-6 w-6 text-text-secondary" /><p className="mt-2 text-sm font-medium text-text-primary">Your certificates will appear here</p><p className="mt-1 text-xs text-text-secondary">Complete a course to earn your first certificate.</p></div>}
        </div>
      </section>

      <section>
        <SectionHeader title="More from Novr Academy" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => <Link key={action.href} href={action.href} className="flex items-center gap-3 rounded-card border border-border bg-background p-4 text-sm font-semibold text-text-primary shadow-card transition hover:border-auth-primary/30 hover:shadow-card-hover"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.gradient} text-white`}><action.icon className="h-4 w-4" /></span>{action.label}</Link>)}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: React.ReactNode }) {
  return <div className="flex items-end justify-between gap-4"><div>{eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-auth-primary">{eyebrow}</p>}<h2 className="font-serif text-2xl text-text-primary">{title}</h2></div>{action}</div>;
}

const statColors = {
  blue: { bg: "bg-[#4451A2]/10", text: "text-[#4451A2]" },
  purple: { bg: "bg-[#683290]/10", text: "text-[#683290]" },
  red: { bg: "bg-[#E82027]/10", text: "text-[#E82027]" },
  success: { bg: "bg-emerald-50", text: "text-emerald-600" },
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
