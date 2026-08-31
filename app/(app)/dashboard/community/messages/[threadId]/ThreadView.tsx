"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { sendMessageAction, type Message } from "../actions";
import { Loader2 } from "lucide-react";

export function ThreadView({
  threadId,
  initialMessages,
  currentUserId,
}: {
  threadId: string;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();
    function onMessageCreated(payload: { threadId: string; message: Message }) {
      if (payload.threadId !== threadId) return;
      setMessages((prev) => (prev.some((m) => m.id === payload.message.id) ? prev : [...prev, payload.message]));
    }
    socket.on("message:created", onMessageCreated);
    return () => {
      socket.off("message:created", onMessageCreated);
    };
  }, [threadId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setContent("");
    const message = await sendMessageAction(threadId, trimmed);
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    setSending(false);
  }

  return (
    <div className="flex h-full flex-col rounded-card border border-border bg-background">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderId === currentUserId ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-card px-3 py-2 text-[15px] ${
                m.senderId === currentUserId ? "bg-[#683290] text-white" : "bg-surface text-text-primary"
              }`}
            >
              {m.senderId !== currentUserId && (
                <p className="text-[13px] font-medium opacity-70">{m.sender.name ?? m.sender.email}</p>
              )}
              <p>{m.content}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-[13px] text-text-secondary">Say hello 👋</p>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="flex items-center gap-2 rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
        >
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
