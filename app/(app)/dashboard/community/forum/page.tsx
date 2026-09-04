"use client";

import { useEffect, useState } from "react";
import { BackLink, Badge, Button, Card, EmptyState } from "@/components/DesignSystem";
import { Bookmark, BookmarkCheck, Eye, MessageSquare, Pin, Search, ThumbsUp, Plus } from "lucide-react";

const CATEGORIES = ["All", "Career Advice", "Technical Help", "Study Groups", "Certifications", "Compliance", "Resources", "General Discussion"];

interface ForumPost {
  id: string;
  title: string | null;
  content: string;
  category: string | null;
  tags: string[];
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  author: { id: string; name: string | null; avatarUrl: string | null };
  _count: { comments: number; reactions: number; bookmarks: number };
  viewerReaction: string | null;
  viewerBookmarked: boolean;
}

interface ForumPageData {
  posts: ForumPost[];
  total: number;
}

function useDebounce<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

async function fetchPosts(params: URLSearchParams): Promise<ForumPageData> {
  const res = await fetch(`/api/proxy/posts?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

async function bumpView(id: string) {
  await fetch(`/api/proxy/posts/${id}/view`, { method: "POST" }).catch(() => {});
}

export default function ForumPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  // Composer
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeCategory, setComposeCategory] = useState("");
  const [composeTags, setComposeTags] = useState("");
  const [composeContent, setComposeContent] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    fetchPosts(params)
      .then((data) => {
        if (cancelled) return;
        setPosts(data.posts);
        setTotal(data.total);
      })
      .catch(() => {
        if (!cancelled) { setPosts([]); setTotal(0); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch, selectedCategory]);

  const pinned = posts.filter((p) => p.isPinned);
  const regular = posts.filter((p) => !p.isPinned);

  function handleToggle(post: ForumPost) {
    const nextId = expandedId === post.id ? null : post.id;
    setExpandedId(nextId);
    if (nextId) bumpView(post.id);
  }

  function handleReaction(postId: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              viewerReaction: p.viewerReaction ? null : "LIKE",
              _count: { ...p._count, reactions: p.viewerReaction ? p._count.reactions - 1 : p._count.reactions + 1 },
            }
          : p
      )
    );
    fetch(`/api/proxy/posts/${postId}/react`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "LIKE" }) }).catch(() => {});
  }

  function handleBookmark(postId: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, viewerBookmarked: !p.viewerBookmarked } : p))
    );
    fetch(`/api/proxy/posts/${postId}/bookmark`, { method: "POST" }).catch(() => {});
  }

  async function handleSubmit() {
    const res = await fetch("/api/proxy/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: composeContent,
        title: composeTitle || undefined,
        category: composeCategory || undefined,
        tags: composeTags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      const created = (await res.json()) as ForumPost;
      setPosts((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      setComposeTitle("");
      setComposeCategory("");
      setComposeTags("");
      setComposeContent("");
      setComposeOpen(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Forum</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Discuss, ask questions, and share knowledge with the community.</p>
        </div>
        <button onClick={() => setComposeOpen((o) => !o)} className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573]">
          <Plus className="h-3.5 w-3.5" /> New Post
        </button>
      </div>

      {composeOpen && (
        <Card className="mt-5 p-4">
          <input
            value={composeTitle}
            onChange={(e) => setComposeTitle(e.target.value)}
            placeholder="Post title (optional)"
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#1A1A2E] outline-none focus:border-[#683290]"
          />
          <input
            value={composeCategory}
            onChange={(e) => setComposeCategory(e.target.value)}
            placeholder="Category (e.g. Career Advice)"
            className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#1A1A2E] outline-none focus:border-[#683290]"
          />
          <input
            value={composeTags}
            onChange={(e) => setComposeTags(e.target.value)}
            placeholder="Tags (comma-separated, e.g. CISSP, Career)"
            className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#1A1A2E] outline-none focus:border-[#683290]"
          />
          <textarea
            value={composeContent}
            onChange={(e) => setComposeContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#1A1A2E] outline-none focus:border-[#683290]"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setComposeOpen(false)} className="rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 text-[13px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">Cancel</button>
            <button onClick={handleSubmit} disabled={!composeContent.trim()} className="rounded-[8px] bg-[#683290] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#542573] disabled:opacity-50">Post</button>
          </div>
        </Card>
      )}

      <div className="mb-6 mt-5 space-y-4">
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
          {CATEGORIES.map((cat) => (
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

      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#F1F3F5] border-t-[#683290]" />
          <p className="mt-3 text-[13px] text-[#9CA3AF]">Loading discussions…</p>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={<MessageSquare className="h-10 w-10" />} title="No discussions found" description="Be the first to start one!" />
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="mb-4">
              <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#683290]">
                <Pin className="h-3 w-3" /> Pinned
              </h3>
              <div className="mt-2 space-y-2">
                {pinned.map((post) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    expanded={expandedId === post.id}
                    onToggle={() => handleToggle(post)}
                    onReaction={() => handleReaction(post.id)}
                    onBookmark={() => handleBookmark(post.id)}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            {regular.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                expanded={expandedId === post.id}
                onToggle={() => handleToggle(post)}
                onReaction={() => handleReaction(post.id)}
                onBookmark={() => handleBookmark(post.id)}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function ForumPostCard({
  post,
  expanded,
  onToggle,
  onReaction,
  onBookmark,
}: {
  post: ForumPost;
  expanded: boolean;
  onToggle: () => void;
  onReaction: () => void;
  onBookmark: () => void;
}) {
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4ECF8] text-[12px] font-semibold text-[#683290]">
          {(post.author.name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {post.isPinned && <Pin className="h-3 w-3 shrink-0 text-[#683290]" />}
            <h3 className="text-[14px] font-semibold text-[#1A1A2E]">{post.title ?? post.content.slice(0, 80)}</h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-[#6B7280]">
            <span className="font-medium text-[#1A1A2E]">{post.author.name ?? "Unknown"}</span>
            <span className="text-[11px] text-[#9CA3AF]">{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.viewCount > 0 && (
              <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {post.viewCount}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.category && <Badge variant="purple" className="text-[10px]">{post.category}</Badge>}
            {post.tags.map((tag) => (
              <Badge key={tag} variant="default" className="text-[10px]">#{tag}</Badge>
            ))}
          </div>
          {expanded && (
            <div className="mt-3 border-t border-[#E5E7EB] pt-3">
              <p className="text-[13px] text-[#6B7280] leading-relaxed">{post.content}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onReaction(); }}
                  className={`flex items-center gap-1.5 rounded-[6px] border px-3 py-1.5 text-[12px] font-medium transition ${post.viewerReaction ? "border-[#683290] bg-[#F4ECF8] text-[#683290]" : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FB]"}`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> {post._count.reactions}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onBookmark(); }}
                  className={`flex items-center gap-1.5 rounded-[6px] border px-3 py-1.5 text-[12px] font-medium transition ${post.viewerBookmarked ? "border-[#683290] bg-[#F4ECF8] text-[#683290]" : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FB]"}`}
                >
                  {post.viewerBookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  {post.viewerBookmarked ? "Bookmarked" : "Bookmark"}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <div className="flex items-center justify-end gap-1 text-[12px] text-[#6B7280]"><MessageSquare className="h-3 w-3" /> {post._count.comments}</div>
          <div className="mt-1 flex items-center justify-end gap-1 text-[12px] text-[#9CA3AF]"><Eye className="h-3 w-3" /> {post.viewCount}</div>
          <div className="mt-1 flex items-center justify-end gap-1 text-[12px] text-[#9CA3AF]"><ThumbsUp className="h-3 w-3" /> {post._count.reactions}</div>
        </div>
      </div>
    </div>
  );
}
