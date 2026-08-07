"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { bulkArchiveCoursesAction } from "./bulkActions";

interface CourseListItem {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  priceCents: number;
  currency: string;
  _count: { lessons: number; enrollments: number };
}

const statusStyles: Record<CourseListItem["status"], string> = {
  DRAFT: "bg-surface text-text-secondary",
  PUBLISHED: "bg-success-light text-success",
  ARCHIVED: "bg-red-light text-red",
};

export function CourseBulkTable({ courses }: { courses: CourseListItem[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleArchive() {
    if (!confirm(`Archive ${selected.size} course(s)?`)) return;
    setPending(true);
    await bulkArchiveCoursesAction(Array.from(selected));
    setSelected(new Set());
    setPending(false);
    router.refresh();
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-card border border-[#683290] bg-[#F4ECF8] px-4 py-3">
          <span className="text-[13px] font-medium text-[#683290]">{selected.size} selected</span>
          <button
            disabled={pending}
            onClick={handleArchive}
            className="rounded-pill bg-white px-3 py-1 text-[13px] text-red hover:bg-surface disabled:opacity-50"
          >
            Archive selected
          </button>
        </div>
      )}

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to get started." />
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3" />
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Lessons</th>
                <th className="px-4 py-3 font-medium">Enrollments</th>
                <th className="px-4 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-t border-border hover:bg-surface">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(course.id)} onChange={() => toggle(course.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/courses/${course.id}`} className="font-medium text-text-primary hover:text-[#683290]">
                      {course.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-pill px-2 py-1 text-[13px] ${statusStyles[course.status]}`}>{course.status}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{course._count.lessons}</td>
                  <td className="px-4 py-3 text-text-secondary">{course._count.enrollments}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {course.priceCents === 0 ? "Free" : `${(course.priceCents / 100).toFixed(2)} ${course.currency}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
