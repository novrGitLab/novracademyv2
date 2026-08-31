"use client";

import type { ReactNode } from "react";

type LoaderExitProps = {
  children: ReactNode;
};

/**
 * Passes children through unchanged. Kept as the boundary where
 * post-exit page behavior can hook in if needed later.
 */
export function LoaderExit({ children }: LoaderExitProps) {
  return <>{children}</>;
}
