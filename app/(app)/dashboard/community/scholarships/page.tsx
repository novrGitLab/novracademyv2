"use client";

import { useState } from "react";
import { BackLink } from "@/components/DesignSystem";
import { Award, Calendar, CheckCircle2, Clock, ExternalLink, GraduationCap, Search, Users } from "lucide-react";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                  */
/* -------------------------------------------------------------------------- */

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  amount: string;
  deadline: string;
  eligibility: string[];
  status: "open" | "closing_soon" | "closed";
  link: string;
  category: string;
}

const scholarships: Scholarship[] = [
  {
    id: "1",
    title: "Cybersecurity Women in Tech Scholarship",
    provider: "CyberNovr Foundation",
    description: "Full scholarship covering the complete CEAP certification track for women pursuing careers in cybersecurity. Includes mentorship and career placement support.",
    amount: "Full Tuition",
    deadline: "2026-09-30",
    eligibility: ["Women in tech", "Nigerian residents", "Entry to intermediate level"],
    status: "open",
    link: "#",
    category: "Women in Tech",
  },
  {
    id: "2",
    title: "NDPC Data Protection Compliance Scholarship",
    provider: "Nigeria Data Protection Commission",
    description: "Covers the cost of NDPR compliance training for employees of SMEs with less than 50 staff. Aimed at improving data protection awareness across small businesses.",
    amount: "₦250,000",
    deadline: "2026-08-25",
    eligibility: ["SME employees (< 50 staff)", "Nigerian-registered business", "Data handling roles"],
    status: "closing_soon",
    link: "#",
    category: "Compliance",
  },
  {
    id: "3",
    title: "Africa Cyber Defense Initiative Scholarship",
    provider: "African Union / ITU",
    description: "Pan-African scholarship for cybersecurity professionals. Covers advanced threat intelligence and incident response training with hands-on lab access.",
    amount: "$2,000",
    deadline: "2026-10-15",
    eligibility: ["African nationals", "2+ years in security roles", "Employer recommendation"],
    status: "open",
    link: "#",
    category: "Professional Development",
  },
  {
    id: "4",
    title: "NYSC Cybersecurity Skills Bootcamp",
    provider: "Federal Ministry of Communications",
    description: "Free 12-week intensive cybersecurity bootcamp for NYSC corps members. Covers ethical hacking, network security, and SOC analyst fundamentals.",
    amount: "Free",
    deadline: "2026-08-20",
    eligibility: ["Current NYSC corps members", "STEM-related degree", "Lagos or Abuja"],
    status: "closing_soon",
    link: "#",
    category: "Bootcamp",
  },
  {
    id: "5",
    title: "CompTIA Security+ Exam Voucher Scholarship",
    provider: "CompTIA Africa",
    description: "Covers the full cost of the CompTIA Security+ exam voucher plus 3 months of study materials for qualifying candidates.",
    amount: "$400",
    deadline: "2026-11-01",
    eligibility: ["Passed any Novr Academy course", "Scored 80%+ on practice exams", "Nigerian resident"],
    status: "open",
    link: "#",
    category: "Certification",
  },
  {
    id: "6",
    title: "Youth Cyber Resilience Fund",
    provider: "Google Africa / Novr Academy",
    description: "Joint initiative to train 1,000 young Africans in cyber resilience. Includes training, certification, and 6-month mentorship program.",
    amount: "Full Package",
    deadline: "2026-07-31",
    eligibility: ["Age 18-30", "African national", "No prior certification"],
    status: "closed",
    link: "#",
    category: "Youth",
  },
];

const categories = ["All", "Women in Tech", "Compliance", "Professional Development", "Bootcamp", "Certification", "Youth"];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ScholarshipsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = scholarships.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.provider.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const statusConfig = {
    open: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Open" },
    closing_soon: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", label: "Closing Soon" },
    closed: { bg: "bg-[#F8F9FB]", text: "text-[#6B7280]", label: "Closed" },
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />

      <div className="mb-6">
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Scholarships</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Funding opportunities for cybersecurity training and certifications.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-[20px] font-bold text-[#16A34A]">{scholarships.filter((s) => s.status === "open").length}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Open</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-[20px] font-bold text-[#EA580C]">{scholarships.filter((s) => s.status === "closing_soon").length}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Closing Soon</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-[20px] font-bold text-[#6B7280]">{scholarships.length}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Total</p>
        </div>
      </div>

      {/* Search + Categories */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                selectedCategory === cat
                  ? "bg-[#683290] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FB]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scholarships List */}
      <div className="space-y-4">
        {filtered.map((s) => {
          const sc = statusConfig[s.status];
          return (
            <div key={s.id} className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.06)] transition hover:shadow-[0_4px_12px_rgba(26,26,46,0.1)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    <span className="rounded-full bg-[#F4ECF8] px-2.5 py-0.5 text-[11px] font-semibold text-[#683290]">{s.category}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-[16px] font-semibold text-[#1A1A2E]">{s.title}</h3>
                  <p className="mt-0.5 text-[13px] font-medium text-[#683290]">{s.provider}</p>
                  <p className="mt-2 text-[13px] text-[#6B7280] line-clamp-2">{s.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[16px] font-bold text-[#1A1A2E]">{s.amount}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[#6B7280] justify-end">
                    <Calendar className="h-3 w-3" />
                    {new Date(s.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Eligibility</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {s.eligibility.map((e, i) => (
                    <span key={i} className="flex items-center gap-1 rounded bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-medium text-[#16A34A]">
                      <CheckCircle2 className="h-3 w-3" /> {e}
                    </span>
                  ))}
                </div>
              </div>

              {s.status !== "closed" && (
                <div className="mt-4">
                  <Link
                    href={`/dashboard/community/scholarships/${s.id}/apply`}
                    className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]"
                  >
                    Apply Now <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Award className="mx-auto h-10 w-10 text-[#E5E7EB]" />
            <p className="mt-3 text-[14px] text-[#6B7280]">No scholarships found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
