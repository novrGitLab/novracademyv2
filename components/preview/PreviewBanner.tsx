"use client";

import Link from "next/link";
import { Eye, LockKeyhole } from "lucide-react";

export function PreviewBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5 text-sm text-amber-900">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
          <Eye className="h-4 w-4" />
        </span>
        <span>
          <span className="font-semibold">Preview mode</span>
          <span className="text-amber-800"> — you&apos;re viewing a locked demo of the dashboard.</span>
          <span className="hidden sm:inline"> Example courses shown; sign in to see your own progress, certificates, and downloads.</span>
        </span>
      </div>
      <Link
        href="/login"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-auth bg-auth-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-[#542573]"
      >
        <LockKeyhole className="h-3.5 w-3.5" /> Sign in to unlock
      </Link>
    </div>
  );
}
