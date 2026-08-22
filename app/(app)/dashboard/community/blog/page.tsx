"use client";

import { useState } from "react";
import { BackLink } from "@/components/DesignSystem";
import { BookOpen, Clock, Search, Tag, User } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                  */
/* -------------------------------------------------------------------------- */

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Top 5 Phishing Trends to Watch in 2026",
    excerpt: "Phishing attacks are evolving rapidly. From AI-generated emails to deepfake voice phishing, here are the trends every security team should prepare for this year.",
    author: "Adaeze Nwosu",
    date: "2026-08-18",
    readTime: "6 min read",
    category: "Phishing",
    tags: ["Phishing", "Trends", "AI"],
    featured: true,
  },
  {
    id: "2",
    title: "Building a Security-First Culture in Your Organization",
    excerpt: "Technology alone can't protect your organization. Learn how to foster a security-conscious mindset among employees at every level.",
    author: "Tunde Bakare",
    date: "2026-08-15",
    readTime: "8 min read",
    category: "Culture",
    tags: ["Culture", "Awareness", "Training"],
  },
  {
    id: "3",
    title: "Understanding Nigeria's Data Protection Regulation (NDPR)",
    excerpt: "A practical guide to NDPR compliance — what organizations need to know about data handling, breach notification, and penalties.",
    author: "Funke Adeyemi",
    date: "2026-08-12",
    readTime: "10 min read",
    category: "Compliance",
    tags: ["NDPR", "Compliance", "Nigeria"],
  },
  {
    id: "4",
    title: "Incident Response: A Step-by-Step Playbook",
    excerpt: "When a breach happens, every minute counts. Here's a practical incident response playbook your team can implement today.",
    author: "Chidi Eze",
    date: "2026-08-10",
    readTime: "7 min read",
    category: "Incident Response",
    tags: ["IR", "Playbook", "Breach"],
  },
  {
    id: "5",
    title: "Password Security in the Age of AI",
    excerpt: "AI-powered password crackers are getting faster. Here's how to strengthen your password policies and implement modern authentication.",
    author: "Adaeze Nwosu",
    date: "2026-08-08",
    readTime: "5 min read",
    category: "Authentication",
    tags: ["Passwords", "AI", "Auth"],
  },
  {
    id: "6",
    title: "Cybersecurity Certifications Worth Getting in 2026",
    excerpt: "From CompTIA Security+ to CISSP, which certifications provide the best ROI for your career in cybersecurity?",
    author: "Emeka Obi",
    date: "2026-08-05",
    readTime: "9 min read",
    category: "Career",
    tags: ["Certifications", "Career", "Growth"],
  },
];

const categories = ["All", "Phishing", "Culture", "Compliance", "Incident Response", "Authentication", "Career"];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featured = blogPosts.find((p) => p.featured);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />

      <div className="mb-6">
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Blog</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Insights, guides, and updates from the cybersecurity community.</p>
      </div>

      {/* Featured Post */}
      {featured && (
        <div className="mb-8 rounded-[12px] border border-[#E5E7EB] bg-gradient-to-br from-[#683290] to-[#4451A2] p-6 text-white shadow-[0_4px_12px_rgba(104,50,144,0.2)]">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur">Featured</span>
          <h2 className="mt-3 font-serif text-[20px] font-semibold leading-tight">{featured.title}</h2>
          <p className="mt-2 text-[14px] text-white/80 line-clamp-2">{featured.excerpt}</p>
          <div className="mt-4 flex items-center gap-4 text-[12px] text-white/70">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {featured.author}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime}</span>
            <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {featured.category}</span>
          </div>
        </div>
      )}

      {/* Search + Categories */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search articles..."
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

      {/* Articles Grid */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <article key={post.id} className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.06)] transition hover:shadow-[0_4px_12px_rgba(26,26,46,0.1)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#F4ECF8] px-2.5 py-0.5 text-[11px] font-semibold text-[#683290]">{post.category}</span>
                  <span className="flex items-center gap-1 text-[12px] text-[#9CA3AF]"><Clock className="h-3 w-3" /> {post.readTime}</span>
                </div>
                <h3 className="mt-2 font-serif text-[16px] font-semibold text-[#1A1A2E] leading-snug">{post.title}</h3>
                <p className="mt-1.5 text-[13px] text-[#6B7280] line-clamp-2">{post.excerpt}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F4ECF8] text-[10px] font-semibold text-[#683290]">
                      {post.author.split(" ").map((n) => n[0]).join("")}
                    </span>
                    {post.author}
                  </span>
                  <span className="text-[12px] text-[#9CA3AF]">{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded bg-[#F8F9FB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">#{tag}</span>
              ))}
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-[#E5E7EB]" />
            <p className="mt-3 text-[14px] text-[#6B7280]">No articles found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
