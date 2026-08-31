"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiMutate, useApi } from "@/lib/useApi";
import { useToast } from "@/components/ui/toast-context";
import FlagSubmit from "@/components/labs/FlagSubmit";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FlaskConical,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  Square,
  Tag,
  Timer,
} from "lucide-react";

const PROVISION_MESSAGES = [
  "Starting your lab...",
  "Pulling container image...",
  "Spinning up environment...",
  "Waiting for desktop...",
  "Almost ready...",
];

const STORAGE_KEY = (labId: string) => `lab-session:${labId}`;

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
  sessionDbId?: string;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Live countdown to `target`. Ticks once per second, synced to the clock so
 * partial seconds are consumed on the first tick instead of waiting a full
 * second. The backend owns the real TTL (see labSessionCleanup.ts) — this is
 * purely presentational.
 */
function useCountdown(target: string | null) {
  const [remaining, setRemaining] = useState(() => (target ? new Date(target).getTime() - Date.now() : 0));

  useEffect(() => {
    if (!target) return;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let int: ReturnType<typeof setInterval> | null = null;
    const tick = () => setRemaining(new Date(target).getTime() - Date.now());
    tick();
    const delay = (new Date(target).getTime() - Date.now()) % 1000;
    timeout = setTimeout(() => {
      tick();
      int = setInterval(tick, 1000);
    }, delay);
    return () => {
      if (timeout) clearTimeout(timeout);
      if (int) clearInterval(int);
    };
  }, [target]);

  return remaining;
}

