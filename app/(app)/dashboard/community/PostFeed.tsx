"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import {
  addCommentAction,
  createPostAction,
  deletePostAction,
  getCommentsAction,
  reactToPostAction,
  type Comment,
  type Post,
} from "./actions";
import { Loader2 } from "lucide-react";

export function PostFeed({
  initialPosts,
  groupId,
  currentUserId,
}: {
  initialPosts: Post[];
  groupId?: string;
  currentUserId: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  // Live updates for group channels — the API broadcasts to `group:<id>`
  // on new posts/comments; the socket server already joins the caller to
  // every group they're a member of on connect.
  useEffect(() => {
    if (!groupId) return;
    const socket = getSocket();

    function onPostCreated(post: Post) {
      if (post.groupId !== groupId) return;
      setPosts((prev) => (prev.some((p) => p.id === post.id) ? prev : [post, ...prev]));
    }
    function onCommentCreated({ postId }: { postId: string }) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p))
      );
    }

    socket.on("post:created", onPostCreated);
    socket.on("comment:created", onCommentCreated);
    return () => {
      socket.off("post:created", onPostCreated);
      socket.off("comment:created", onCommentCreated);
    };
  }, [groupId]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    const post = await createPostAction(trimmed, groupId);
    setPosts((prev) => [post, ...prev]);
    setContent("");
    setPosting(false);
  }

  async function handleReact(postId: string) {
    const result = await reactToPostAction(postId, "LIKE");
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              viewerReaction: result.type,
              _count: { ...p._count, reactions: p._count.reactions + (result.reacted ? 1 : -1) },
            }
          : p
      )
    );
  }

  async function handleDelete(postId: string) {
    await deletePostAction(postId, groupId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  return (
    <div>
      <form onSubmit={handlePost} className="rounded-card border border-border bg-background p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something with the community…"
          rows={3}
          className="w-full resize-none rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={posting || !content.trim()}
          className="flex items-center gap-2 rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
          >
            {posting && <Loader2 className="h-4 w-4 animate-spin" />}
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onReact={() => handleReact(post.id)}
            onDelete={() => handleDelete(post.id)}
          />
        ))}
        {posts.length === 0 && (
          <p className="rounded-card border border-border bg-surface px-4 py-8 text-center text-[15px] text-text-secondary">
            No posts yet — be the first to share something.
          </p>
        )}
      </div>
    </div>
  );
}

function PostCard({
  post,
  currentUserId,
  onReact,
  onDelete,
}: {
  post: Post;
  currentUserId: string;
  onReact: () => void;
  onDelete: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentText, setCommentText] = useState("");

  async function toggleComments() {
    if (!showComments && comments === null) {
      const { comments: fetched } = await getCommentsAction(post.id);
      setComments(fetched);
    }
    setShowComments((v) => !v);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const comment = await addCommentAction(post.id, trimmed);
    setComments((prev) => [...(prev ?? []), comment]);
    setCommentText("");
  }

  return (
    <div className="rounded-card border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-medium text-text-primary">{post.author.name ?? post.author.email}</p>
          <p className="text-[13px] text-text-secondary">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
        {post.author.id === currentUserId && (
          <button type="button" onClick={onDelete} className="text-[13px] text-[#E82027] hover:underline">
            Delete
          </button>
        )}
      </div>

      {post.isCertificateShare && post.certificate && (
        <p className="mt-2 rounded-pill bg-[#683290]/15 px-3 py-1 text-[13px] font-semibold text-[#683290]">
          🎓 Earned a certificate in {post.certificate.course?.title}
        </p>
      )}

      <p className="mt-2 whitespace-pre-wrap text-[15px] text-text-primary">{post.content}</p>

      <div className="mt-3 flex items-center gap-4 text-[13px] text-text-secondary">
        <button
          type="button"
          onClick={onReact}
          className={post.viewerReaction ? "font-medium text-[#683290]" : "hover:text-[#683290]"}
        >
          👍 {post._count.reactions}
        </button>
        <button type="button" onClick={toggleComments} className="hover:text-[#683290]">
          💬 {post._count.comments}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {comments?.map((c) => (
            <div key={c.id} className="rounded-card bg-surface px-3 py-2">
              <p className="text-[13px] font-medium text-text-primary">{c.author.name ?? c.author.email}</p>
              <p className="text-[13px] text-text-secondary">{c.content}</p>
            </div>
          ))}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 rounded-card border border-border bg-surface px-3 py-2 text-[13px] text-text-primary outline-none focus:border-[#683290]"
            />
            <button type="submit" className="rounded-card bg-[#683290] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#542573]">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
