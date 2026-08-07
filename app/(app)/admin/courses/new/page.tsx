"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createCourseAction } from "../actions";

export default function NewCoursePage() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createCourseAction(formData);
    });
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      {/* Back Link */}
      <Link
        href="/admin/courses"
        className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to courses
      </Link>

      <div className="rounded-card border border-border bg-background p-6 shadow-card">
        <header className="border-b border-border pb-4">
          <h1 className="text-[22px] font-semibold text-text-primary">New Course</h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            Set up the core course details to create the initial shell.
          </p>
        </header>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <Field label="Title" name="title" required placeholder="e.g. Advanced TypeScript Fundamentals" />
          <Field label="Description" name="description" textarea placeholder="Overview of what students will learn..." />
          <Field label="Thumbnail image URL" name="thumbnailUrl" placeholder="https://..." />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (cents)" name="priceCents" type="number" defaultValue="0" />
            <Field label="Currency" name="currency" defaultValue="USD" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Pass mark %" name="passMarkPct" type="number" defaultValue="70" />
            <Field label="Default validity (days)" name="defaultValidityDays" type="number" placeholder="Lifetime" />
          </div>

          <label className="flex items-center gap-2 pt-1 text-[15px] text-text-primary cursor-pointer select-none">
            <input
              type="checkbox"
              name="allowForwardScrub"
              className="h-4 w-4 rounded border-border text-blue focus:ring-blue"
            />
            Allow forward-scrubbing on video
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/admin/courses"
              className="rounded-card border border-border px-4 py-2 text-[14px] font-medium text-text-primary hover:bg-surface transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white shadow-card hover:bg-blue/90 disabled:opacity-50 transition-all"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Creating..." : "Create course"}
            </button>
          </div>
        </form>
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
      <label htmlFor={name} className="block text-[13px] font-medium text-text-secondary">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-blue transition-colors"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-blue transition-colors"
        />
      )}
    </div>
  );
}