import { apiFetchSafe } from "@/lib/api";
import { notFound } from "next/navigation";
import { Badge, PageHeader } from "@/components/DesignSystem";
import { LessonList } from "./LessonList";

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  lessons: Lesson[];
}

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await apiFetchSafe<Course | null>(
    `/courses/${params.courseId}`,
    null
  );

  if (!course) notFound();

  const lessons = course.lessons ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6">
      {/* Course header */}
      <div className="rounded-card bg-gradient-brand p-5 text-white shadow-premium sm:p-8">
        <PageHeader
          title={course.title}
          description={course.description ?? ""}
          backLink={{ href: "/dashboard/learn", label: "Back to courses" }}
          className="mb-0 [&_a]:!text-white [&_a]:!text-white/80 [&_a]:hover:!text-white [&_h1]:!text-white [&_p]:!text-white/85"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/25 bg-white/15 text-white backdrop-blur">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </Badge>
              <Badge className="border-white/25 bg-white/15 text-white backdrop-blur">
                {course.priceCents === 0
                  ? "Free"
                  : `${(course.priceCents / 100).toFixed(2)} ${course.currency}`}
              </Badge>
            </div>
          }
        />
        <div className="mt-5 flex items-center gap-4 text-[13px] text-white/70">
          <span>
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/50" />
          <span>{course.priceCents === 0 ? "Free access" : "Premium course"}</span>
        </div>
      </div>

      {/* Client-side lesson list with progress tracking */}
      <LessonList courseId={course.id} lessons={lessons} />
    </div>
  );
}
