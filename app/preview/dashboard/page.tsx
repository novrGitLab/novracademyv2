import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  Lock,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";

function ProgressRing({ progress }: { progress: number }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="#E5E5E5" strokeWidth="4" />
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke={progress === 100 ? "#16A34A" : "#683290"}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
      <text x="28" y="32" textAnchor="middle" className="text-xs font-bold fill-[#1A1A2E]">
        {progress}%
      </text>
    </svg>
  );
}

const MOCK_STATS = [
  { label: "Courses enrolled", value: 4, icon: BookOpen, color: "blue" as const },
  { label: "Certificates earned", value: 2, icon: Award, color: "success" as const },
  { label: "Community posts", value: 12, icon: MessageSquare, color: "purple" as const },
  { label: "XP points", value: 2450, icon: TrendingUp, color: "red" as const },
];

const MOCK_ENROLLMENTS = [
  {
    id: "1",
    title: "Cybersecurity Fundamentals",
    progress: 75,
    thumbnail: null,
  },
  {
    id: "2",
    title: "Network Defense Essentials",
    progress: 30,
    thumbnail: null,
  },
  {
    id: "3",
    title: "Ethical Hacking Basics",
    progress: 100,
    thumbnail: null,
  },
];

const MOCK_BADGES = [
  {
    name: "Quick Learner",
    description: "Completed your first course",
    earned: true,
    icon: "🎯",
  },
  {
    name: "Consistent",
    description: "Logged in 7 days in a row",
    earned: true,
    icon: "🔥",
  },
  {
    name: "Knowledge Seeker",
    description: "Enrolled in 3 courses",
    earned: true,
    icon: "📚",
  },
  {
    name: "Expert",
    description: "Complete all advanced courses",
    earned: false,
    icon: "⭐",
  },
];

function StatCard({ icon: Icon, label, value, color }: { icon: typeof BookOpen; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-[#1A1A2E]">{value.toLocaleString()}</p>
      <p className="text-sm text-[#666666]">{label}</p>
    </div>
  );
}

function LockedOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-[1px]">
      <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm font-medium text-[#1A1A2E]">
        <Lock className="h-4 w-4" />
        Sign in to access
      </div>
    </div>
  );
}

export default function PreviewDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4451A2] via-[#5a4a9e] to-[#683290] px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70">Preview Dashboard</p>
              <h1 className="mt-1 font-serif text-3xl font-bold">Welcome back, Alex</h1>
            </div>
            <Link
              href="/login"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#683290] transition hover:bg-white/90"
            >
              Sign in to continue
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {MOCK_STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Continue Learning */}
        <section className="mb-8">
          <h2 className="mb-4 font-serif text-xl font-semibold text-[#1A1A2E]">Continue Learning</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {MOCK_ENROLLMENTS.map((course) => (
              <div key={course.id} className="relative rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ProgressRing progress={course.progress} size={56} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1A1A2E]">{course.title}</p>
                    <p className="text-sm text-[#666666]">{course.progress}% complete</p>
                  </div>
                </div>
                <LockedOverlay />
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-8">
          <h2 className="mb-4 font-serif text-xl font-semibold text-[#1A1A2E]">Achievements</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {MOCK_BADGES.map((badge) => (
              <div
                key={badge.name}
                className={`relative rounded-xl border p-4 text-center ${
                  badge.earned ? "border-border bg-background" : "border-dashed border-gray-300 bg-gray-50 opacity-60"
                }`}
              >
                <div className="mb-2 text-3xl">{badge.icon}</div>
                <p className={`text-sm font-medium ${badge.earned ? "text-[#1A1A2E]" : "text-gray-400"}`}>
                  {badge.name}
                </p>
                <p className="mt-1 text-xs text-[#666666]">{badge.description}</p>
                {!badge.earned && <LockedOverlay />}
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="mb-4 font-serif text-xl font-semibold text-[#1A1A2E]">Explore</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              href="/preview/catalog"
              className="group relative flex items-center gap-4 rounded-xl border border-border bg-background p-5 transition hover:border-[#683290]/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-[#1A1A2E] group-hover:text-[#683290]">Browse Courses</p>
                <p className="text-sm text-[#666666]">Explore what&apos;s available to learn</p>
              </div>
            </Link>

            <Link
              href="/preview/community"
              className="group relative flex items-center gap-4 rounded-xl border border-border bg-background p-5 transition hover:border-[#683290]/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-[#1A1A2E] group-hover:text-[#683290]">Community</p>
                <p className="text-sm text-[#666666]">Posts, events, mentors & jobs</p>
              </div>
              <LockedOverlay />
            </Link>

            <Link
              href="/preview/certificates"
              className="group relative flex items-center gap-4 rounded-xl border border-border bg-background p-5 transition hover:border-[#683290]/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-[#1A1A2E] group-hover:text-[#683290]">Certificates</p>
                <p className="text-sm text-[#666666]">View and share what you&apos;ve earned</p>
              </div>
              <LockedOverlay />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#4451A2] to-[#683290] p-8 text-center text-white">
          <h3 className="font-serif text-2xl font-bold">Ready to start learning?</h3>
          <p className="mt-2 text-white/80">Create a free account and get access to all courses and features.</p>
          <Link
            href="/register"
            className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-medium text-[#683290] transition hover:bg-white/90"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  );
}
