import { Bell } from "lucide-react";
import { PreviewBanner } from "@/components/preview/PreviewBanner";
import { PreviewOverlay, PreviewSectionWrapper } from "@/components/preview/PreviewOverlay";

export default function PreviewNotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PreviewBanner />
      <div>
        <h1 className="text-[24px] font-semibold text-text-primary">Notifications</h1>
        <p className="mt-1 text-[15px] text-text-secondary">Course updates, community replies, and system alerts appear here.</p>
      </div>

      <PreviewSectionWrapper
        overlay={<PreviewOverlay title="Notifications are locked" description="Sign in to receive course updates, replies, and lab results. You're viewing a preview layout." />}
      >
        <div className="space-y-3">
          {[
            { title: "New course published: Advanced Phishing Defense", time: "2h ago", unread: true },
            { title: "Your lab submission was graded — 85%", time: "1d ago", unread: false },
            { title: "Mentor replied to your post in #general", time: "2d ago", unread: false },
          ].map((n) => (
            <div key={n.title} className="flex items-start gap-3 rounded-card border border-border bg-background p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{n.title}</p>
                <p className="mt-1 text-xs text-text-secondary">{n.time}</p>
              </div>
              {n.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-red" />}
            </div>
          ))}
        </div>
      </PreviewSectionWrapper>
    </div>
  );
}
