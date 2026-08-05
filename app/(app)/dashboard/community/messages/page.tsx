import Link from "next/link";
import { getServerSession } from "next-auth";
import { MessageSquare } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { getThreadsAction } from "./actions";
import { StartChatForm } from "./StartChatForm";

export default async function MessagesInboxPage() {
  const session = await getServerSession(authOptions);
  const { threads } = await getThreadsAction();

  return (
    <div className="max-w-2xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Messages</h1>

      <div className="mt-4">
        <StartChatForm />
      </div>

      <div className="mt-6 space-y-1">
        {threads.map((t) => {
          const other = t.participants.find((p) => p.id !== session!.user.id);
          const label = t.isGroup ? t.name ?? "Group chat" : other?.name ?? other?.email ?? "Unknown";
          return (
            <Link
              key={t.id}
              href={`/dashboard/community/messages/${t.id}`}
              className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3 hover:border-purple"
            >
              <div>
                <p className="text-[15px] font-medium text-text-primary">{label}</p>
                <p className="line-clamp-1 text-[13px] text-text-secondary">
                  {t.lastMessage?.content ?? "No messages yet"}
                </p>
              </div>
              {t.unreadCount > 0 && (
                <span className="rounded-pill bg-purple px-2 py-1 text-[13px] text-white">{t.unreadCount}</span>
              )}
            </Link>
          );
        })}
        {threads.length === 0 && (
          <EmptyState icon={MessageSquare} title="No conversations yet" description="Start one above to message another member." />
        )}
      </div>
    </div>
  );
}
