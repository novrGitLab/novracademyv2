"use client";

import { LoaderProvider, useLoader } from "./LoaderContext";
import { LoaderExit } from "./LoaderExit";
import NovrLoader from "./NovrLoader";
import type { ReactNode } from "react";

function PageShell({ children }: { children: ReactNode }) {
  const { phase } = useLoader();
  return <div className={phase === "exiting" ? "novr-page-enter" : ""}>{children}</div>;
}

/**
 * Client boundary providing loader state to the whole app: page-settle
 * shell around children, the overlay itself, and boot-cover removal.
 * Server components pass through untouched.
 */
export function LoaderRoot({ children }: { children: ReactNode }) {
  return (
    <LoaderProvider>
      <LoaderExit>
        <PageShell>{children}</PageShell>
        <NovrLoader />
      </LoaderExit>
    </LoaderProvider>
  );
}
