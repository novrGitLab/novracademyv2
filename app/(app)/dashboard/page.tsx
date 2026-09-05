import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLES } from "@novr/types";
import { apiFetchSafe } from "@/lib/api";
import { Award, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { DashboardView } from "./DashboardView";

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

  const overallCompletion = user?.enrollmentCount
    ? Math.min(100, Math.max(8, Math.round(((user.certificateCount ?? 0) / user.enrollmentCount) * 100)))
    : 0;
  const roleLabel = user?.role ? roleLabels[user.role] ?? user.role : undefined;

  const [enrollments, badgesResponse, certificates] = await Promise.all([
    apiFetchSafe<MyEnrollment[]>("/me/enrollments", []),
    apiFetchSafe<{ badges: BadgeData[] }>("/gamification/badges", { badges: [] }),
    apiFetchSafe<MyCertificate[]>("/me/certificates", []),
  ]);
  const badges = badgesResponse.badges;

  return (
    <DashboardView
      firstName={firstName}
      greeting={greeting}
      roleLabel={roleLabel}
      isAdmin={isAdmin}
      stats={stats}
      overallCompletion={overallCompletion}
      enrollments={enrollments}
      badges={badges}
      certificates={certificates}
    />
  );
}
