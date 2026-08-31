"use client";

import { BlueprintRing } from "./BlueprintRing";
import type { LoaderPhase } from "./loader.types";

type LoaderOverlayProps = {
  phase: LoaderPhase;
};

export function LoaderOverlay({ phase }: LoaderOverlayProps) {
  return (
    <div
      role="status"
      aria-busy={phase === "loading"}
      aria-label="Loading NovrAcademy"
      className={`novr-loader ${phase === "exiting" ? "novr-loader--exiting" : ""}`}
    >
      <div className="novr-loader__stage">
        <BlueprintRing />
      </div>
      <div className="novr-loader__halo" />
      <div className="novr-loader__wordmark">NovrAcademy</div>
      <p className="sr-only">Loading NovrAcademy</p>
    </div>
  );
}

/**
 * Compact inline variant for LMS navigation: the same Blueprint ring
 * (no wordmark, smaller) over a white panel, scoped to the content
 * area instead of the whole viewport.
 */
export function ContentLoader() {
  return (
    <div className="novr-content-loader" role="status" aria-label="Loading">
      <div className="novr-content-loader__ring">
        <BlueprintRing />
      </div>
      <p className="sr-only">Loading</p>
    </div>
  );
}
