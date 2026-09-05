"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";

interface PreviewOverlayProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
}

export function PreviewOverlay({
  title = "Sign in to unlock",
  description = "You're viewing a preview. Sign in to access this content and track your progress.",
  actionLabel = "Sign in to continue",
  actionHref = "/login",
  compact = false,
}: PreviewOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center rounded-card bg-white/75 px-6 text-center backdrop-blur-[2px] ${compact ? "py-8" : "py-12"}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card ring-1 ring-border">
        <LockKeyhole className="h-6 w-6 text-auth-primary" />
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-5 text-text-secondary">{description}</p>
      <Link
        href={actionHref}
        className="mt-5 inline-flex items-center gap-1.5 rounded-auth bg-auth-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#542573]"
      >
        <LockKeyhole className="h-4 w-4" />
        {actionLabel}
      </Link>
    </div>
  );
}

export function PreviewSectionWrapper({
  children,
  overlay,
}: {
  children: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      {overlay ?? <PreviewOverlay />}
    </div>
  );
}
