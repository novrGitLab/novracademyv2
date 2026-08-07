import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CourseListItem {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  priceCents: number;
  currency: string;
  _count: { lessons: number; enrollments: number };
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-light text-yellow",
  PUBLISHED: "bg-success-light text-success",
  ARCHIVED: "bg-surface text-text-secondary",
};

export default async function AdminCoursesPage() {
  let courses: CourseListItem[] = [];

  try {
    courses = await apiFetch<CourseListItem[]>("/courses");
  } catch (error) {
    console.error("Failed to load courses:", error);
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Courses</h1>
          <p className="mt-1 text-[15px] text-text-secondary">
            Manage your course catalogue.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 rounded-card bg-blue px-4 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-blue/90 hover:shadow-card-hover"
        >
          <Plus className="h-4 w-4" /> New course
        </Link>
      </div>

      {/* Course Table or Empty State */}
      <div className="mt-6 overflow-hidden rounded-card border border-border bg-background shadow-card">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
              <BookOpen className="h-6 w-6 text-text-secondary" />
            </div>
            <h3 className="mt-3 text-[16px] font-medium text-text-primary">No courses yet</h3>
            <p className="mt-1 text-[14px] text-text-secondary">
              Create your first course shell to get started.
            </p>
            <Link
              href="/admin/courses/new"
              className="mt-4 flex items-center gap-2 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white shadow-card transition hover:bg-blue/90"
            >
              <Plus className="h-4 w-4" /> Create Course
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-4 py-3 font-medium text-text-secondary">Title</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Lessons</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Enrollments</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Price</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="font-medium text-text-primary hover:text-blue transition-colors"
                    >
                      {course.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-pill px-2 py-0.5 text-[12px] font-medium ${
                        statusColors[course.status] ?? ""
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{course._count?.lessons ?? 0}</td>
                  <td className="px-4 py-3 text-text-secondary">{course._count?.enrollments ?? 0}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {course.priceCents === 0
                      ? "Free"
                      : `${(course.priceCents / 100).toFixed(2)} ${course.currency}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}