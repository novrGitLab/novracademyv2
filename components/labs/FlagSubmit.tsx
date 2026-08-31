"use client";

import { useState } from "react";
import { apiMutate } from "@/lib/useApi";
import { useToast } from "@/components/ui/toast-context";
import { CheckCircle2, Send, XCircle } from "lucide-react";

interface FlagSubmitProps {
  labId: string;
  sessionId?: string;
  disabled?: boolean;
  compact?: boolean;
}

/**
 * Self-contained flag submission form shared by the lab workspace side rail
 * and the fullscreen quick-flag popover. Mirrors the previous inline form:
 * same `apiMutate` call, same `useToast` feedback, and a `compact` variant
 * for the floating fullscreen popover.
 */
export default function FlagSubmit({ labId, sessionId, disabled, compact = false }: FlagSubmitProps) {
  const { toast: showToast } = useToast();
  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [flagResult, setFlagResult] = useState<{ correct: boolean; alreadySolved?: boolean; points?: number } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!flag.trim() || submitting) return;
    setSubmitting(true);
    setFlagResult(null);
    try {
      const res = await apiMutate<{ correct: boolean; alreadySolved?: boolean; points?: number }>(
        `/labs/${labId}/submit`,
        "POST",
        { flag: flag.trim(), sessionId: sessionId ?? null }
      );
      setFlagResult(res);
      if (res.correct && !res.alreadySolved) {
        setFlag("");
        showToast(`Correct! +${res.points ?? 0} points`);
      } else if (res.correct && res.alreadySolved) {
        showToast("You already solved this lab!", "info");
      } else {
        showToast("Incorrect flag. Try again.", "error");
      }
    } catch (err) {
      showToast((err as Error).message || "Failed to submit flag", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">SUBMIT FLAG</label>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={flag}
          onChange={(e) => {
            setFlag(e.target.value);
            setFlagResult(null);
          }}
          placeholder="FLAG{...}"
          disabled={disabled}
          className="min-w-0 flex-1 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2.5 font-mono text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || submitting || !flag.trim()}
          className="flex shrink-0 items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? "Checking..." : "Submit"}
        </button>
      </div>

      {flagResult && (
        <div
          className={`mt-3 rounded-[8px] px-4 py-3 text-[13px] font-medium ${
            flagResult.correct
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {flagResult.correct ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {flagResult.alreadySolved
                ? "You already solved this lab!"
                : `Correct! +${flagResult.points} points`}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Incorrect flag. Try again.
            </span>
          )}
        </div>
      )}
    </form>
  );
}
