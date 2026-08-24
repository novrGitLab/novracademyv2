"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiMutate, useApi } from "@/lib/useApi";
import { Toast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  Send,
  Square,
  Tag,
  XCircle,
} from "lucide-react";

const PROVISION_MESSAGES = [
  "Starting your lab...",
  "Pulling container image...",
  "Spinning up environment...",
  "Waiting for desktop...",
  "Almost ready...",
];

interface Lab {
  id: string;
  name: string;
  category: string;
  description: string;
  points: number;
  labTemplateId: string;
  solved: boolean;
}

interface SessionState {
  sessionId: string;
  iframeUrl: string;
  expiresAt: string;
}

export default function LabDetailPage({ params }: { params: { labId: string } }) {
  const { labId } = params;
  const router = useRouter();
  const { data, loading: labLoading } = useApi<Lab>(`/labs/${labId}`, null as any);

  const [session, setSession] = useState<SessionState | null>(null);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [flagResult, setFlagResult] = useState<{ correct: boolean; alreadySolved?: boolean; points?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [provisionMsg, setProvisionMsg] = useState(PROVISION_MESSAGES[0]);
  const provisionTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const lab = data;

  // Rotate provisioning messages while starting
  useEffect(() => {
    if (!starting) {
      if (provisionTimer.current) clearInterval(provisionTimer.current);
      return;
    }
    let idx = 0;
    provisionTimer.current = setInterval(() => {
      idx = (idx + 1) % PROVISION_MESSAGES.length;
      setProvisionMsg(PROVISION_MESSAGES[idx]);
    }, 3000);
    return () => { if (provisionTimer.current) clearInterval(provisionTimer.current); };
  }, [starting]);

  async function handleStart() {
    setStarting(true);
    setError(null);
    setProvisionMsg(PROVISION_MESSAGES[0]);
    try {
      const res = await apiMutate<SessionState>(`/labs/${labId}/start`, "POST");
      setSession(res);
    } catch (err) {
      const msg = (err as Error).message || "";
      if (msg.includes("504") || msg.toLowerCase().includes("timeout") || msg.toLowerCase().includes("vnc")) {
        setError("Your lab environment took too long to start. Please try again.");
      } else {
        setError(msg || "Failed to start lab");
      }
    } finally {
      setStarting(false);
    }
  }

  async function handleEnd() {
    if (!session) return;
    setEnding(true);
    try {
      await apiMutate(`/labs/${labId}/end`, "POST", { sessionId: session.sessionId });
      setSession(null);
      setFlagResult(null);
      setToast({ message: "Lab session ended", type: "success" });
    } catch (err) {
      setToast({ message: (err as Error).message || "Failed to end lab", type: "error" });
    } finally {
      setEnding(false);
    }
  }

  async function handleSubmitFlag(e: React.FormEvent) {
    e.preventDefault();
    if (!flag.trim()) return;
    setSubmitting(true);
    setFlagResult(null);
    try {
      const res = await apiMutate<{ correct: boolean; alreadySolved?: boolean; points?: number }>(
        `/labs/${labId}/submit`,
        "POST",
        { flag: flag.trim(), sessionId: session?.sessionId }
      );
      setFlagResult(res);
      if (res.correct && !res.alreadySolved) {
        setFlag("");
      }
    } catch (err) {
      setToast({ message: (err as Error).message || "Failed to submit flag", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (labLoading) {
    return (
      <div className="mx-auto max-w-5xl p-8 text-center text-[14px] text-[#6B7280]">
        Loading lab...
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="mx-auto max-w-5xl p-8 text-center text-[14px] text-[#DC2626]">
        Lab not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-[8px] p-2 text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
              {lab.name}
            </h1>
            {lab.solved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Solved
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-[13px] text-[#6B7280]">
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {lab.category}
            </span>
            <span className="font-semibold text-[#683290]">{lab.points} pts</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <p className="text-[14px] leading-relaxed text-[#374151]">{lab.description}</p>
      </div>

      {error && (
        <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          <p>{error}</p>
          <button
            onClick={handleStart}
            className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#DC2626] underline transition hover:text-[#991B1B]"
          >
            <RefreshCw className="h-3 w-3" />
            Try Again
          </button>
        </div>
      )}

      {/* Lab Desktop / Start */}
      {!session ? (
        <div className="rounded-[8px] border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
          {starting ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#683290]" />
              <p className="mt-4 text-[14px] font-medium text-[#1A1A2E]">
                {provisionMsg}
              </p>
              <p className="mt-1 text-[13px] text-[#9CA3AF]">
                This may take a few seconds while your environment boots up.
              </p>
            </>
          ) : (
            <>
              <FlaskConical className="mx-auto h-12 w-12 text-[#D1D5DB]" />
              <p className="mt-4 text-[14px] font-medium text-[#6B7280]">
                Ready to start this lab?
              </p>
              <p className="mt-1 text-[13px] text-[#9CA3AF]">
                A Docker container will spin up with an isolated desktop environment.
              </p>
              <button
                onClick={handleStart}
                className="mt-6 inline-flex items-center gap-2 rounded-[8px] bg-[#683290] px-6 py-3 text-[14px] font-medium text-white transition hover:bg-[#542573]"
              >
                <Play className="h-4 w-4" />
                Start Lab
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Iframe toolbar */}
          <div className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
            <span className="text-[13px] font-medium text-[#6B7280]">Lab Desktop</span>
            <button
              onClick={() => setFullscreen((f) => !f)}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
            >
              {fullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  Fullscreen
                </>
              )}
            </button>
          </div>

          {/* Iframe */}
          {fullscreen ? (
            <div className="fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2">
                <span className="text-[13px] font-medium text-[#6B7280]">Lab Desktop — {lab.name}</span>
                <button
                  onClick={() => setFullscreen(false)}
                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  Exit Fullscreen
                </button>
              </div>
              <iframe
                src={session.iframeUrl}
                className="flex-1 w-full"
                style={{ border: "none" }}
                title={`Lab: ${lab.name}`}
                allow="clipboard-read; clipboard-write"
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-[8px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <iframe
                src={session.iframeUrl}
                width="100%"
                height="700"
                style={{ border: "none" }}
                title={`Lab: ${lab.name}`}
                allow="clipboard-read; clipboard-write"
              />
            </div>
          )}

          {/* Flag Submission + End Lab */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Flag form */}
            <form onSubmit={handleSubmitFlag} className="flex-1 rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
                SUBMIT FLAG
              </label>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={flag}
                  onChange={(e) => { setFlag(e.target.value); setFlagResult(null); }}
                  placeholder="FLAG{...}"
                  className="flex-1 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2.5 font-mono text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                />
                <button
                  type="submit"
                  disabled={submitting || !flag.trim()}
                  className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {submitting ? "Checking..." : "Submit"}
                </button>
              </div>

              {/* Flag result */}
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

            {/* End Lab button */}
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)] sm:w-48">
              <p className="text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
                SESSION
              </p>
              <p className="mt-2 text-[12px] text-[#6B7280]">
                Expires at {new Date(session.expiresAt).toLocaleTimeString()}
              </p>
              <button
                onClick={handleEnd}
                disabled={ending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#DC2626] px-4 py-2.5 text-[13px] font-medium text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:opacity-50"
              >
                {ending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                {ending ? "Ending..." : "End Lab"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
