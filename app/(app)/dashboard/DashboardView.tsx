import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  Download,
  FlaskConical,
  LockKeyhole,
  MessageSquare,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  AchievementBadge,
  CourseCard,
  FeatureCard,
  ProgressRing,
} from "./DashboardComponents";
import { PreviewBanner } from "@/components/preview/PreviewBanner";

interface MyEnrollment {
  id: string;
  status: string;
  progressPct: number;
  completedAt: string | null;
  course: { id: string; title: string; slug: string; thumbnailUrl: string | null };
}

interface BadgeData {
  slug: string;
  name: string;
  description: string | null;
  xpValue: number;
  iconUrl: string | null;
  triggerType: string;
  earned: boolean;
  awardedAt: string | null;
}

interface MyCertificate {
  id: string;
  certUid: string;
  courseTitle: string | null;
  issuedAt: string;
  isLegacy: boolean;
  pdfUrl: string | null;
}

interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Org Admin",
  MANAGER: "Manager",
  LEARNER: "Learner",
  LEGACY_ALUMNI: "Alumni",
  COMMUNITY_ONLY: "Community Member",
};

const statColors = {
  blue: { bg: "bg-[#4451A2]/10", text: "text-[#4451A2]" },
  purple: { bg: "bg-[#683290]/10", text: "text-[#683290]" },
  red: { bg: "bg-[#E82027]/10", text: "text-[#E82027]" },
  success: { bg: "bg-emerald-50", text: "text-emerald-600" },
};

function SectionHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-auth-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-2xl text-text-primary">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  color,
  locked,
}: {
  label: string;
  value: number | string;
  icon: typeof BookOpen;
  color: keyof typeof statColors;
  locked?: boolean;
}) {
  const c = statColors[color];
  return (
    <div className="relative rounded-card border border-border bg-background p-4 shadow-card transition hover:shadow-card-hover">
      {locked && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-text-secondary">
          <LockKeyhole className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-text-secondary">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${c.bg} ${c.text}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
      <p className="mt-2 text-[26px] font-semibold tabular-nums text-text-primary">
        {locked ? "--" : typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {locked && <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Sign in to unlock</p>}
    </div>
  );
}

export interface DashboardViewProps {
  isPreview?: boolean;
  firstName: string;
  greeting: string;
  roleLabel?: string;
  isAdmin?: boolean;
  stats: { label: string; value: number; icon: typeof BookOpen; color: keyof typeof statColors }[];
  overallCompletion: number;
  enrollments: MyEnrollment[];
  previewCourses?: PublicCourse[];
  badges: BadgeData[];
  certificates: MyCertificate[];
}

export function DashboardView({
  isPreview = false,
  firstName,
  greeting,
  roleLabel,
  isAdmin = false,
  stats,
  overallCompletion,
  enrollments,
  previewCourses = [],
  badges,
  certificates,
}: DashboardViewProps) {
  const actions = [
    {
      label: "Browse courses",
      description: "Explore what's available to learn",
      href: isPreview ? "/login" : "/dashboard/learn",
      icon: BookOpen,
      gradient: "bg-gradient-blue",
    },
    {
      label: "Join the community",
      description: "Posts, events, mentors & jobs",
      href: isPreview ? "/login" : "/dashboard/community",
      icon: Users,
      gradient: "bg-gradient-purple",
    },
    {
      label: "View certificates",
      description: "See and share what you've earned",
      href: isPreview ? "/login" : "/dashboard/profile",
      icon: Award,
      gradient: "bg-gradient-blue",
    },
    ...(isAdmin && !isPreview
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
            href: isPreview ? "/login" : "/dashboard/community/jobs",
            icon: Briefcase,
            gradient: "bg-gradient-purple",
          },
        ]),
  ];

  const features = [
    {
      title: "Practice Labs",
      description: "Hands-on CTF challenges with live sandboxed desktops.",
      icon: FlaskConical,
      href: isPreview ? "/login" : "/dashboard/labs",
    },
    {
      title: "Live Sessions",
      description: "Attend scheduled classes and workshops with experts.",
      icon: Radio,
      href: isPreview ? "/login" : "/dashboard/learn",
    },
    {
      title: "Community",
      description: "Posts, events, mentors, and jobs from the network.",
      icon: Users,
      href: isPreview ? "/login" : "/dashboard/community",
    },
  ];

  // In preview, show real public courses as locked examples instead of personal enrollments
  const coursesToShow = isPreview ? previewCourses : enrollments;
  const hasCourses = isPreview ? previewCourses.length > 0 : enrollments.length > 0;

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-8">
      {isPreview && <PreviewBanner />}

      <section className="flex flex-col justify-between gap-8 overflow-hidden rounded-card bg-gradient-brand p-6 text-white shadow-premium sm:flex-row sm:items-center sm:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/75">
            <Sparkles className="h-4 w-4" /> {greeting}
          </div>
          <h1 className="mt-3 font-serif text-[28px] leading-tight">
            {greeting}, {firstName}!
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">
            Keep making progress toward your goals. Pick up where you left off and continue learning with Novr Academy.
          </p>
          {isPreview ? (
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-auth bg-white px-4 py-2.5 text-xs font-bold text-auth-primary transition hover:bg-white/90"
            >
              Sign in to start learning <BookOpen className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/dashboard/learn"
              className="mt-6 inline-flex items-center gap-2 rounded-auth bg-white px-4 py-2.5 text-xs font-bold text-auth-primary transition hover:bg-white/90"
            >
              Resume Learning <BookOpen className="h-4 w-4" />
            </Link>
          )}
          {roleLabel && <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-white/60">{roleLabel}</p>}
          {isPreview && !roleLabel && <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-white/60">Preview — Example data</p>}
        </div>
        <div className="relative">
          <ProgressRing value={isPreview ? 42 : overallCompletion} />
          {isPreview && (
            <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-auth-primary shadow">
              <LockKeyhole className="h-4 w-4" />
            </span>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} locked={isPreview} />
        ))}
      </section>

      <section>
        <SectionHeader
          title="My Courses"
          action={
            <Link
              href={isPreview ? "/login" : "/dashboard/learn"}
              className="inline-flex items-center gap-1 text-xs font-bold text-auth-primary hover:underline"
            >
              {isPreview && <LockKeyhole className="h-3 w-3" />} View All
            </Link>
          }
        />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {hasCourses ? (
            isPreview ? (
              previewCourses.map((course, index) => (
                <div key={course.id} className="relative">
                  <CourseCard
                    eyebrow="Example"
                    title={course.title}
                    progress={index === 0 ? 42 : index === 1 ? 18 : undefined}
                    tone={index % 2 === 0 ? "blue" : "purple"}
                    thumbnailUrl={course.thumbnailUrl}
                    href="/login"
                  />
                  <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-text-secondary shadow">
                    <LockKeyhole className="h-3 w-3" /> Preview
                  </span>
                </div>
              ))
            ) : (
              enrollments.map((enrollment, index) => (
                <CourseCard
                  key={enrollment.id}
                  eyebrow={enrollment.status === "COMPLETED" ? "Completed" : "Enrolled"}
                  title={enrollment.course.title}
                  progress={Math.round(enrollment.progressPct)}
                  tone={index % 2 === 0 ? "blue" : "purple"}
                  thumbnailUrl={enrollment.course.thumbnailUrl}
                  href={`/dashboard/learn/${enrollment.course.id}`}
                />
              ))
            )
          ) : (
            <CourseCard eyebrow="Start learning" title="Explore Courses" tone="blue" href={isPreview ? "/login" : "/dashboard/learn"} />
          )}
        </div>
        {isPreview && <p className="mt-3 text-center text-xs text-text-secondary">Sign in to enroll and track your own progress. These are real courses from the catalog.</p>}
        {!isPreview && enrollments.length === 0 && (
          <p className="mt-3 text-center text-xs text-text-secondary">You&apos;re not enrolled in any courses yet — browse the catalog and start learning.</p>
        )}
      </section>

      <section>
        <SectionHeader title="Learning Features" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="group relative">
              <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
              {isPreview && (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-text-secondary">
                  <LockKeyhole className="h-3.5 w-3.5" />
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Achievements" eyebrow="Achievements" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {isPreview ? (
            <>
              <AchievementBadge name="First steps" unlocked />
              <AchievementBadge name="On a roll" />
              <AchievementBadge name="Knowledge seeker" />
              <AchievementBadge name="Goal getter" />
            </>
          ) : badges.length > 0 ? (
            badges.map((badge) => (
              <AchievementBadge
                key={badge.slug}
                name={badge.name}
                description={badge.description}
                xpValue={badge.xpValue}
                earned={badge.earned}
              />
            ))
          ) : (
            <>
              <AchievementBadge name="First steps" unlocked />
              <AchievementBadge name="On a roll" />
              <AchievementBadge name="Knowledge seeker" />
              <AchievementBadge name="Goal getter" />
            </>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-text-secondary">
          {isPreview ? "Sign in to unlock achievements and earn XP as you learn." : "More achievements are coming soon. Keep learning to unlock them."}
        </p>
      </section>

      <section>
        <SectionHeader title="Your Certificates" />
        <div className="mt-4 space-y-3">
          {isPreview ? (
            <div className="rounded-card border border-dashed border-border bg-background p-7 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-secondary">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">Your certificates will appear here</p>
              <p className="mt-1 text-xs text-text-secondary">Complete a course to earn your first certificate. Sign in to get started.</p>
              <Link href="/login" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-auth-primary hover:underline">
                <LockKeyhole className="h-3 w-3" /> Sign in to view
              </Link>
            </div>
          ) : certificates.length > 0 ? (
            certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-3 rounded-card border border-border bg-background p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-auth-tint text-auth-primary">
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{cert.courseTitle ?? "Novr Academy Certificate"}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{new Date(cert.issuedAt).toLocaleDateString()}</p>
                </div>
                {cert.pdfUrl ? (
                  <a
                    href={`/api/proxy/certificates/${cert.certUid}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-auth-primary hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-text-secondary">Generating…</span>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-card border border-dashed border-border bg-background p-7 text-center">
              <Award className="mx-auto h-6 w-6 text-text-secondary" />
              <p className="mt-2 text-sm font-medium text-text-primary">Your certificates will appear here</p>
              <p className="mt-1 text-xs text-text-secondary">Complete a course to earn your first certificate.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHeader title="More from Novr Academy" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Link
              key={action.href + action.label}
              href={action.href}
              className="flex items-center gap-3 rounded-card border border-border bg-background p-4 text-sm font-semibold text-text-primary shadow-card transition hover:border-auth-primary/30 hover:shadow-card-hover"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.gradient} text-white`}>
                <action.icon className="h-4 w-4" />
              </span>
              {action.label}
              {isPreview && <LockKeyhole className="ml-auto h-3.5 w-3.5 shrink-0 text-text-secondary" />}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
