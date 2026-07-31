import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { getPostsAction } from "../actions";
import { PostFeed } from "../PostFeed";
import { GroupJoinButton } from "./GroupJoinButton";

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  type: "GENERAL" | "COHORT" | "INTEREST" | "COURSE";
  _count: { members: number };
  members: { user: { id: string; name: string | null; email: string } }[];
}

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const session = await getServerSession(authOptions);
  const [group, { posts }] = await Promise.all([
    apiFetch<GroupDetail>(`/groups/${params.groupId}`).catch(() => null),
    getPostsAction(params.groupId),
  ]);
  if (!group) notFound();

  const isMember = group.members.some((m) => m.user.id === session!.user.id);

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/community" className="text-[13px] text-text-secondary hover:text-purple">
        ← All channels
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary"># {group.name}</h1>
          {group.description && <p className="mt-1 text-[15px] text-text-secondary">{group.description}</p>}
          <p className="mt-1 text-[13px] text-text-secondary">{group._count.members} members</p>
        </div>
        <GroupJoinButton groupId={group.id} isMember={isMember} />
      </div>

      <div className="mt-6">
        <PostFeed initialPosts={posts} groupId={group.id} currentUserId={session!.user.id} />
      </div>
    </div>
  );
}
