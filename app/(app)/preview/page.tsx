import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  FlaskConical,
  MessageSquare,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Download,
} from "lucide-react";
import {
  AchievementBadge,
  CourseCard,
  FeatureCard,
} from "./DashboardComponents";

const MOCK_STATS = [
  { label: "Courses enrolled", value: 4, icon: BookOpen, color: "blue" as const },
  { label: "Certificates earned", value: 2, icon: Award, color: "success" as const },
  { label: "Community posts", value: 12, icon: MessageSquare, color: "purple" as const },
  { label: "XP points", value: 2450, icon: TrendingUp, color: "red" as const },
];

const MOCK_ENROLLMENTS = [
  { id: "1", status: "ENROLLED", progressPct: 75, completedAt: null, course: { id: "c1", title: "Cybersecurity Fundamentals", slug: "cybersecurity-fundamentals", thumbnailUrl: null } },
  { id: "2", status: "ENROLLED", progressPct: 30, completedAt: null, course: { id: "c2", title: "Network Defense Essentials", slug: "network-defense", thumbnailUrl: null } },
  { id: "3", status: "COMPLETED", progressPct: 100, completedAt: "2024-01-15", course: { id: "c3", title: "Ethical Hacking Basics", slug: "ethical-hacking", thumbnailUrl: null } },
];

const MOCK_BADGES = [
  { slug: "quick-learner", name: "Quick Learner", description: "Completed your first course", xpValue: 100, iconUrl: null, triggerType: "course_complete", earned: true, awardedAt: "2024-01-15" },
  { slug: "consistent", name: "Consistent", description: "Logged in 7 days in a row", xpValue: 50, iconUrl: null, triggerType: "login_streak", earned: true, awardedAt: "2024-01-20" },
  { slug: "knowledge-seeker", name: "Knowledge Seeker", description: "Enrolled in 3 courses", xpValue: 75, iconUrl: null, triggerType: "enrollment_count", earned: true, awardedAt: "2024-02-01" },
  { slug: "expert", name: "Expert", description: "Complete all advanced courses", xpValue: 500, iconUrl: null, triggerType: "advanced_complete", earned: false, awardedAt: null },
];

const MOCK_CERTIFICATES = [
  { id: "cert1", certUid: "NOVR-2024-001", courseTitle: "Ethical Hacking Basics", issuedAt: "2024-01-15", isLegacy: false, pdfUrl: null },
  { id: "cert2", certUid: "NOVR-2024-002", courseTitle: "Network Defense Essentials", issuedAt: "2024-02-20", isLegacy: false, pdfUrl: null },
];

const statColors = {
  blue: { bg: "bg-[#4451A2]/10", text: "text-[#4451A2]" },
  purple: { bg: "bg-[#683290]/10", text: "text-[#683290]" },
  red: { bg: "bg-[#E82027]/10", text: "text-[#E82027]" },
  success: { bg: "bg-emerald-50", text: "text-emerald-600" },
};

function StatTile({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof BookOpen; color: keyof typeof statColors }) {
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

function SectionHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: React.ReactNode }) {
  return <div className="flex items-end justify-between gap-4"><div>{eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-auth-primary">{eyebrow}</p>}<h2 className="font-serif text-2xl text-text-primary">{title}</h2></div>{action}</div>;
}

export default function PreviewDashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const actions = [
    { label: "Browse courses", description: "Explore what's available to learn", href: "/preview/catalog", icon: BookOpen, gradient: "bg-gradient-blue" },
    { label: "Join the community", description: "Posts, events, mentors & jobs", href: "/preview/community", icon: Users, gradient: "bg-gradient-purple" },
    { label: "View certificates", description: "See and share what you've earned", href: "/preview/certificates", icon: Award, gradient: "bg-gradient-blue" },
    { label: "Job board", description: "Opportunities from the network", href: "/preview/jobs", icon: Briefcase, gradient: "bg-gradient-purple" },
  ];

  const features = [
    { title: "Practice Labs", description: "Hands-on CTF challenges with live sandboxed desktops.", icon: FlaskConical, href: "/preview/labs" },
    { title: "Live Sessions", description: "Attend scheduled classes and workshops with experts.", icon: Radio, href: "/preview/live" },
    { title: "Community", description: "Posts, events, mentors, and jobs from the network.", icon: Users, href: "/preview/community" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-8">
      <section className="flex flex-col justify-between gap-8 overflow-hidden rounded-card bg-gradient-brand p-6 text-white shadow-premium sm:flex-row sm:items-center sm:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/75"><Sparkles className="h-4 w-4" /> Preview Mode</div>
          <h1 className="mt-3 font-serif text-[28px] leading-tight">{greeting}, Alex!</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">Keep making progress toward your goals. Pick up where you left off and continue learning with Novr Academy.</p>
          <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-auth bg-white px-4 py-2.5 text-xs font-bold text-auth-primary transition hover:bg-white/90">Sign in to start learning <BookOpen className="h-4 w-4" /></Link>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-white/60">Community Member</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
            <span className="text-3xl font-bold">42%</span>
            <div className="absolute inset-0 rounded-full border-4 border-white/30" />
          </div>
          <p className="mt-2 text-xs text-white/70">Overall Progress</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">{MOCK_STATS.map((stat) => <StatTile key={stat.label} {...stat} />)}</section>

      <section>
        <SectionHeader title="My Courses" action={<Link href="/preview/catalog" className="text-xs font-bold text-auth-primary hover:underline">View All</Link>} />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {MOCK_ENROLLMENTS.map((enrollment, index) => (
            <CourseCard
              key={enrollment.id}
              eyebrow={enrollment.status === "COMPLETED" ? "Completed" : "Enrolled"}
              title={enrollment.course.title}
              progress={Math.round(enrollment.progressPct)}
              tone={index % 2 === 0 ? "blue" : "purple"}
              thumbnailUrl={enrollment.course.thumbnailUrl}
              href={`/dashboard/learn/${enrollment.course.id}`}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Learning Features" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="group">
              <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Achievements" eyebrow="Achievements" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MOCK_BADGES.map((badge) => (
            <AchievementBadge
              key={badge.slug}
              name={badge.name}
              description={badge.description}
              xpValue={badge.xpValue}
              earned={badge.earned}
            />
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-text-secondary">Sign in to track your achievements and progress.</p>
      </section>

      <section>
        <SectionHeader title="Your Certificates" />
        <div className="mt-4 space-y-3">
          {MOCK_CERTIFICATES.map((cert) => (
            <div key={cert.id} className="flex items-center gap-3 rounded-card border border-border bg-background p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-auth-tint text-auth-primary">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {cert.courseTitle ?? "Novr Academy Certificate"}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-auth-tint px-2 py-1 text-xs font-medium text-auth-primary">
                🔒 Sign in to download
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="More from Novr Academy" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => <Link key={action.href} href={action.href} className="flex items-center gap-3 rounded-card border border-border bg-background p-4 text-sm font-semibold text-text-primary shadow-card transition hover:border-auth-primary/30 hover:shadow-card-hover"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.gradient} text-white`}><action.icon className="h-4 w-4" /></span>{action.label}</Link>)}
        </div>
      </section>

      <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 p-4 text-center">
        <p className="text-sm font-medium text-amber-800">This is a preview of the dashboard. <Link href="/login" className="underline">Sign in</Link> to see your actual courses, progress, and achievements.</p>
      </div>
    </div>
  );
}
