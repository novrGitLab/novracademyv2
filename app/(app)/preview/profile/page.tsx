import { Award, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/DesignSystem";
import { PreviewBanner } from "@/components/preview/PreviewBanner";
import { PreviewOverlay, PreviewSectionWrapper } from "@/components/preview/PreviewOverlay";

export default function PreviewProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PreviewBanner />
      <PageHeader title="Profile" description="Manage your account and view your progress — sign in to see yours." />

      <PreviewSectionWrapper
        overlay={<PreviewOverlay title="Profile is locked" description="You're viewing an example profile. Sign in to manage your account, view XP, badges, and certificates." />}
      >
        <div className="space-y-8 opacity-60">
          <Card padding="lg">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#683290] to-[#4451A2] text-2xl font-semibold text-white">AL</div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-[#1A1A2E]">Alex Learner</h2>
                <p className="mt-1 truncate text-sm text-[#666666]">alex@example.com</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="purple">Learner</Badge>
                  <Badge variant="blue">New Learner</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="font-serif text-2xl text-[#1A1A2E]">Level & Progress</h2>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#683290] text-sm font-bold text-white">Member</div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-[#1A1A2E]">1,250 XP</span>
                  <span className="text-[#666666]">750 XP to Contributor</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#683290]" style={{ width: "42%" }} />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<TrendingUp className="h-5 w-5" />} label="XP points" value="1,250" color="red" />
            <StatCard icon={<BookOpen className="h-5 w-5" />} label="Courses enrolled" value={4} color="blue" />
            <StatCard icon={<Award className="h-5 w-5" />} label="Certificates earned" value={2} color="success" />
            <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Community posts" value={12} color="purple" />
          </div>
        </div>
      </PreviewSectionWrapper>
    </div>
  );
}
