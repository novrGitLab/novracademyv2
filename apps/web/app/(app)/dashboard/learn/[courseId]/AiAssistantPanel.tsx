"use client";

import { useEffect, useRef, useState } from "react";
import { askAiAssistantAction, getAiConversationAction, type AiMessage } from "./actions";

export function AiAssistantPanel({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !loaded) {
      getAiConversationAction(courseId)
        .then((history) => setMessages(history.messages))
        .catch(() => setError("Could not load conversation history"))
        .finally(() => setLoaded(true));
    }
  }, [open, loaded, courseId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    const optimisticUser: AiMessage = {
      id: `pending-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setQuestion("");

    const outcome = await askAiAssistantAction(courseId, trimmed);
    setSending(false);

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setMessages((prev) => [...prev, outcome.message]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 rounded-card bg-blue px-4 py-3 text-[15px] font-medium text-white shadow-card hover:bg-blue/90"
      >
        {open ? "Close assistant" : "Ask AI"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[480px] w-[360px] flex-col rounded-card border border-border bg-background shadow-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-[15px] font-medium text-text-primary">Course assistant</p>
            <p className="text-[13px] text-text-secondary">Ask questions about this course.</p>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-[13px] text-text-secondary">
                Ask anything about this course's content — lessons, concepts, or how to approach an assignment.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-card px-3 py-2 text-[13px] ${
                  m.role === "user" ? "ml-auto bg-blue text-white" : "bg-surface text-text-primary"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>

          {error && <p className="mx-4 mb-2 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}

          <form onSubmit={handleAsk} className="flex gap-2 border-t border-border p-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-card border border-border bg-surface px-3 py-2 text-[13px] text-text-primary outline-none focus:border-blue"
            />
            <button
              type="submit"
              disabled={sending || !question.trim()}
              className="rounded-card bg-blue px-3 py-2 text-[13px] font-medium text-white hover:bg-blue/90 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
