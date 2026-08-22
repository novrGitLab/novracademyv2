"use client";

import { useState } from "react";
import { BackLink } from "@/components/DesignSystem";
import { MessageSquare, Pin, Search, ThumbsUp, Clock, Eye, Tag, ChevronRight, Plus } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                  */
/* -------------------------------------------------------------------------- */

interface ForumPost {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  category: string;
  content: string;
  replies: number;
  views: number;
  likes: number;
  lastActivity: string;
  pinned?: boolean;
  tags: string[];
}

const forumPosts: ForumPost[] = [
  {
    id: "1",
    title: "How to prepare for CISSP exam — sharing my study plan",
    author: "Emeka Obi",
    authorRole: "Security Engineer",
    category: "Certifications",
    content: "After 6 months of preparation, I finally passed the CISSP. Here's my study plan, resources, and tips for anyone preparing...",
    replies: 47,
    views: 1280,
    likes: 89,
    lastActivity: "2 hours ago",
    pinned: true,
    tags: ["CISSP", "Study Plan", "Career"],
  },
  {
    id: "2",
    title: "Best SIEM tools for small teams in 2026?",
    author: "Sarah Jenkins",
    authorRole: "SOC Lead",
    category: "Tools & Tech",
    content: "We're a team of 5 looking for a cost-effective SIEM solution. Currently evaluating Wazuh vs Elastic SIEM vs Splunk Free...",
    replies: 32,
    views: 890,
    likes: 56,
    lastActivity: "5 hours ago",
    pinned: true,
    tags: ["SIEM", "Tools", "SOC"],
  },
  {
    id: "3",
    title: "Phishing simulation results — what click rate is normal?",
    author: "Tunde Bakare",
    authorRole: "CISO",
    category: "Phishing",
    content: "Just ran our first phishing simulation across 200 employees. Got a 23% click rate. Is this normal? How do you reduce it?",
    replies: 28,
    views: 654,
    likes: 41,
    lastActivity: "1 day ago",
    tags: ["Phishing", "Simulation", "Metrics"],
  },
  {
    id: "4",
    title: "NDPR compliance checklist for startups",
    author: "Funke Adeyemi",
    authorRole: "Data Protection Officer",
    category: "Compliance",
    content: "Compiled a practical NDPR compliance checklist based on my experience helping 15+ startups. Sharing it here for everyone...",
    replies: 19,
    views: 445,
    likes: 67,
    lastActivity: "2 days ago",
    tags: ["NDPR", "Compliance", "Startups"],
  },
  {
    id: "5",
    title: "Career transition from networking to cybersecurity — need advice",
    author: "Ngozi Okafor",
    authorRole: "Network Engineer",
    category: "Career",
    content: "I've been a network engineer for 4 years and want to transition into cybersecurity. Should I start with CompTIA Security+ or go straight to CEH?",
    replies: 35,
    views: 780,
    likes: 44,
    lastActivity: "3 days ago",
    tags: ["Career", "Transition", "Advice"],
  },
  {
    id: "6",
    title: "Free resources for learning incident response",
    author: "Chidi Eze",
    authorRole: "Incident Responder",
    category: "Resources",
    content: "Compiled a list of free IR training resources — SANS readings, LetsDefend free tier, CyberDefenders challenges, and more...",
    replies: 22,
    views: 1100,
    likes: 93,
    lastActivity: "4 days ago",
    tags: ["IR", "Free Resources", "Training"],
  },
  {
    id: "7",
    title: "Has anyone used AI for vulnerability scanning?",
    author: "Marcus Chen",
    authorRole: "Penetration Tester",
    category: "Tools & Tech",
    content: "Exploring AI-powered vuln scanners like ImmuniWeb and HackGPT. Anyone have experience with these? Worth the investment?",
    replies: 14,
    views: 320,
    likes: 28,
    lastActivity: "5 days ago",
    tags: ["AI", "Vulnerability", "Tools"],
  },
  {
    id: "8",
    title: "Building a home lab for SOC practice",
    author: "Adaeze Nwosu",
    authorRole: "Security Analyst",
    category: "Resources",
    content: "Step-by-step guide to setting up a home SOC lab with Splunk Free, Security Onion, and vulnerable VMs. Total cost: $0...",
    replies: 41,
    views: 2100,
    likes: 112,
    lastActivity: "1 week ago",
    tags: ["Home Lab", "SOC", "Practice"],
  },
];

