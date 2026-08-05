import { getHardcodedCourse } from "@/lib/courses-data";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { LessonList } from "./LessonList";

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = getHardcodedCourse(params.courseId);
  if (!course) notFound();

  const lessons = course.lessons;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Course header */}
      <div className="rounded-card bg-gradient-brand p-8 text-white shadow-premium">
        <h1 className="text-[28px] font-semibold tracking-tight">{course.title}</h1>
        {course.description && (
          <p className="mt-2 max-w-xl text-[15px] text-white/85">{course.description}</p>
        )}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-[14px] font-medium text-white/80">
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </span>
          {course.priceCents === 0 ? (
            <span className="rounded-pill bg-white/15 px-3 py-1 text-[13px] font-medium backdrop-blur">
              Free
            </span>
          ) : (
            <span className="rounded-pill bg-white/15 px-3 py-1 text-[13px] font-medium backdrop-blur">
              {(course.priceCents / 100).toFixed(2)} {course.currency}
            </span>
          )}
        </div>
      </div>

      {/* Client-side lesson list with localStorage progress */}
      <LessonList courseId={course.id} lessons={lessons} />
    </div>
  );
}
