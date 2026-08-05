"use client";

import { useRef } from "react";
import { bulkAssignAction } from "../../actions";

export function BulkEnrollForm({ courseId }: { courseId: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const boundAction = bulkAssignAction.bind(null, courseId);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !textareaRef.current) return;
    const text = await file.text();
    // Take the first comma-separated field per line — tolerant of a
    // "email,name" style CSV or a plain one-email-per-line file.
    const emails = text
      .split(/\r?\n/)
      .map((line) => line.split(",")[0]?.trim())
      .filter((v) => v && v.includes("@"));
    textareaRef.current.value = emails.join("\n");
  }

  return (
    <form action={boundAction} className="space-y-3">
      <div>
        <label className="text-[13px] font-medium text-text-secondary">
          Emails (one per line, or upload a CSV)
        </label>
        <textarea
          ref={textareaRef}
          name="emails"
          required
          rows={5}
          placeholder={"alice@example.com\nbob@example.com"}
          className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
        />
        <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFile} className="mt-2 text-[13px]" />
      </div>
      <input
        name="validityDays"
        type="number"
        placeholder="Validity (days, blank = course default)"
        className="w-64 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
      />
      <button
        type="submit"
        className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
      >
        Bulk enroll
      </button>
    </form>
  );
}
