import Link from "next/link";
import { getServerSession } from "next-auth";
import { MessageSquare } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Badge, Card, EmptyState, PageHeader } from "@/components/DesignSystem";
import { getThreadsAction } from "./actions";
import { StartChatForm } from "./StartChatForm";

function getInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

export default async function MessagesInboxPage() {
  const session = await getServerSession(authOptions);
  const { threads } = await getThreadsAction();

  return (
    <div className="w-full max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader title="Messages" description="Your conversations with other members." />

      <div className="mb-6">
        <StartChatForm />
      </div>

      <div className="space-y-3">
        {threads.map((t) => {
          const other = t.participants.find((p) => p.id !== session!.user.id);
          const label = t.isGroup ? t.name ?? "Group chat" : other?.name ?? other?.email ?? "Unknown";
          return (
            <Card key={t.id} padding="none" hover className="overflow-hidden">
              <Link
                href={`/dashboard/community/messages/${t.id}`}
                className="flex items-center gap-3 px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4451A2] sm:px-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#683290]/10 text-sm font-semibold text-[#683290]">
                  {getInitials(label)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1A1A2E]">{label}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-[#666666]">
                    {t.lastMessage?.content ?? "No messages yet"}
                  </p>
                </div>
                {t.unreadCount > 0 && <Badge variant="purple">{t.unreadCount}</Badge>}
              </Link>
            </Card>
          );
        })}
        {threads.length === 0 && (
          <EmptyState icon={<MessageSquare aria-hidden="true" className="h-6 w-6" />} title="No conversations yet" description="Start one above to message another member." />
        )}
      </div>
    </div>
  );
}