export default function LabDetailPage({ params }: { params: { labId: string } }) {
  const { labId } = params;
  const router = useRouter();
  const { toast: showToast } = useToast();
  const { data, loading: labLoading } = useApi<Lab>(`/labs/${labId}`, null as any);

  const [session, setSession] = useState<SessionState | null>(null);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endingExpired, setEndingExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  // "native" = browser Fullscreen API active; "overlay" = CSS overlay
  // fallback when requestFullscreen is unavailable/rejected; "inline" = normal.
  const [fsMode, setFsMode] = useState<"inline" | "native" | "overlay">("inline");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [actionBarVisible, setActionBarVisible] = useState(true);
  const [provisionMsg, setProvisionMsg] = useState(PROVISION_MESSAGES[0]);
  const provisionTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const lab = data;
  const remaining = useCountdown(session?.expiresAt ?? null);

  /* ------------------------------------------------------------------ */
  /* Session persistence (T3)                                            */
  /* ------------------------------------------------------------------ */

  const persistSession = useCallback(
    (s: SessionState) => {
      try {
        sessionStorage.setItem(STORAGE_KEY(labId), JSON.stringify(s));
      } catch {
        // Storage may be unavailable (private mode); the session still works in-memory.
      }
    },
    [labId]
  );

  const clearStoredSession = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY(labId));
    } catch {
      // noop
    }
  }, [labId]);

  // Same-tab refresh recovery only: a new tab or a different browser cannot
  // recover the agent session without a backend resume endpoint (out of scope).
  // Runs on mount / labId change — if a live session is already in memory,
  // the workspace keeps using it instead of re-reading storage.
  useEffect(() => {
    if (session) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY(labId));
      if (!raw) return;
      const stored = JSON.parse(raw) as SessionState;
      if (!stored.sessionId || !stored.iframeUrl || !stored.expiresAt) {
        clearStoredSession();
        return;
      }
      if (new Date(stored.expiresAt).getTime() <= Date.now()) {
        clearStoredSession();
        return;
      }
      setSession(stored);
    } catch {
      clearStoredSession();
    }
    // Restore only once per labId; subsequent session transitions are
    // explicitly cleared, not re-read from storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labId]);

  /* ------------------------------------------------------------------ */
  /* Expiry handling (T5)                                                */
  /* ------------------------------------------------------------------ */

  // When the countdown reaches zero, clear the session and storage and show
  // the expired state. Keep the last sessionId in state so the expired-state
  // "End Lab" can still destroy the agent instance (best-effort). The backend
  // TTL sweep (labSessionCleanup.ts) is authoritative; this is the client-side
  // mirror so the workspace doesn't keep a dead iframe open.
  const [expiredSessionId, setExpiredSessionId] = useState<string | null>(null);
  const exitNative = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setFsMode("inline");
  }, []);
  useEffect(() => {
    if (!session || remaining > 0) return;
    setExpired(true);
    setExpiredSessionId(session.sessionId);
    setSession(null);
    clearStoredSession();
    exitNative();
  }, [session, remaining, clearStoredSession, exitNative]);

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
    return () => {
      if (provisionTimer.current) clearInterval(provisionTimer.current);
    };
  }, [starting]);

  /* ------------------------------------------------------------------ */
  /* Fullscreen API (T4)                                                 */
  /* ------------------------------------------------------------------ */

  // Keep the state in sync with the real browser fullscreen state. If the
  // document exits fullscreen while we think we're native (Esc key), drop
  // back to inline. If we're in the overlay fallback, the browser never
  // enters real fullscreen so the overlay persists until the user exits.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && fsMode === "native") setFsMode("inline");
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [fsMode]);

  const toggleFullscreen = useCallback(() => {
    if (fsMode === "native") {
      document.exitFullscreen().catch(() => {});
      return;
    }
    if (fsMode === "overlay") {
      setFsMode("inline");
      return;
    }
    // Inline → try the browser Fullscreen API. If it's unavailable or
    // rejected (e.g. focus held by the cross-origin noVNC iframe), degrade
    // to the CSS overlay so fullscreen still works.
    const el = workspaceRef.current;
    if (!el?.requestFullscreen) {
      setFsMode("overlay");
      return;
    }
    el.requestFullscreen()
      .then(() => setFsMode("native"))
      .catch(() => setFsMode("overlay"));
  }, [fsMode]);

  const fullscreen = fsMode !== "inline";

  // Keyboard: `f` toggles fullscreen. Note noVNC captures most keys when the
  // iframe has focus, so the toolbar button is the reliable trigger.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "f" && e.key !== "F") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      e.preventDefault();
      toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen]);

  // Auto-hide the floating action bar after ~2.5s of no pointer/keyboard
  // activity inside fullscreen; any mousemove or keydown brings it back.
  useEffect(() => {
    if (!fullscreen) return;
    const show = () => setActionBarVisible(true);
    const scheduleHide = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setActionBarVisible(false), 2500);
    };
    window.addEventListener("mousemove", show);
    window.addEventListener("keydown", show);
    scheduleHide();
    return () => {
      window.removeEventListener("mousemove", show);
      window.removeEventListener("keydown", show);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [fullscreen]);

  /* ------------------------------------------------------------------ */
  /* Actions                                                             */
  /* ------------------------------------------------------------------ */

  async function handleStart() {
    setStarting(true);
    setError(null);
    setProvisionMsg(PROVISION_MESSAGES[0]);
    try {
      const res = await apiMutate<SessionState>(`/labs/${labId}/start`, "POST");
      setSession(res);
      persistSession(res);
      setExpired(false);
      setExpiredSessionId(null);
      setRailOpen(true);
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
      clearStoredSession();
      setSession(null);
      setExpired(false);
      setExpiredSessionId(null);
      showToast("Lab session ended");
    } catch (err) {
      showToast((err as Error).message || "Failed to end lab", "error");
    } finally {
      setEnding(false);
    }
  }

  async function handleEndExpired() {
    if (!expiredSessionId) return;
    setEndingExpired(true);
    try {
      await apiMutate(`/labs/${labId}/end`, "POST", { sessionId: expiredSessionId });
      setExpiredSessionId(null);
      showToast("Lab session ended");
    } catch (err) {
      showToast((err as Error).message || "Failed to end lab", "error");
    } finally {
      setEndingExpired(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Early returns                                                       */
  /* ------------------------------------------------------------------ */

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

  const deadlineLabel = new Date(session?.expiresAt ?? Date.now()).toLocaleTimeString();
  const sessionLive = !!session;
  const railOnDesktop = !fullscreen && railOpen;

  const expiredCard = (
    <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] p-6">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-[#991B1B]">Session expired</p>
          <p className="mt-1 text-[13px] text-[#B91C1C]">
            This lab session reached its time limit. Start a new session to continue working.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleEndExpired}
            disabled={endingExpired || !expiredSessionId}
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#DC2626] bg-white px-4 py-2 text-[13px] font-medium text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:opacity-50"
          >
            {endingExpired ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
            {endingExpired ? "Ending..." : "End Lab"}
          </button>
          <button
            onClick={handleStart}
            disabled={starting}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
          >
            {starting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {starting ? "Starting..." : "Start Again"}
          </button>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /* Render: expired (live session ended)                                */
  /* ------------------------------------------------------------------ */

  if (expired) {
    return (
      <div className="mx-auto max-w-6xl">
        <Header lab={lab} onBack={() => router.back()} />
        {error && <ErrorBanner error={error} onRetry={handleStart} />}
        <div className="mt-6">{expiredCard}</div>
        <div className="mt-6">
          <DescriptionCard lab={lab} open={descOpen} onToggle={() => setDescOpen((v) => !v)} />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Render: pre-session / start gate                                    */
  /* ------------------------------------------------------------------ */

  if (!session) {
    return (
      <div className="mx-auto max-w-6xl">
        <Header lab={lab} onBack={() => router.back()} />
        {error && <ErrorBanner error={error} onRetry={handleStart} />}
        <div className="mt-6 space-y-6">
          <DescriptionCard lab={lab} open={descOpen} onToggle={() => setDescOpen((v) => !v)} />
          <div className="rounded-[8px] border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
            {starting ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#683290]" />
                <p className="mt-4 text-[14px] font-medium text-[#1A1A2E]">{provisionMsg}</p>
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
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Render: live workspace                                              */
  /* ------------------------------------------------------------------ */

  const countsToward = remaining > 0;
  const critical = remaining <= 2 * 60 * 1000;

  return (
    <div
      ref={workspaceRef}
      className={
        fullscreen
          ? "fixed inset-0 z-40 flex flex-col overflow-hidden bg-white"
          : "mx-auto flex h-[calc(100dvh-140px)] min-h-[32rem] max-w-[110rem] flex-col"
      }
    >
      {/* Lab toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-2 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-[8px] p-1.5 text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
            aria-label="Back to labs"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <span className="truncate text-[13px] font-semibold text-[#1A1A2E]">{lab.name}</span>
          {lab.solved && (
            <span className="hidden items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700 sm:inline-flex">
              <CheckCircle2 className="h-3 w-3" />
              Solved
            </span>
          )}
          <span className="hidden items-center gap-1 text-[13px] text-[#6B7280] md:inline-flex">
            <Tag className="h-3 w-3" />
            {lab.category}
            <span className="font-semibold text-[#683290]">{lab.points} pts</span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {countsToward && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium tabular-nums ${
                critical
                  ? "animate-pulse border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280]"
              }`}
              title={`Session expires at ${deadlineLabel}`}
            >
              <Timer className="h-3.5 w-3.5" />
              {formatRemaining(remaining)}
            </span>
          )}
          <button
            onClick={() => setRailOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
            aria-expanded={railOpen}
            aria-label={railOpen ? "Hide panel" : "Show panel"}
          >
            {railOpen ? (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hide Panel</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Show Panel</span>
              </>
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
          >
            {fullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Desktop stage */}
        <div className="relative min-h-0 flex-1">
          <iframe
            src={session.iframeUrl}
            className="h-full w-full"
            style={{ border: "none" }}
            title={`Lab: ${lab.name}`}
            allow="clipboard-read; clipboard-write"
          />
        </div>

        {/* Side rail — right column on desktop */}
        {railOnDesktop && (
          <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-[#E5E7EB] bg-white lg:flex">
            <RailContent
              lab={lab}
              session={session}
              deadlineLabel={deadlineLabel}
              remaining={remaining}
              descOpen={descOpen}
              setDescOpen={setDescOpen}
              ending={ending}
              onEnd={handleEnd}
              sessionLive={sessionLive}
            />
          </aside>
        )}
      </div>

      {/* Mobile panel — below the desktop, collapsible bottom sheet */}
      {!fullscreen && (
        <div className="shrink-0 border-t border-[#E5E7EB] bg-white lg:hidden">
          {railOpen ? (
            <>
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2">
                <span className="text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">FLAG & SESSION</span>
                <button
                  onClick={() => setRailOpen(false)}
                  className="inline-flex items-center gap-1 rounded-[6px] border border-[#E5E7EB] px-2.5 py-1 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
                >
                  Close Panel
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="max-h-[20rem] space-y-4 overflow-y-auto p-4">
                <RailContent
                  lab={lab}
                  session={session}
                  deadlineLabel={deadlineLabel}
                  remaining={remaining}
                  descOpen={descOpen}
                  setDescOpen={setDescOpen}
                  ending={ending}
                  onEnd={handleEnd}
                  sessionLive={sessionLive}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2">
              <span className="text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">FLAG & SESSION</span>
              <button
                onClick={() => setRailOpen(true)}
                className="inline-flex items-center gap-1 rounded-[6px] border border-[#E5E7EB] px-2.5 py-1 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
              >
                Open Panel
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating action bar + quick-flag popover (fullscreen only) */}
      {fullscreen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center">
          {popoverOpen && (
            <div className="pointer-events-auto mb-2 w-[320px] rounded-[8px] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(26,26,46,0.12)]">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">QUICK FLAG</p>
                <button
                  onClick={() => setPopoverOpen(false)}
                  className="rounded-[6px] p-1 text-[#9CA3AF] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
                  aria-label="Close quick flag"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-3">
                <FlagSubmit labId={labId} sessionId={session?.sessionId} disabled={!sessionLive} />
              </div>
            </div>
          )}

          <div
            className={`pointer-events-auto flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(26,26,46,0.15)] transition-opacity duration-200 ${
              actionBarVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {countsToward && (
              <span
                className={`inline-flex items-center gap-1 text-[12px] font-medium tabular-nums ${
                  critical ? "text-[#DC2626]" : "text-[#6B7280]"
                }`}
              >
                <Timer className="h-3.5 w-3.5" />
                {formatRemaining(remaining)}
              </span>
            )}
            <button
              onClick={() => setPopoverOpen((v) => !v)}
              className="rounded-full bg-[#683290] px-4 py-1.5 text-[12px] font-medium text-white transition hover:bg-[#542573]"
            >
              Submit Flag
            </button>
            <button
              onClick={handleEnd}
              disabled={ending}
              className="rounded-full border border-[#DC2626] px-3 py-1.5 text-[12px] font-medium text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:opacity-50"
            >
              {ending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "End"}
            </button>
            <button
              onClick={toggleFullscreen}
              className="rounded-[9999px] p-1.5 text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
              aria-label="Exit fullscreen"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small internal building blocks                                      */
/* ------------------------------------------------------------------ */

function Header({ lab, onBack }: { lab: Lab; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onBack}
        className="rounded-[8px] p-2 text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">{lab.name}</h1>
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
  );
}

function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
      <p>{error}</p>
      <button
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#DC2626] underline transition hover:text-[#991B1B]"
      >
        <RefreshCw className="h-3 w-3" />
        Try Again
      </button>
    </div>
  );
}

function DescriptionCard({
  lab,
  open,
  onToggle,
}: {
  lab: Lab;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">ABOUT THIS LAB</span>
        {open ? <ChevronDown className="h-4 w-4 text-[#6B7280]" /> : <ChevronRight className="h-4 w-4 text-[#6B7280]" />}
      </button>
      {open && (
        <p className="border-t border-[#E5E7EB] px-5 py-4 text-[14px] leading-relaxed text-[#374151]">
          {lab.description}
        </p>
      )}
    </div>
  );
}

function RailContent({
  lab,
  session,
  deadlineLabel,
  remaining,
  descOpen,
  setDescOpen,
  ending,
  onEnd,
  sessionLive,
}: {
  lab: Lab;
  session: SessionState;
  deadlineLabel: string;
  remaining: number;
  descOpen: boolean;
  setDescOpen: (v: boolean) => void;
  ending: boolean;
  onEnd: () => void;
  sessionLive: boolean;
}) {
  const critical = remaining <= 2 * 60 * 1000;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Description (collapsed by default) */}
      <div className="rounded-[8px] border border-[#E5E7EB]">
        <button
          onClick={() => setDescOpen(!descOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          aria-expanded={descOpen}
        >
          <span className="text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">ABOUT THIS LAB</span>
          {descOpen ? (
            <ChevronDown className="h-4 w-4 text-[#6B7280]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#6B7280]" />
          )}
        </button>
        {descOpen && (
          <p className="border-t border-[#E5E7EB] px-4 py-3 text-[13px] leading-relaxed text-[#374151]">
            {lab.description}
          </p>
        )}
      </div>

      {/* Flag submission */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4">
        <FlagSubmit labId={lab.id} sessionId={session?.sessionId} disabled={!sessionLive} />
      </div>

      {/* Session info + End Lab */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-4">
        <p className="text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">SESSION</p>
        <p className="mt-2 text-[12px] text-[#6B7280]">Expires at {deadlineLabel}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[12px] tabular-nums">
          <Timer className="h-3.5 w-3.5" />
          <span className={critical ? "font-semibold text-[#DC2626]" : "text-[#6B7280]"}>
            {formatRemaining(remaining)} remaining
          </span>
        </p>
        <button
          onClick={onEnd}
          disabled={ending || !sessionLive}
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
  );
}
