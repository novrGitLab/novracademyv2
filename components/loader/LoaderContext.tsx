"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { LoaderController, LoaderPhase, ShowLoaderOptions } from "./loader.types";

type LoaderContextValue = LoaderController | null;

export const LOADER_MIN_DISPLAY_MS = 1200;
export const LOADER_EXIT_MS = 800;

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

  const clearMinTimer = () => {
    if (minTimerRef.current !== null) {
      window.clearTimeout(minTimerRef.current);
      minTimerRef.current = null;
    }
  };

  const tryBeginExit = useCallback(() => {
    // Hybrid rule (Option C): exit only when BOTH the 1200ms minimum
    // has elapsed AND the page reported ready — whichever comes later.
    if (timingRef.current.ready && timingRef.current.minElapsed) {
      setPhase("exiting");
    }
  }, []);

  const show = useCallback(
    (options?: ShowLoaderOptions) => {
      clearMinTimer();
      timingRef.current = { manual: options?.manual ?? false, ready: false, minElapsed: false };
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
      return clearMinTimer;
    }
    window.addEventListener("load", hide, { once: true });
    return () => {
      window.removeEventListener("load", hide);
      clearMinTimer();
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
