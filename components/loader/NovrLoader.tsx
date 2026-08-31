"use client";

import { LoaderOverlay } from "./LoaderOverlay";
import { useLoader } from "./LoaderContext";

export default function NovrLoader() {
  const { phase } = useLoader();

  // Fully unmounted when complete — removed from the DOM, not hidden.
  if (phase === "complete") return null;

  return <LoaderOverlay phase={phase} />;
}
