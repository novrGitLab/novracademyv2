"use client";

import { useState } from "react";
import { BackLink } from "@/components/DesignSystem";
import { Calendar, Clock, MapPin, Search, Users, Zap } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                  */
/* -------------------------------------------------------------------------- */

interface Bootcamp {
  id: string;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
  endDate: string;
  time: string;
  location: string;
  format: "online" | "hybrid" | "in-person";
  seats: number;
  enrolled: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  topics: string[];
  status: "upcoming" | "in_progress" | "completed";
  price: string;
}

const bootcamps: Bootcamp[] = [
  {
    id: "1",
    title: "SOC Analyst Bootcamp",
    description: "12-week intensive training on Security Operations Center operations. Hands-on with Splunk, SIEM deployment, alert triage, and incident escalation.",
    instructor: "Chidi Eze",
    startDate: "2026-09-08",
    endDate: "2026-11-28",
    time: "Mon–Fri, 9:00 AM – 12:00 PM WAT",
    location: "Online (Zoom + Lab Environment)",
    format: "online",
    seats: 50,
    enrolled: 38,
    level: "Intermediate",
    topics: ["SIEM", "Splunk", "Log Analysis", "Incident Response", "Alert Triage"],
    status: "upcoming",
    price: "₦150,000",
  },
  {
    id: "2",
    title: "Ethical Hacking & Penetration Testing",
    description: "8-week hands-on bootcamp covering reconnaissance, exploitation, privilege escalation, and reporting. Uses Kali Linux and real-world scenarios.",
    instructor: "Emeka Obi",
    startDate: "2026-09-15",
    endDate: "2026-11-10",
    time: "Saturdays, 10:00 AM – 2:00 PM WAT",
    location: "Hybrid (Lagos + Online)",
    format: "hybrid",
    seats: 30,
    enrolled: 22,
    level: "Intermediate",
    topics: ["Reconnaissance", "Exploitation", "Privilege Escalation", "Reporting", "Kali Linux"],
    status: "upcoming",
    price: "₦120,000",
  },
  {
    id: "3",
    title: "Cybersecurity Fundamentals for Beginners",
    description: "4-week introductory course perfect for career switchers. Covers the basics of networking, operating systems, and security principles.",
    instructor: "Adaeze Nwosu",
    startDate: "2026-08-25",
    endDate: "2026-09-19",
    time: "Tue & Thu, 6:00 PM – 8:00 PM WAT",
    location: "Online (Zoom)",
    format: "online",
    seats: 100,
    enrolled: 67,
    level: "Beginner",
    topics: ["Networking", "OS Basics", "Security Principles", "Career Pathways"],
    status: "in_progress",
    price: "Free",
  },
  {
    id: "4",
    title: "Cloud Security Masterclass",
    description: "6-week deep dive into AWS and Azure security. IAM policies, VPC security, cloud-native threat detection, and compliance automation.",
    instructor: "Tunde Bakare",
    startDate: "2026-10-06",
    endDate: "2026-11-14",
    time: "Mon & Wed, 5:00 PM – 7:30 PM WAT",
    location: "Online (Zoom + AWS/Azure Labs)",
    format: "online",
    seats: 40,
    enrolled: 15,
    level: "Advanced",
    topics: ["AWS Security", "Azure Security", "IAM", "VPC", "Compliance Automation"],
    status: "upcoming",
    price: "₦200,000",
  },
  {
    id: "5",
    title: "NDPR Compliance Workshop",
    description: "2-day intensive workshop on Nigeria Data Protection Regulation compliance. Practical guide to data mapping, DPIAs, and breach notification.",
    instructor: "Funke Adeyemi",
    startDate: "2026-08-30",
    endDate: "2026-08-31",
    time: "9:00 AM – 4:00 PM WAT",
    location: "In-Person (Lagos)",
    format: "in-person",
    seats: 25,
    enrolled: 25,
    level: "Beginner",
    topics: ["NDPR", "Data Mapping", "DPIA", "Breach Notification"],
    status: "completed",
    price: "₦50,000",
  },
];

const formatConfig = {
  online: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", label: "Online" },
  hybrid: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", label: "Hybrid" },
  "in-person": { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "In-Person" },
};

const statusConfig = {
  upcoming: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", label: "Upcoming" },
  in_progress: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "In Progress" },
  completed: { bg: "bg-[#F8F9FB]", text: "text-[#6B7280]", label: "Completed" },
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function BootcampsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");

  const filtered = bootcamps.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />

      <div className="mb-6">
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Bootcamps</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Intensive training programs to accelerate your cybersecurity career.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-[20px] font-bold text-[#2563EB]">{bootcamps.filter((b) => b.status === "upcoming").length}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Upcoming</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-[20px] font-bold text-[#16A34A]">{bootcamps.filter((b) => b.status === "in_progress").length}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">In Progress</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-[20px] font-bold text-[#6B7280]">{bootcamps.filter((b) => b.status === "completed").length}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Completed</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search bootcamps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", "upcoming", "in_progress", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                filter === f
                  ? "bg-[#683290] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FB]"
              }`}
            >
              {f === "All" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bootcamp Cards */}
      <div className="space-y-4">
        {filtered.map((b) => {
          const fc = formatConfig[b.format];
          const sc = statusConfig[b.status];
          const spotsLeft = b.seats - b.enrolled;
          const fillPct = Math.round((b.enrolled / b.seats) * 100);

          return (
            <div key={b.id} className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.06)] transition hover:shadow-[0_4px_12px_rgba(26,26,46,0.1)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${fc.bg} ${fc.text}`}>{fc.label}</span>
                    <span className="rounded-full bg-[#F4ECF8] px-2.5 py-0.5 text-[11px] font-semibold text-[#683290]">{b.level}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-[16px] font-semibold text-[#1A1A2E]">{b.title}</h3>
                  <p className="mt-1 text-[13px] text-[#6B7280] line-clamp-2">{b.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[18px] font-bold text-[#1A1A2E]">{b.price}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{new Date(b.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(b.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{b.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{b.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>{b.enrolled}/{b.seats} enrolled</span>
                </div>
              </div>

              {/* Fill Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#6B7280]">Instructor: <span className="font-medium text-[#1A1A2E]">{b.instructor}</span></span>
                  <span className={`font-medium ${spotsLeft <= 5 ? "text-[#DC2626]" : "text-[#6B7280]"}`}>
                    {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F1F3F5]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      backgroundColor: fillPct >= 90 ? "#DC2626" : fillPct >= 70 ? "#EA580C" : "#683290",
                    }}
                  />
                </div>
              </div>

              {/* Topics */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {b.topics.map((topic) => (
                  <span key={topic} className="rounded bg-[#F8F9FB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">{topic}</span>
                ))}
              </div>

              {/* Action */}
              {b.status === "upcoming" && spotsLeft > 0 && (
                <div className="mt-4">
                  <button className="flex items-center gap-1.5 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]">
                    <Zap className="h-3.5 w-3.5" /> Register Now
                  </button>
                </div>
              )}
              {b.status === "in_progress" && (
                <div className="mt-4">
                  <button className="flex items-center gap-1.5 rounded-[8px] border border-[#16A34A] bg-[#F0FDF4] px-4 py-2 text-[13px] font-medium text-[#16A34A] transition hover:bg-[#DCFCE7]">
                    Continue Learning
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Zap className="mx-auto h-10 w-10 text-[#E5E7EB]" />
            <p className="mt-3 text-[14px] text-[#6B7280]">No bootcamps found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
