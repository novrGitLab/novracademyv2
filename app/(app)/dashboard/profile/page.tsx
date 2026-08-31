import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetchSafe } from "@/lib/api";
import { Award, BookOpen, Check, MessageSquare, Target, TrendingUp } from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/DesignSystem";
import { ProfileActions } from "./ProfileActions";

interface GamificationData {
  xp: number;
  reputationLevel: string;
  nextLevel: string | null;
  nextLevelXp: number | null;
  levelProgressPct: number;
  badges: { slug: string; name: string; description: string | null; xpValue: number; iconUrl: string | null; awardedAt: string }[];
  recentXpLogs: { id: string; amount: number; reason: string; metadata: unknown; createdAt: string }[];
}

const LEVEL_LABELS: Record<string, string> = {
  NEWCOMER: "Newcomer",
  MEMBER: "Member",
  CONTRIBUTOR: "Contributor",
  MENTOR: "Mentor",
  LEGEND: "Legend",
};

interface GrowthResponse {
  growthRecord: { baselineScore: number; closingScore: number; growthRate: number } | null;
  latestMonthlyScore: number | null;
}
const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Org Admin",
  MANAGER: "Manager",
  LEARNER: "Learner",
  LEGACY_ALUMNI: "Alumni",
  COMMUNITY_ONLY: "Community Member",
};

const memberTypeLabels: Record<string, string> = {
  LEGACY_ALUMNI: "Legacy Alumni",
  NEW_LEARNER: "New Learner",
  COMMUNITY_ONLY: "Community Only",
};

