"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { isLessonCompleted, markLessonComplete } from "@/lib/progress";

export function LessonContent({
  courseId,
  lessonId,
  content,
}: {
  courseId: string;
  lessonId: string;
  content: string;
}) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isLessonCompleted(courseId, lessonId));
  }, [courseId, lessonId]);

  function handleMarkComplete() {
    if (!completed) {
      markLessonComplete(courseId, lessonId);
      setCompleted(true);
    }
  }

  return (
    <div>
      {/* Markdown content rendered as HTML */}
      <div
        className="prose prose-slate max-w-none rounded-card border border-border bg-background p-6 shadow-card
          prose-headings:text-text-primary prose-h2:text-[20px] prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-[16px] prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-[14px] prose-p:text-text-secondary prose-p:leading-relaxed
          prose-strong:text-text-primary
          prose-table:text-[13px] prose-th:text-left prose-th:font-medium prose-th:text-text-secondary prose-th:pb-2
          prose-td:text-text-secondary prose-td:py-1.5
          prose-code:text-[13px] prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-text-primary
          prose-pre:bg-[#1e293b] prose-pre:text-[13px] prose-pre:text-slate-300 prose-pre:rounded-card
          prose-li:text-[14px] prose-li:text-text-secondary"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
      />

      {/* Mark as complete button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleMarkComplete}
          disabled={completed}
          className={`flex items-center gap-2 rounded-card px-4 py-2.5 text-[14px] font-medium shadow-card transition ${
            completed
              ? "bg-emerald-600 text-white"
              : "bg-[#683290] text-white hover:bg-[#542573]"
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          {completed ? "Completed" : "Mark as complete"}
        </button>
      </div>
    </div>
  );
}

/** Simple markdown-to-HTML converter (handles common patterns) */
function markdownToHtml(md: string): string {
  return md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="rounded-card bg-[#1e293b] p-4 text-[13px] text-slate-300 overflow-x-auto"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-surface px-1.5 py-0.5 rounded text-[13px] text-text-primary font-mono">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Tables (simple)
    .replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_match, header, body) => {
      const headers = header.split("|").map((h: string) => h.trim()).filter(Boolean);
      const rows = body.trim().split("\n").map((row: string) =>
        row.split("|").map((c: string) => c.trim()).filter(Boolean)
      );
      return `<div class="overflow-x-auto"><table class="w-full text-[13px] my-4"><thead><tr>${headers.map((h: string) => `<th class="px-3 py-2 text-left font-medium text-text-secondary border-b border-border">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((row: string[]) => `<tr class="border-b border-border/50">${row.map((c: string) => `<td class="px-3 py-2 text-text-secondary">${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    })
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-[14px] text-text-secondary list-disc">$1</li>')
    // Numbered lists
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-[14px] text-text-secondary list-decimal">$2</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="text-[14px] text-text-secondary leading-relaxed mb-3">')
    // Single newlines within paragraphs
    .replace(/\n/g, '<br/>')
    // Wrap in paragraph
    .replace(/^/, '<p class="text-[14px] text-text-secondary leading-relaxed mb-3">')
    .replace(/$/, '</p>');
}
