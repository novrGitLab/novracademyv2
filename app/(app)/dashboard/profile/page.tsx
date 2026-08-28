import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Award, BookOpen, LockKeyhole, MessageSquare, Pencil, Target, TrendingUp } from "lucide-react";
import { apiFetchSafe } from "@/lib/api";
import { Badge, Button, Card, PageHeader, StatCard } from "@/components/DesignSystem";

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

      <section aria-labelledby="progress-heading">
        <div className="mb-4">
          <h2 id="progress-heading" className="font-serif text-2xl text-[#1A1A2E]">Your progress</h2>
          <p className="mt-1 text-sm text-[#666666]">A snapshot of your Novr Academy activity.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={TrendingUp} label="XP points" value={(user?.xp ?? 0).toLocaleString()} color="red" />
          <StatCard icon={BookOpen} label="Courses enrolled" value={user?.enrollmentCount ?? 0} color="blue" />
          <StatCard icon={Award} label="Certificates earned" value={user?.certificateCount ?? 0} color="success" />
          <StatCard icon={MessageSquare} label="Community posts" value={user?.postCount ?? 0} color="purple" />
        </div>
      </section>

      {hasAssessmentData && (
        <section aria-labelledby="growth-heading">
          <div className="mb-4">
            <h2 id="growth-heading" className="font-serif text-2xl text-[#1A1A2E]">Assessment growth</h2>
            <p className="mt-1 text-sm text-[#666666]">Your baseline, latest monthly, and closing scores.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {growth.growthRecord && (
              <>
                <StatCard icon={Target} label="Baseline score" value={`${growth.growthRecord.baselineScore}%`} color="blue" />
                <StatCard icon={Award} label="Closing score" value={`${growth.growthRecord.closingScore}%`} color="success" />
                <StatCard
                  icon={TrendingUp}
                  label="Growth rate"
                  value={`${growth.growthRecord.growthRate >= 0 ? "+" : ""}${growth.growthRecord.growthRate} pts`}
                  color={growth.growthRecord.growthRate >= 0 ? "success" : "red"}
                />
              </>
            )}
            {growth.latestMonthlyScore !== null && (
              <StatCard icon={TrendingUp} label="Latest monthly score" value={`${growth.latestMonthlyScore}%`} color="purple" />
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
          <Button variant="secondary" size="sm"><Pencil aria-hidden="true" className="h-4 w-4" />Edit profile</Button>
        </div>
        <dl className="mt-6 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
          <div className="grid gap-1 py-4 sm:grid-cols-2 sm:gap-4"><dt className="text-sm text-[#666666]">Full name</dt><dd className="text-sm font-medium text-[#1A1A2E]">{name}</dd></div>
          <div className="grid gap-1 py-4 sm:grid-cols-2 sm:gap-4"><dt className="text-sm text-[#666666]">Email address</dt><dd className="break-all text-sm font-medium text-[#1A1A2E]">{email}</dd></div>
          <div className="grid gap-1 py-4 sm:grid-cols-2 sm:gap-4"><dt className="text-sm text-[#666666]">Account status</dt><dd><Badge variant={user?.status === "ACTIVE" ? "success" : "red"}>{formatLabel(user?.status, {})}</Badge></dd></div>
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary"><LockKeyhole aria-hidden="true" className="h-4 w-4" />Change password</Button>
        </div>
      </Card>
    </div>
  );
}