function formatLabel(value: string | undefined, labels: Record<string, string>) {
  return value ? labels[value] ?? value.replace(/_/g, " ") : "Not specified";
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const name = user?.name?.trim() || "Novr Academy member";
  const email = user?.email || "No email available";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "N";
  const role = formatLabel(user?.role, roleLabels);
  const memberType = formatLabel(user?.memberType, memberTypeLabels);

  const gamification = await apiFetchSafe<GamificationData>("/gamification/me", {
    xp: user?.xp ?? 0,
    reputationLevel: user?.reputationLevel ?? "NEWCOMER",
    nextLevel: null,
    nextLevelXp: null,
    levelProgressPct: 100,
    badges: [],
    recentXpLogs: [],
  });

  const levelLabel = LEVEL_LABELS[gamification.reputationLevel] ?? gamification.reputationLevel;
  const xpToNext = gamification.nextLevelXp != null
    ? Math.max(0, gamification.nextLevelXp - gamification.xp)
    : null;

  const growth = user?.id
    ? await apiFetchSafe<GrowthResponse>(`/users/${user.id}/growth`, { growthRecord: null, latestMonthlyScore: null })
    : { growthRecord: null, latestMonthlyScore: null };
  const hasAssessmentData = growth.growthRecord || growth.latestMonthlyScore !== null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-1 pb-8 sm:px-2">
      <PageHeader title="Profile" description="Manage your account and view your progress." />

      <Card padding="lg">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#683290] to-[#4451A2] text-2xl font-semibold text-white shadow-[0_8px_20px_rgba(104,50,144,0.2)]" aria-label={`${name} initials`}>
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[#1A1A2E]">{name}</h2>
            <p className="mt-1 truncate text-sm text-[#666666]">{email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="purple">{role}</Badge>
              <Badge variant="blue">{memberType}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="font-serif text-2xl text-[#1A1A2E]">Level & Progress</h2>
        <p className="mt-1 text-sm text-[#666666]">Your reputation level and progress to the next tier.</p>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#683290] text-sm font-bold text-white">
            {levelLabel}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-[#1A1A2E]">{gamification.xp.toLocaleString()} XP</span>
              {gamification.nextLevel && (
                <span className="text-[#666666]">
                  {xpToNext} XP to {LEVEL_LABELS[gamification.nextLevel] ?? gamification.nextLevel}
                </span>
              )}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#683290] transition-all"
                style={{ width: `${Math.min(100, gamification.levelProgressPct)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <section aria-labelledby="progress-heading">
        <div className="mb-4">
          <h2 id="progress-heading" className="font-serif text-2xl text-[#1A1A2E]">Your progress</h2>
          <p className="mt-1 text-sm text-[#666666]">A snapshot of your Novr Academy activity.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<TrendingUp aria-hidden="true" className="h-5 w-5" />} label="XP points" value={(user?.xp ?? 0).toLocaleString()} color="red" />
          <StatCard icon={<BookOpen aria-hidden="true" className="h-5 w-5" />} label="Courses enrolled" value={user?.enrollmentCount ?? 0} color="blue" />
          <StatCard icon={<Award aria-hidden="true" className="h-5 w-5" />} label="Certificates earned" value={user?.certificateCount ?? 0} color="success" />
          <StatCard icon={<MessageSquare aria-hidden="true" className="h-5 w-5" />} label="Community posts" value={user?.postCount ?? 0} color="purple" />
        </div>
      </section>

      {gamification.badges.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="font-serif text-2xl text-[#1A1A2E]">Badges</h2>
            <p className="mt-1 text-sm text-[#666666]">Achievements you've earned.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gamification.badges.map((badge) => (
              <div
                key={badge.slug}
                className="flex min-h-[112px] flex-col items-center justify-center rounded-card border border-[#683290]/30 bg-[#683290]/10 p-3 text-center"
                title={badge.description ?? undefined}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#683290] text-white">
                  <Check className="h-5 w-5" />
                </div>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-wide text-text-secondary">{badge.name}</span>
                {badge.xpValue > 0 && <span className="mt-0.5 text-[9px] text-text-secondary">{badge.xpValue} XP</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {hasAssessmentData && (
        <section aria-labelledby="growth-heading">
          <div className="mb-4">
            <h2 id="growth-heading" className="font-serif text-2xl text-[#1A1A2E]">Assessment growth</h2>
            <p className="mt-1 text-sm text-[#666666]">Your baseline, latest monthly, and closing scores.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {growth.growthRecord && (
              <>
                <StatCard icon={<Target aria-hidden="true" className="h-5 w-5" />} label="Baseline score" value={`${growth.growthRecord.baselineScore}%`} color="blue" />
                <StatCard icon={<Award aria-hidden="true" className="h-5 w-5" />} label="Closing score" value={`${growth.growthRecord.closingScore}%`} color="success" />
                <StatCard
                  icon={<TrendingUp aria-hidden="true" className="h-5 w-5" />}
                  label="Growth rate"
                  value={`${growth.growthRecord.growthRate >= 0 ? "+" : ""}${growth.growthRecord.growthRate} pts`}
                  color={growth.growthRecord.growthRate >= 0 ? "success" : "red"}
                />
              </>
            )}
            {growth.latestMonthlyScore !== null && (
              <StatCard icon={<TrendingUp aria-hidden="true" className="h-5 w-5" />} label="Latest monthly score" value={`${growth.latestMonthlyScore}%`} color="purple" />
            )}
          </div>
        </section>
      )}

      <Card padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-[#1A1A2E]">Account details</h2>
            <p className="mt-1 text-sm text-[#666666]">Keep your account information up to date.</p>
          </div>
          <ProfileActions />
        </div>
        <dl className="mt-6 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
          <div className="grid gap-1 py-4 sm:grid-cols-2 sm:gap-4"><dt className="text-sm text-[#666666]">Full name</dt><dd className="text-sm font-medium text-[#1A1A2E]">{name}</dd></div>
          <div className="grid gap-1 py-4 sm:grid-cols-2 sm:gap-4"><dt className="text-sm text-[#666666]">Email address</dt><dd className="break-all text-sm font-medium text-[#1A1A2E]">{email}</dd></div>
          <div className="grid gap-1 py-4 sm:grid-cols-2 sm:gap-4"><dt className="text-sm text-[#666666]">Account status</dt><dd><Badge variant={user?.status === "ACTIVE" ? "success" : "red"}>{formatLabel(user?.status, {})}</Badge></dd></div>
        </dl>
      </Card>
    </div>
  );
}
