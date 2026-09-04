"use client";

import { BackLink, EmptyState } from "@/components/DesignSystem";
import { Zap } from "lucide-react";

export default function BootcampsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />
      <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Bootcamps</h1>
      <p className="mt-1 text-[14px] text-[#6B7280]">Intensive, multi-day programs to level up faster. Seats are limited — registration opens here.</p>
      <EmptyState
        icon={<Zap className="h-10 w-10" />}
        title="No bootcamps scheduled right now"
        description="Check back soon — new bootcamps are announced here first."
        className="mt-8"
      />
    </main>
  );
}
