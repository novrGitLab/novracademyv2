"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { TableSkeleton } from "@/components/Skeleton";
import { CourseBulkTable } from "./CourseBulkTable";

interface CourseListItem {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  priceCents: number;
  currency: string;
  _count: { lessons: number; enrollments: number };
}

export default function AdminCoursesPage() {
  const { data, loading } = useApi<{ courses: CourseListItem[] }>("/courses?pageSize=100", { courses: [] });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-text-primary">Courses</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
        >
          New course
        </Link>
      </div>

      <div className="mt-6">{loading ? <TableSkeleton /> : <CourseBulkTable courses={data.courses} />}</div>
    </div>
  );
}
