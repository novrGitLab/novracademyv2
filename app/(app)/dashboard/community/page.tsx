import Link from "next/link";
import { getServerSession } from "next-auth";
import { BookOpen, BriefcaseBusiness, CalendarDays, GraduationCap, Hash, Mail, MessageSquare, Users, Zap, MessagesSquare } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { apiFetchSafe } from "@/lib/api";
import { Badge, Button, Card, PageHeader } from "@/components/DesignSystem";
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

  const navigation = [
    { label: "Community feed", href: "/dashboard/community", icon: MessageSquare, active: true },
    { label: "Forum", href: "/dashboard/community/forum", icon: MessagesSquare },
    { label: "Messages", href: "/dashboard/community/messages", icon: MessageSquare },
    { label: "Mentors", href: "/dashboard/community/mentors", icon: Users },
    { label: "Job board", href: "/dashboard/community/jobs", icon: BriefcaseBusiness },
    { label: "Events", href: "/dashboard/community/events", icon: CalendarDays },
    { label: "Blog", href: "/dashboard/community/blog", icon: BookOpen },
    { label: "Scholarships", href: "/dashboard/community/scholarships", icon: GraduationCap },
    { label: "Email", href: "/dashboard/community/email", icon: Mail },
    { label: "Bootcamps", href: "/dashboard/community/bootcamps", icon: Zap },
  ];

  const groupTypeLabels: Record<GroupSummary["type"], string> = {
    GENERAL: "General",
    COHORT: "Cohort",
    INTEREST: "Interest",
    COURSE: "Course",
  };

  const groupTypeVariants: Record<GroupSummary["type"], "default" | "blue" | "purple"> = {
    GENERAL: "default",
    COHORT: "blue",
    INTEREST: "purple",
    COURSE: "purple",
  };

  function ChannelLink({ group }: { group: GroupSummary }) {
    return (
      <Link
        href={`/dashboard/community/${group.id}`}
        className="group flex min-w-[220px] items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-sm text-[#1A1A2E] transition-colors hover:bg-[#683290]/10 sm:min-w-0"
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <Hash aria-hidden="true" className="h-4 w-4 shrink-0 text-[#683290]" />
          <span className="truncate">{group.name}</span>
        </span>
        <Badge variant={groupTypeVariants[group.type]} className="shrink-0 px-2 py-0.5 text-[10px]">
          {groupTypeLabels[group.type]}
        </Badge>
      </Link>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <Card padding="sm" className="h-fit">
        <aside aria-label="Community navigation">
          <nav className="space-y-1" aria-label="Community sections">
            {navigation.map(({ label, href, icon: Icon, active }) =>
              active ? (
                <Button key={href} href={href} variant="primary" size="sm" className="w-full justify-start px-3">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {label}
                </Button>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-medium text-[#1A1A2E] transition-colors hover:bg-[#683290]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#683290]"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 text-[#4451A2]" />
                  {label}
                </Link>
              ),
            )}
          </nav>

          <section className="mt-6 border-t border-[#E5E5E5] pt-5" aria-labelledby="your-channels">
            <h2 id="your-channels" className="flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-[#683290]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#683290]" />
              Your channels
            </h2>
            <div className="mt-2 space-y-1 overflow-x-auto sm:overflow-visible">
              {myGroups.map((group) => <ChannelLink key={group.id} group={group} />)}
              {myGroups.length === 0 && <p className="px-3 py-2 text-xs text-[#666666]">No channels yet.</p>}
            </div>
          </section>

          {browseGroups.length > 0 && (
            <section className="mt-6 border-t border-[#E5E5E5] pt-5" aria-labelledby="browse-channels">
              <h2 id="browse-channels" className="px-3 text-xs font-semibold uppercase tracking-wide text-[#666666]">Browse channels</h2>
              <div className="mt-2 space-y-1 overflow-x-auto sm:overflow-visible">
                {browseGroups.map((group) => <ChannelLink key={group.id} group={group} />)}
              </div>
            </section>
          )}
        </aside>
      </Card>

      <main className="min-w-0">
        <PageHeader title="Community Feed" description="Posts shared with the whole network." backLink={{ href: "/dashboard", label: "Dashboard" }} className="mb-5" />
        <div className="mt-4">
          <PostFeed initialPosts={posts} currentUserId={session!.user.id} />
        </div>
      </main>
    </div>
  );
}
