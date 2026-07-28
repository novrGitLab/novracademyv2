"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchSafe } from "@/lib/api";

export interface PostAuthor {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  groupId: string | null;
  createdAt: string;
  author: PostAuthor;
  isCertificateShare: boolean;
  certificate: { id: string; certUid: string; course: { title: string } | null } | null;
  _count: { comments: number; reactions: number; bookmarks: number };
  viewerReaction: string | null;
  viewerBookmarked: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
}

export async function joinGroupAction(groupId: string) {
  await apiFetch(`/groups/${groupId}/join`, { method: "POST" });
  revalidatePath("/dashboard/community");
  revalidatePath(`/dashboard/community/${groupId}`);
}

export async function leaveGroupAction(groupId: string) {
  await apiFetch(`/groups/${groupId}/leave`, { method: "POST" });
  revalidatePath("/dashboard/community");
  revalidatePath(`/dashboard/community/${groupId}`);
}

export async function getPostsAction(groupId?: string) {
  const qs = groupId ? `?groupId=${groupId}` : "";
  return apiFetchSafe<{ posts: Post[] }>(`/posts${qs}`, { posts: [] });
}

export async function createPostAction(content: string, groupId?: string) {
  const post = await apiFetch<Post>("/posts", {
    method: "POST",
    body: JSON.stringify({ content, groupId }),
  });
  revalidatePath(groupId ? `/dashboard/community/${groupId}` : "/dashboard/community");
  return post;
}

export async function reactToPostAction(postId: string, type: string) {
  return apiFetch<{ reacted: boolean; type: string | null }>(`/posts/${postId}/react`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}

export async function bookmarkPostAction(postId: string) {
  return apiFetch<{ bookmarked: boolean }>(`/posts/${postId}/bookmark`, { method: "POST" });
}

export async function getCommentsAction(postId: string) {
  return apiFetch<{ comments: Comment[] }>(`/posts/${postId}/comments`);
}

export async function addCommentAction(postId: string, content: string) {
  return apiFetch<Comment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function deletePostAction(postId: string, groupId?: string) {
  await apiFetch(`/posts/${postId}`, { method: "DELETE" });
  revalidatePath(groupId ? `/dashboard/community/${groupId}` : "/dashboard/community");
}
