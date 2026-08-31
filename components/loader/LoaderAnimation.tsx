"use client";

import type { LoaderPhase } from "./loader.types";

type LoaderAnimationProps = {
  phase: LoaderPhase;
};

/**
 * The segmented O from the NovrAcademy logo, constructed arc by arc:
 * blue (left, 90°) → red (top-right, 90°) → violet (bottom half, 180°,
 * closes the ring). SVG circle with pathLength=100; dash start is
 * rotated to 12 o'clock:
 *   blue:   9→12 o'clock   (offset -75, dash 25)
 *   red:    12→3 o'clock   (offset 0,   dash 25)
 *   violet: 3→9 o'clock    (offset -25, dash 50)
 */
export function LoaderAnimation({ phase }: LoaderAnimationProps) {
  return (
    <div className="novr-loader__stage" aria-hidden="true">
      <div className="novr-loader__ring">
        <svg className="novr-loader__ring-svg" viewBox="0 0 100 100" width="100%" height="100%">
          <circle className="novr-loader__arc-svg novr-loader__arc-svg--violet" cx="50" cy="50" r="43" pathLength={100} transform="rotate(-90 50 50)" />
          <circle className="novr-loader__arc-svg novr-loader__arc-svg--blue" cx="50" cy="50" r="43" pathLength={100} transform="rotate(-90 50 50)" />
          <circle className="novr-loader__arc-svg novr-loader__arc-svg--red" cx="50" cy="50" r="43" pathLength={100} transform="rotate(-90 50 50)" />
        </svg>
        <div className="novr-loader__sheen" />
      </div>
    </div>
  );
}
