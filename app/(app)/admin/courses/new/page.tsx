"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { createCourseAction } from "../actions";
import { ThumbnailUpload } from "@/components/ui/ThumbnailUpload";
import { CURRENCIES } from "@/lib/currency";

export default function NewCoursePage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCourseAction(formData);
      // On success the action redirects before returning.
      if (result && !result.ok) {
        setError(result.error);
      }
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
            Set up the core details — you can add lessons right after creating.
          </p>
        </header>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-card border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-[13px] text-red" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Field
              label="Title"
              name="title"
              required
              placeholder="e.g. Advanced TypeScript Fundamentals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
            <p className="mt-1 text-[12px] text-text-secondary/70">
              {title.trim() ? `${title.trim().length}/120` : "This becomes the course name learners see."}
            </p>
          </div>
          <Field label="Description" name="description" textarea placeholder="Overview of what students will learn..." />

          <div>
            <label className="block text-[13px] font-medium text-text-secondary">Thumbnail image</label>
            <ThumbnailUpload name="thumbnailUrl" />
            <p className="mt-1 text-[12px] text-text-secondary/70">Optional — shown on course cards. Images are resized automatically.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₦)" name="priceNaira" type="number" step="0.01" min="0" defaultValue="0" />
            <div>
              <label htmlFor="currency" className="block text-[13px] font-medium text-text-secondary">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue="NGN"
                className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
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
              disabled={isPending || !title.trim()}
              title={!title.trim() ? "Enter a course title first" : undefined}
              className="inline-flex items-center gap-2 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white shadow-card hover:bg-blue/90 disabled:opacity-50 transition-all"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Creating..." : "Create course"}
            </button>
          </div>
        </form>
      </div>

      {/* What happens next — sets expectations for the flow */}
      <div className="mt-4 flex items-start gap-2 rounded-card border border-border bg-surface/50 px-4 py-3 text-[13px] text-text-secondary">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <p>
          After creating, you&apos;ll land on the course page where you can add video, PDF, and slide lessons — then
          publish when you&apos;re ready.
        </p>
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
  step,
  min,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  step?: string;
  min?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  maxLength?: number;
}) {
  const classes =
    "mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-blue transition-colors";
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
          className={classes}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          step={step}
          min={min}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          className={classes}
        />
      )}
    </div>
  );
}
