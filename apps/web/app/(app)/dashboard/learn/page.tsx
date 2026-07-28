import Link from "next/link";
import { BookOpen } from "lucide-react";
import { apiFetchSafe } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";

interface CourseListItem {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
}

export default async function LearnPage() {
  const { courses } = await apiFetchSafe<{ courses: CourseListItem[] }>("/courses?pageSize=100", { courses: [] });

  return (
    <div>
      <h1 className="text-[24px] font-semibold text-text-primary">Learn</h1>
      <p className="mt-1 text-[15px] text-text-secondary">Browse published courses.</p>

      {courses.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={BookOpen} title="No published courses yet" description="Check back soon — new courses will show up here." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/learn/${course.id}`}
              className="group rounded-card border border-border bg-background p-4 shadow-card transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-card-hover"
            >
              <p className="text-[15px] font-medium text-text-primary">{course.title}</p>
              {course.description && (
                <p className="mt-1 line-clamp-2 text-[13px] text-text-secondary">{course.description}</p>
              )}
              <p className="mt-3 text-[13px] font-medium text-blue">
                {course.priceCents === 0 ? "Free" : `${(course.priceCents / 100).toFixed(2)} ${course.currency}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
