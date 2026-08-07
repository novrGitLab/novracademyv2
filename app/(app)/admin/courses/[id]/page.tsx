"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { Skeleton } from "@/components/Skeleton";
import { updateCourseAction, deleteCourseAction, setCourseStatusAction } from "../actions";
import { LessonList } from "./LessonList";

interface Quiz {
  id: string;
  passMarkPct: number;
  maxAttempts: number;
  questions: unknown[];
}

interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "PDF" | "QUIZ" | "LIVE";
  order: number;
  minWatchPct: number;
  contentUrl: string | null;
  quiz: Quiz | null;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  priceCents: number;
  currency: string;
  passMarkPct: number;
  allowForwardScrub: boolean;
  defaultValidityDays: number | null;
  lessons: Lesson[];
}

const statusStyles: Record<CourseDetail["status"], string> = {
  DRAFT: "bg-surface text-text-secondary",
  PUBLISHED: "bg-success-light text-success",
  ARCHIVED: "bg-red-light text-red",
};

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const { data: course, loading, error, refetch } = useApi<CourseDetail | null>(`/courses/${params.id}`, null);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-3xl">
        <p className="text-[15px] text-text-secondary">Course not found.</p>
        <Link href="/admin/courses" className="mt-2 inline-block text-[13px] text-[#683290] hover:underline">
          ← Back to courses
        </Link>
      </div>
    );
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateCourseAction(course!.id, new FormData(e.currentTarget));
    refetch();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${course!.title}"? This cannot be undone.`)) return;
    await deleteCourseAction(course!.id);
  }

  async function handleTogglePublish() {
    const next = course!.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await setCourseStatusAction(course!.id, next);
    refetch();
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-semibold text-text-primary">{course.title}</h1>
            <span className={`rounded-pill px-2 py-1 text-[13px] font-medium ${statusStyles[course.status]}`}>
              {course.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/courses/${course.id}/preview`}
              className="flex items-center gap-1.5 rounded-card border border-border px-3 py-1.5 text-[13px] text-text-primary hover:border-[#683290]"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={2} />
              Preview
            </Link>
            <button
              onClick={handleTogglePublish}
              className={`rounded-card px-3 py-1.5 text-[13px] font-medium text-white ${
                course.status === "PUBLISHED" ? "bg-text-secondary hover:opacity-90" : "bg-success hover:opacity-90"
              }`}
            >
              {course.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </button>
            <Link
              href={`/admin/courses/${course.id}/enrollments`}
              className="rounded-card border border-border px-3 py-1.5 text-[13px] text-text-primary hover:border-[#683290]"
            >
              Manage enrollments
            </Link>
            <button
              onClick={handleDelete}
              className="rounded-card border border-red px-3 py-1.5 text-[13px] text-red hover:bg-red-light"
            >
              Delete course
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="mt-6 space-y-4">
          <Field label="Title" name="title" defaultValue={course.title} required />
          <Field label="Description" name="description" defaultValue={course.description ?? ""} textarea />

          <div>
            <label className="text-[13px] font-medium text-text-secondary">Thumbnail image URL</label>
            <div className="mt-1 flex items-start gap-3">
              {course.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnailUrl}
                  alt=""
                  className="h-16 w-28 shrink-0 rounded-card border border-border object-cover"
                />
              )}
              <input
                name="thumbnailUrl"
                defaultValue={course.thumbnailUrl ?? ""}
                placeholder="https://…"
                className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[13px] font-medium text-text-secondary">Status</label>
              <select
                name="status"
                defaultValue={course.status}
                className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <Field label="Price (cents)" name="priceCents" type="number" defaultValue={String(course.priceCents)} />
            <Field label="Currency" name="currency" defaultValue={course.currency} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Pass mark %" name="passMarkPct" type="number" defaultValue={String(course.passMarkPct)} />
            <Field
              label="Default validity (days)"
              name="defaultValidityDays"
              type="number"
              defaultValue={course.defaultValidityDays ? String(course.defaultValidityDays) : ""}
              placeholder="Lifetime"
            />
          </div>

          <label className="flex items-center gap-2 text-[15px] text-text-primary">
            <input
              type="checkbox"
              name="allowForwardScrub"
              defaultChecked={course.allowForwardScrub}
              className="h-4 w-4 rounded border-border"
            />
            Allow forward-scrubbing on video
          </label>

          <button
            type="submit"
            className="rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573]"
          >
            Save settings
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-[20px] font-semibold text-text-primary">Lessons</h2>
        <p className="mt-1 text-[13px] text-text-secondary">
          Lessons unlock in order. Video lessons enforce the minimum watch % below before the next lesson unlocks.
        </p>
        <LessonList courseId={course.id} lessons={course.lessons} onChange={refetch} />
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[13px] font-medium text-text-secondary">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
        />
      )}
    </div>
  );
}
