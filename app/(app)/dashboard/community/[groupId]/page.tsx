import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Badge, Card, PageHeader } from "@/components/DesignSystem";
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
    <div className="mx-auto max-w-2xl px-4 pb-10 sm:px-6">
      <PageHeader
        title={`# ${group.name}`}
        description={group.description ?? undefined}
        backLink={{ href: "/dashboard/community", label: "All channels" }}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue">
              {group._count.members} member{group._count.members === 1 ? "" : "s"}
            </Badge>
            <GroupJoinButton groupId={group.id} isMember={isMember} />
          </div>
        }
      />

      <Card padding="md">
        <PostFeed initialPosts={posts} groupId={group.id} currentUserId={session!.user.id} />
      </Card>
    </div>
  );
}
