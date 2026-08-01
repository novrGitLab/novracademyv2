import Link from "next/link";
import { getPublishedCourses } from "@/lib/courses-data";

export default async function LearnPage() {
  const courses = getPublishedCourses();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Browse courses</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Explore cybersecurity courses to build your skills and earn certificates.
      </p>

      {courses.length === 0 ? (
        <div className="mt-12 rounded-card border border-dashed border-border bg-background p-12 text-center">
          <p className="text-[15px] font-medium text-text-primary">No courses available yet</p>
          <p className="mt-1 text-[13px] text-text-secondary">Check back soon — new content is on the way.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/learn/${course.id}`}
              className="group rounded-card border border-border bg-background p-5 shadow-card transition hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-card-hover"
            >
              <h3 className="text-[16px] font-semibold text-text-primary group-hover:text-blue">
                {course.title}
              </h3>
              {course.description && (
                <p className="mt-2 line-clamp-2 text-[13px] text-text-secondary">
                  {course.description}
                </p>
              )}
              <p className="mt-3 text-[14px] font-medium text-text-primary">
                {course.priceCents === 0
                  ? "Free"
                  : `${(course.priceCents / 100).toFixed(2)} ${course.currency}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
