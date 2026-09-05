import Link from "next/link";
import { Hash, MessageSquare, Users, CalendarDays, BriefcaseBusiness } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/DesignSystem";
import { PreviewBanner } from "@/components/preview/PreviewBanner";
import { PreviewOverlay, PreviewSectionWrapper } from "@/components/preview/PreviewOverlay";

const MOCK_GROUPS = [
  { id: "1", name: "general", type: "GENERAL", members: 342 },
  { id: "2", name: "cohort-2024-a", type: "COHORT", members: 48 },
  { id: "3", name: "web-security", type: "INTEREST", members: 128 },
];

const MOCK_POSTS = [
  { id: "1", author: "Alex M.", body: "Just completed the Network Defense lab — the privilege escalation was trickier than expected! Anyone else stuck on the SUID step?", time: "2h ago" },
  { id: "2", author: "Sarah J.", body: "Sharing my notes on phishing indicators — check the headers lab, great walkthrough for beginners.", time: "5h ago" },
  { id: "3", author: "Mentor • Priya", body: "Weekly AMA tomorrow 3pm UTC — bring your questions on CEAP certification paths.", time: "1d ago" },
];

export default function PreviewCommunityPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PreviewBanner />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Card padding="sm" className="h-fit">
          <nav className="space-y-1">
            {[
              { label: "Community feed", icon: MessageSquare, active: true },
              { label: "Forum", icon: MessageSquare },
              { label: "Mentors", icon: Users },
              { label: "Job board", icon: BriefcaseBusiness },
              { label: "Events", icon: CalendarDays },
            ].map(({ label, icon: Icon, active }) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-medium ${active ? "bg-[#683290] text-white" : "text-[#1A1A2E] hover:bg-[#683290]/10"}`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-[#4451A2]"}`} /> {label}
              </div>
            ))}
          </nav>
          <section className="mt-6 border-t border-[#E5E5E5] pt-5">
            <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-[#683290]">Your channels</h2>
            <div className="mt-2 space-y-1">
              {MOCK_GROUPS.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-[8px] px-3 py-2 text-sm text-[#1A1A2E] hover:bg-[#683290]/10">
                  <span className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-[#683290]" /> {g.name}
                  </span>
                  <Badge variant="default" className="px-2 py-0.5 text-[10px]">
                    {g.type}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </Card>

        <main className="min-w-0 space-y-4">
          <PageHeader title="Community Feed" description="Posts shared with the whole network — sign in to participate." />
          <PreviewSectionWrapper
            overlay={<PreviewOverlay title="Join the conversation" description="You're viewing example posts. Sign in to post, reply, join channels, and connect with mentors." />}
          >
            <div className="space-y-3">
              {MOCK_POSTS.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-purple text-xs font-semibold text-white">
                      {post.author[0]}
                    </div>
                    <span className="font-medium text-text-primary">{post.author}</span>
                    <span className="text-xs text-text-secondary">· {post.time}</span>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-text-primary">{post.body}</p>
                  <div className="mt-3 flex gap-4 text-xs text-text-secondary">
                    <span>♡ 12</span>
                    <span>💬 4 replies</span>
                  </div>
                </Card>
              ))}
            </div>
          </PreviewSectionWrapper>
          <p className="text-center text-xs text-text-secondary">
            <Link href="/login" className="font-bold text-auth-primary hover:underline">
              Sign in
            </Link>{" "}
            to join channels and post.
          </p>
        </main>
      </div>
    </div>
  );
}
