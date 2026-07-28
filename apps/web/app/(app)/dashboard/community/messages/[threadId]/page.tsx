import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-2xl flex-col">
      <Link href="/dashboard/community/messages" className="text-[13px] text-text-secondary hover:text-purple">
        ← Messages
      </Link>
      <h1 className="mt-1 text-[20px] font-semibold text-text-primary">{label}</h1>

      <div className="mt-4 flex-1 overflow-hidden">
        <ThreadView threadId={params.threadId} initialMessages={messages} currentUserId={session!.user.id} />
      </div>
    </div>
  );
}
