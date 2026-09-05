import Link from "next/link";
import { BookOpen, Clock3, Layers3, LockKeyhole } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/DesignSystem";
import { apiFetchSafe } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { PreviewBanner } from "@/components/preview/PreviewBanner";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  priceCents: number;
  currency: string;
  status: string;
  _count: { lessons: number; enrollments: number };
}

export default async function PreviewLearnPage() {
  const { courses } = await apiFetchSafe<{ courses: Course[] }>("/courses/public?pageSize=12", { courses: [] });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PreviewBanner />
      <PageHeader
        title="Browse Courses"
        description="Explore cybersecurity courses — sign in to enroll and track progress."
      />

      {courses.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <BookOpen className="h-8 w-8 text-text-secondary" />
          <p className="text-sm font-medium text-text-primary">No courses published yet</p>
          <p className="text-xs text-text-secondary">Check back soon — new content is on the way.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isFree = course.priceCents === 0;
            return (
              <Card
                key={course.id}
                padding="none"
                className="group relative flex h-full flex-col overflow-hidden border-[#E5E5E5]"
              >
                <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-text-secondary shadow">
                  <LockKeyhole className="h-3 w-3" /> Preview
                </span>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
                  {course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnailUrl} alt={`Thumbnail for ${course.title}`} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4451A2] via-[#5a4a9e] to-[#683290]">
                      <BookOpen aria-hidden="true" className="h-8 w-8 text-white/70" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3">
                    <Badge variant={isFree ? "blue" : "purple"}>{isFree ? "Free" : "Premium"}</Badge>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-medium text-[#767782]">
                    {course._count.lessons} {course._count.lessons === 1 ? "lesson" : "lessons"}
                  </span>
                  <h2 className="mt-3 font-serif text-xl font-semibold leading-snug text-[#1A1A2E]">{course.title}</h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#666666]">{course.description ?? "No description available."}</p>
                  <div className="mt-5 flex items-center gap-4 text-xs text-[#767782]">
                    <span className="inline-flex items-center gap-1.5"><Layers3 className="h-3.5 w-3.5 text-[#683290]" /> Certificate included</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-[#4451A2]" /> Self-paced</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                    <Badge variant={isFree ? "blue" : "purple"}>{isFree ? "Free" : formatPrice(course.priceCents, course.currency)}</Badge>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 rounded-auth bg-auth-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-[#542573]"
                    >
                      <LockKeyhole className="h-3.5 w-3.5" /> Sign in to enroll
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
