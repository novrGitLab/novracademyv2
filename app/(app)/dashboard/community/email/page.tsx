"use client";

import { BackLink } from "@/components/DesignSystem";
import { Loader2, Mail } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { useState } from "react";

interface Digest {
  id: string;
  subject: string;
  preview: string;
  date: string;
  recipientCount: number;
}

export default function EmailPage() {
  const { data, loading, error } = useApi<{ digests: Digest[] }>("/newsletter/digests", { digests: [] });
  const digests = data.digests;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Email & Newsletters</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Updates, digests, and announcements delivered to your inbox.</p>
        </div>
      </div>

      {/* Quick Subscribe note */}
      <div className="mt-5 rounded-[12px] border border-[#E5E7EB] bg-gradient-to-r from-[#F4ECF8] to-[#EFF6FF] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#683290] text-white">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[#1A1A2E]">Stay in the loop</p>
            <p className="text-[13px] text-[#6B7280]">Weekly digests, scholarship alerts, and training updates.</p>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-[#9CA3AF]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading newsletters…
          </div>
        ) : error ? (
          <div className="py-12 text-center text-[14px] text-[#9CA3AF]">
            Couldn&apos;t load newsletters right now.
          </div>
        ) : digests.length === 0 ? (
          <div className="py-12 text-center">
            <Mail className="mx-auto h-10 w-10 text-[#E5E7EB]" />
            <p className="mt-3 text-[14px] text-[#6B7280]">No newsletters sent yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {digests.map((email) => (
              <div
                key={email.id}
                onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
                className="cursor-pointer rounded-[12px] border border-[#E5E7EB] bg-white p-4 transition hover:bg-[#F8F9FB]"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[14px] font-medium text-[#1A1A2E]">{email.subject}</h3>
                      <span className="shrink-0 text-[12px] text-[#9CA3AF]">
                        {email.date ? new Date(email.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[#6B7280] line-clamp-1">{email.preview}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded bg-[#F8F9FB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">
                        {email.recipientCount > 0 ? `${email.recipientCount} recipients` : "Digest"}
                      </span>
                    </div>
                    {expandedId === email.id && (
                      <div className="mt-3 border-t border-[#E5E7EB] pt-3">
                        <p className="text-[13px] text-[#6B7280]">{email.preview}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
