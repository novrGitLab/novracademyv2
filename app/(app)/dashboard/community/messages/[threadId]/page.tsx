import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BackLink, Card, PageHeader } from "@/components/DesignSystem";
import { getThreadMessagesAction, getThreadsAction } from "../actions";
import { ThreadView } from "./ThreadView";

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const session = await getServerSession(authOptions);
  const [{ messages }, { threads }] = await Promise.all([
    getThreadMessagesAction(params.threadId).catch(() => ({ messages: null })),
    getThreadsAction(),
  ]);
  if (!messages) notFound();

  const thread = threads.find((t) => t.id === params.threadId);
  const other = thread?.participants.find((p) => p.id !== session!.user.id);
  const label = thread?.isGroup ? thread.name ?? "Group chat" : other?.name ?? other?.email ?? "Conversation";
  const participantLabel = thread?.isGroup ? "Group chat" : other?.name ?? other?.email ?? "Direct message";

  return (
    <div className="mx-auto flex h-[calc(100dvh-140px)] min-h-[32rem] w-full max-w-2xl flex-col px-4 py-2 sm:px-6">
      <BackLink href="/dashboard/community/messages" label="Messages" className="mb-4 shrink-0" />

      <PageHeader
        title={label}
        description={participantLabel}
        className="mb-5 shrink-0"
      />

      <Card padding="none" className="min-h-0 flex-1 overflow-hidden">
        <ThreadView threadId={params.threadId} initialMessages={messages} currentUserId={session!.user.id} />
      </Card>
    </div>
  );
}
