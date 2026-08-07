"use client";

import Link from "next/link";
import { useState } from "react";
import { hardcodedCourses } from "@/lib/courses-data";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { Archive, Copy, Edit, MoreVertical, Plus, Send, Trash2 } from "lucide-react";

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
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Courses</h1>
          <p className="mt-1 text-[15px] text-text-secondary">Manage your course catalogue.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/courses/assign" className="flex items-center gap-2 rounded-card border border-border bg-white px-4 py-2.5 text-[14px] font-medium text-text-secondary shadow-card transition hover:bg-surface hover:text-text-primary">
            <Send className="h-4 w-4" /> Assign Course
          </Link>
          <Link href="/admin/courses/new" className="flex items-center gap-2 rounded-card bg-[#683290] px-4 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-[#542573] hover:shadow-card-hover">
            <Plus className="h-4 w-4" /> New course
          </Link>
        </div>
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
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border last:border-0 hover:bg-surface/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/courses/${course.id}`} className="font-medium text-text-primary hover:text-[#683290]">{course.title}</Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-pill px-2 py-0.5 text-[12px] font-medium ${statusColors[course.status] ?? ""}`}>{course.status}</span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{course._count.lessons}</td>
                <td className="px-4 py-3 text-text-secondary">{course._count.enrollments}</td>
                <td className="px-4 py-3 text-text-secondary">{course.priceCents === 0 ? "Free" : `${(course.priceCents / 100).toFixed(2)} ${course.currency}`}</td>
                <td className="px-4 py-3">
                  <DropdownMenu
                    trigger={<button className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#9CA3AF] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"><MoreVertical className="h-4 w-4" strokeWidth={2} /></button>}
                    items={[
                      { label: "Edit", icon: Edit, onClick: () => window.location.href = `/admin/courses/${course.id}` },
                      { label: "Duplicate", icon: Copy, onClick: () => { setToast({ message: `"${course.title}" duplicated`, type: "success" }); } },
                      { label: course.status === "ARCHIVED" ? "Unarchive" : "Archive", icon: Archive, onClick: () => { setSelectedCourse(course); setShowArchive(true); } },
                      { label: "Delete", icon: Trash2, danger: true, onClick: () => { setSelectedCourse(course); setShowDelete(true); } },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => { setToast({ message: `"${selectedCourse?.title}" deleted`, type: "success" }); setShowDelete(false); }} title="Delete Course" message={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone.`} confirmLabel="Delete" variant="danger" />

      <ConfirmDialog open={showArchive} onClose={() => setShowArchive(false)} onConfirm={() => { setToast({ message: `"${selectedCourse?.title}" archived`, type: "success" }); setShowArchive(false); }} title="Archive Course" message={`Archive "${selectedCourse?.title}"? It will no longer be visible to learners.`} confirmLabel="Archive" variant="warning" />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
