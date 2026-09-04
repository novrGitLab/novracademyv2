"use client";

import { BackLink, EmptyState } from "@/components/DesignSystem";
import { GraduationCap } from "lucide-react";

export default function ScholarshipsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />
      <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Scholarships</h1>
      <p className="mt-1 text-[14px] text-[#6B7280]">Opportunities curated for you. New scholarships are posted here as they become available.</p>
      <EmptyState
        icon={<GraduationCap className="h-10 w-10" />}
        title="No scholarships available right now"
        description="Check back soon — new opportunities are added regularly."
        className="mt-8"
      />
    </main>
  );
}
