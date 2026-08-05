"use client";

import Link from "next/link";
import { hardcodedCourses } from "@/lib/courses-data";
import { Plus } from "lucide-react";

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

export default function AdminCoursesPage() {
  const courses: CourseListItem[] = hardcodedCourses;

  return (
    <div className="mx-auto max-w-6xl">
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

      <div className="mt-6 overflow-hidden rounded-card border border-border bg-background shadow-card">
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
              <tr key={course.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="font-medium text-text-primary hover:text-blue"
                  >
                    {course.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-pill px-2 py-0.5 text-[12px] font-medium ${statusColors[course.status] ?? ""}`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{course._count.lessons}</td>
                <td className="px-4 py-3 text-text-secondary">{course._count.enrollments}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {course.priceCents === 0
                    ? "Free"
                    : `${(course.priceCents / 100).toFixed(2)} ${course.currency}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