const categories = ["All", "Certifications", "Tools & Tech", "Phishing", "Compliance", "Career", "Resources"];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ForumPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = forumPosts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinned = filtered.filter((p) => p.pinned);
  const regular = filtered.filter((p) => !p.pinned);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Forum</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Discuss, ask questions, and share knowledge with the community.</p>
        </div>
        <button className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
          <Plus className="h-3.5 w-3.5" /> New Post
        </button>
      </div>

      {/* Stats */}
      <div className="mt-5 mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-[20px] font-bold text-[#683290]">{forumPosts.length}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Threads</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-[20px] font-bold text-[#16A34A]">{forumPosts.reduce((s, p) => s + p.replies, 0)}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Replies</p>
        </div>
        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-[20px] font-bold text-[#EA580C]">{forumPosts.reduce((s, p) => s + p.views, 0).toLocaleString()}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Views</p>
        </div>
      </div>

      {/* Search + Categories */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search discussions..."
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

      {/* Pinned Posts */}
      {pinned.length > 0 && (
        <div className="mb-4">
          <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#683290]">
            <Pin className="h-3 w-3" /> Pinned
          </h3>
          <div className="mt-2 space-y-2">
            {pinned.map((post) => (
              <ForumPostCard key={post.id} post={post} expanded={expandedId === post.id} onToggle={() => setExpandedId(expandedId === post.id ? null : post.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Posts */}
      <div className="space-y-2">
        {regular.map((post) => (
          <ForumPostCard key={post.id} post={post} expanded={expandedId === post.id} onToggle={() => setExpandedId(expandedId === post.id ? null : post.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-[#E5E7EB]" />
            <p className="mt-3 text-[14px] text-[#6B7280]">No discussions found.</p>
          </div>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Post Card                                                                  */
/* -------------------------------------------------------------------------- */

function ForumPostCard({ post, expanded, onToggle }: { post: ForumPost; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`cursor-pointer rounded-[12px] border p-4 transition ${
        expanded
          ? "border-[#683290]/30 bg-[#F4ECF8]/10 shadow-[0_2px_8px_rgba(104,50,144,0.08)]"
          : "border-[#E5E7EB] bg-white hover:shadow-[0_2px_8px_rgba(26,26,46,0.06)]"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Author Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4ECF8] text-[12px] font-semibold text-[#683290]">
          {post.author.split(" ").map((n) => n[0]).join("")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {post.pinned && <Pin className="h-3 w-3 shrink-0 text-[#683290]" />}
            <h3 className="text-[14px] font-semibold text-[#1A1A2E] leading-snug">{post.title}</h3>
          </div>

          <div className="mt-1 flex items-center gap-2 text-[12px] text-[#6B7280]">
            <span className="font-medium text-[#1A1A2E]">{post.author}</span>
            <span>·</span>
            <span>{post.authorRole}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.lastActivity}</span>
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded bg-[#F4ECF8] px-2 py-0.5 text-[10px] font-semibold text-[#683290]">{post.category}</span>
            {post.tags.map((tag) => (
              <span key={tag} className="rounded bg-[#F8F9FB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">#{tag}</span>
            ))}
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="mt-3 border-t border-[#E5E7EB] pt-3">
              <p className="text-[13px] text-[#6B7280] leading-relaxed">{post.content}</p>
              <div className="mt-3 flex items-center gap-4">
                <button className="flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]">
                  <ThumbsUp className="h-3.5 w-3.5" /> {post.likes}
                </button>
                <button className="flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]">
                  <MessageSquare className="h-3.5 w-3.5" /> {post.replies} replies
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="hidden shrink-0 text-right sm:block">
          <div className="flex items-center gap-1 text-[12px] text-[#6B7280]">
            <MessageSquare className="h-3 w-3" /> {post.replies}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[12px] text-[#9CA3AF]">
            <Eye className="h-3 w-3" /> {post.views.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[12px] text-[#9CA3AF]">
            <ThumbsUp className="h-3 w-3" /> {post.likes}
          </div>
        </div>
      </div>
    </div>
  );
}
