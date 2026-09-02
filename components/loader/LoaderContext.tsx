"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { LoaderController, LoaderPhase, ShowLoaderOptions } from "./loader.types";

type LoaderContextValue = LoaderController | null;

export const LOADER_MIN_DISPLAY_MS = 1200;
export const LOADER_EXIT_MS = 800;
/** One full Blueprint cycle: draw blue → red → violet → hold → release. */
export const LOADER_LOOP_MS = 2400;
/** The cycle position (ms) where the completed ring is holding. */
const HOLD_START_MS = 1800;

type TimingState = {
  manual: boolean;
  ready: boolean;
  minElapsed: boolean;
};

const LoaderContext = createContext<LoaderContextValue>(null);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<LoaderPhase>("loading");

  const timingRef = useRef<TimingState>({ manual: false, ready: false, minElapsed: false });
  const minTimerRef = useRef<number | null>(null);
  const loopSyncTimerRef = useRef<number | null>(null);
  const cycleStartRef = useRef<number>(0);

  const clearTimers = () => {
    if (minTimerRef.current !== null) {
      window.clearTimeout(minTimerRef.current);
      minTimerRef.current = null;
    }
    if (loopSyncTimerRef.current !== null) {
      window.clearTimeout(loopSyncTimerRef.current);
      loopSyncTimerRef.current = null;
    }
  };

  const beginExit = useCallback(() => {
    timingRef.current.ready = true;
    setPhase("exiting");
  }, []);

  const tryBeginExit = useCallback(() => {
    // Exit only when BOTH the minimum display time has elapsed AND the page
    // reported ready. Then — rather than cutting the animation mid-draw —
    // wait for the ring to reach its natural "completed" hold so the user
    // always sees the mark fully assembled before the reveal. The loop keeps
    // running continuously until that point.
    if (!(timingRef.current.ready && timingRef.current.minElapsed)) return;
    if (loopSyncTimerRef.current !== null) return;

    const elapsedInCycle = (Date.now() - cycleStartRef.current) % LOADER_LOOP_MS;
    const wait = elapsedInCycle <= HOLD_START_MS
      ? HOLD_START_MS - elapsedInCycle
      : LOADER_LOOP_MS - elapsedInCycle + HOLD_START_MS;
    loopSyncTimerRef.current = window.setTimeout(beginExit, wait);
  }, [beginExit]);

  const show = useCallback(
    (options?: ShowLoaderOptions) => {
      clearTimers();
      timingRef.current = { manual: options?.manual ?? false, ready: false, minElapsed: false };
      cycleStartRef.current = Date.now();
      setPhase("loading");
      minTimerRef.current = window.setTimeout(() => {
        timingRef.current.minElapsed = true;
        tryBeginExit();
      }, options?.minDisplayMs ?? LOADER_MIN_DISPLAY_MS);
    },
    [tryBeginExit]
  );

  const hide = useCallback(() => {
    timingRef.current.ready = true;
    tryBeginExit();
  }, [tryBeginExit]);

  // Initial load: minimum timer starts on mount (hydration). When
  // auto mode (not manual), the page reports ready on window load
  // — or immediately if already loaded (SPA navigation remount).
  useEffect(() => {
    show();
    if (document.readyState === "complete") {
      hide();
      return clearTimers;
    }
    window.addEventListener("load", hide, { once: true });
    return () => {
      window.removeEventListener("load", hide);
      clearTimers();
    };
  }, [show, hide]);

  // Fully unmount the overlay after the exit animation.
  useEffect(() => {
    if (phase !== "exiting") return;
    const id = window.setTimeout(() => setPhase("complete"), LOADER_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  const value = useMemo<LoaderController>(() => ({ phase, show, hide }), [phase, show, hide]);

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
}

export function useLoaderContext(): LoaderContextValue {
  return useContext(LoaderContext);
}

export function useLoader(): LoaderController {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used within <LoaderProvider>");
  return ctx;
}
