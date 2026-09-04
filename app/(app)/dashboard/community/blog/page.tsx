"use client";

import { BackLink, EmptyState } from "@/components/DesignSystem";
import { BookOpen } from "lucide-react";

export default function BlogPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />
      <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Blog</h1>
      <p className="mt-1 text-[14px] text-[#6B7280]">Stories, insights, and guides from the NovrAcademy team.</p>
      <EmptyState
        icon={<BookOpen className="h-10 w-10" />}
        title="No articles published yet"
        description="New stories are coming soon — check back or subscribe to our newsletter."
        className="mt-8"
      />
    </main>
  );
}
