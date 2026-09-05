import { Award, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { DashboardView } from "../dashboard/DashboardView";
import { apiFetchSafe } from "@/lib/api";

interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
}

export default async function PreviewDashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Minimal live teaser: pull 3 real published courses so preview isn't hardcoded fiction.
  // Falls back to empty (DashboardView shows single Explore card) if API is down or catalog empty.
  const publicData = await apiFetchSafe<{ courses: PublicCourse[]; total: number }>(
    "/courses/public?pageSize=3",
    { courses: [], total: 0 }
  );
  const previewCourses = publicData.courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    thumbnailUrl: c.thumbnailUrl,
  }));

  const stats = [
    { label: "Courses enrolled", value: 0, icon: BookOpen, color: "blue" as const },
    { label: "Certificates earned", value: 0, icon: Award, color: "success" as const },
    { label: "Community posts", value: 0, icon: MessageSquare, color: "purple" as const },
    { label: "XP points", value: 0, icon: TrendingUp, color: "red" as const },
  ];

  return (
    <DashboardView
      isPreview
      firstName="Alex"
      greeting={greeting}
      roleLabel={undefined}
      isAdmin={false}
      stats={stats}
      overallCompletion={0}
      enrollments={[]}
      previewCourses={previewCourses}
      badges={[]}
      certificates={[]}
    />
  );
}
