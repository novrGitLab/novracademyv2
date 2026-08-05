import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetchSafe } from "@/lib/api";
import { getPostsAction } from "./actions";
import { PostFeed } from "./PostFeed";

interface GroupSummary {
  id: string;
  name: string;
  type: "GENERAL" | "COHORT" | "INTEREST" | "COURSE";
  isMember: boolean;
  _count: { members: number };
}

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);
  const [{ groups }, { posts }] = await Promise.all([
    apiFetchSafe<{ groups: GroupSummary[] }>("/groups", { groups: [] }),
    getPostsAction(),
  ]);

  const myGroups = groups.filter((g) => g.isMember);
  const browseGroups = groups.filter((g) => !g.isMember);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <aside>
        <div className="mb-6 space-y-1">
          <Link
            href="/dashboard/community/messages"
            className="block rounded-card px-3 py-2 text-[15px] font-medium text-text-primary hover:bg-purple-light"
          >
            💬 Messages
          </Link>
          <Link
            href="/dashboard/community/mentors"
            className="block rounded-card px-3 py-2 text-[15px] font-medium text-text-primary hover:bg-purple-light"
          >
            🎓 Mentors
          </Link>
          <Link
            href="/dashboard/community/jobs"
            className="block rounded-card px-3 py-2 text-[15px] font-medium text-text-primary hover:bg-purple-light"
          >
            💼 Job board
          </Link>
          <Link
            href="/dashboard/community/events"
            className="block rounded-card px-3 py-2 text-[15px] font-medium text-text-primary hover:bg-purple-light"
          >
            📅 Events
          </Link>
        </div>

        <p className="text-[13px] font-medium text-text-secondary">Your channels</p>
        <div className="mt-2 space-y-1">
          {myGroups.map((g) => (
            <Link
              key={g.id}
              href={`/dashboard/community/${g.id}`}
              className="block rounded-card px-3 py-2 text-[15px] text-text-primary hover:bg-purple-light"
            >
              # {g.name}
            </Link>
          ))}
        </div>

        {browseGroups.length > 0 && (
          <>
            <p className="mt-6 text-[13px] font-medium text-text-secondary">Browse channels</p>
            <div className="mt-2 space-y-1">
              {browseGroups.map((g) => (
                <Link
                  key={g.id}
                  href={`/dashboard/community/${g.id}`}
                  className="block rounded-card px-3 py-2 text-[15px] text-text-secondary hover:bg-surface"
                >
                  # {g.name}
                </Link>
              ))}
            </div>
          </>
        )}
      </aside>

      <div>
        <h1 className="text-[24px] font-semibold text-text-primary">Community feed</h1>
        <p className="mt-1 text-[15px] text-text-secondary">Posts shared with the whole network.</p>
        <div className="mt-4">
          <PostFeed initialPosts={posts} currentUserId={session!.user.id} />
        </div>
      </div>
    </div>
  );
}
