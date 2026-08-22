"use client";

import { useState } from "react";
import { BackLink } from "@/components/DesignSystem";
import { CheckCircle2, Mail, Send, Settings } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                  */
/* -------------------------------------------------------------------------- */

interface Newsletter {
  id: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  category: string;
}

const newsletters: Newsletter[] = [
  {
    id: "1",
    subject: "Weekly Cybersecurity Digest — Aug 18",
    preview: "This week: new phishing techniques targeting African banks, NDPR update, and 3 free training resources.",
    date: "2026-08-18",
    read: false,
    category: "Digest",
  },
  {
    id: "2",
    subject: "Scholarship Alert: Cybersecurity Women in Tech",
    preview: "Applications are now open for the CyberNovr Foundation scholarship. Full tuition coverage for the CEAP track.",
    date: "2026-08-15",
    read: true,
    category: "Opportunity",
  },
  {
    id: "3",
    subject: "New Course Released: Advanced Threat Intelligence",
    preview: "Master threat hunting, SIEM deployment, and SOC operations. Enroll now — limited free seats available.",
    date: "2026-08-12",
    read: true,
    category: "Course",
  },
  {
    id: "4",
    subject: "Your Compliance Report is Ready",
    preview: "Your organization's monthly compliance report is now available. View your team's training progress and phishing results.",
    date: "2026-08-10",
    read: true,
    category: "Report",
  },
  {
    id: "5",
    subject: "Bootcamp Registration: SOC Analyst Training",
    preview: "12-week intensive SOC analyst bootcamp starting September. Hands-on labs with real SIEM tools.",
    date: "2026-08-08",
    read: true,
    category: "Bootcamp",
  },
  {
    id: "6",
    subject: "Monthly Security Awareness Tips — August",
    preview: "5 things your team should know this month about password hygiene, social engineering, and safe browsing.",
    date: "2026-08-01",
    read: true,
    category: "Tips",
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function EmailPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = newsletters.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = newsletters.filter((n) => !n.read).length;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Email & Newsletters</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Updates, digests, and announcements delivered to your inbox.</p>
        </div>
      </div>

      {/* Quick Subscribe */}
      <div className="mt-5 rounded-[12px] border border-[#E5E7EB] bg-gradient-to-r from-[#F4ECF8] to-[#EFF6FF] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#683290] text-white">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[#1A1A2E]">Stay in the loop</p>
            <p className="text-[13px] text-[#6B7280]">Get weekly digests, scholarship alerts, and training updates.</p>
          </div>
          <button className="shrink-0 flex items-center gap-1.5 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Subscribed
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
            filter === "all"
              ? "bg-[#683290] text-white"
              : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FB]"
          }`}
        >
          All ({newsletters.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
            filter === "unread"
              ? "bg-[#683290] text-white"
              : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FB]"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Email List */}
      <div className="mt-4 space-y-2">
        {filtered.map((email) => (
          <div
            key={email.id}
            onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
            className={`cursor-pointer rounded-[12px] border p-4 transition ${
              !email.read
                ? "border-[#683290]/20 bg-[#F4ECF8]/20"
                : "border-[#E5E7EB] bg-white hover:bg-[#F8F9FB]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!email.read ? "bg-[#683290]" : "bg-transparent"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-[14px] ${!email.read ? "font-semibold text-[#1A1A2E]" : "font-medium text-[#6B7280]"}`}>
                    {email.subject}
                  </h3>
                  <span className="shrink-0 text-[12px] text-[#9CA3AF]">
                    {new Date(email.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[#6B7280] line-clamp-1">{email.preview}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-[#F8F9FB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">{email.category}</span>
                </div>
                {expandedId === email.id && (
                  <div className="mt-3 border-t border-[#E5E7EB] pt-3">
                    <p className="text-[13px] text-[#6B7280]">{email.preview}</p>
                    <p className="mt-2 text-[12px] text-[#9CA3AF]">Full email content would appear here when connected to the email service.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Mail className="mx-auto h-10 w-10 text-[#E5E7EB]" />
            <p className="mt-3 text-[14px] text-[#6B7280]">{filter === "unread" ? "All caught up!" : "No emails yet."}</p>
          </div>
        )}
      </div>
    </main>
  );
}
