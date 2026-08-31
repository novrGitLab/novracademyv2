"use client";

/**
 * The tri-color segmented O from the NovrAcademy logo.
 * SVG circle with pathLength=100; arcs draw via stroke-dasharray:
 *   blue:   9→12 o'clock   (offset -76, dash 23)
 *   red:    12→3 o'clock   (offset -1,  dash 23)
 *   violet: 3→9 o'clock    (offset -26, dash 48 — half the ring)
 * 2-unit gaps at every seam, matching the original logo.
 */
export function BlueprintRing() {
  return (
    <div className="novr-loader__ring">
      <svg className="novr-loader__ring-svg" viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          className="novr-loader__arc-svg novr-loader__arc-svg--violet"
          cx="50"
          cy="50"
          r="43"
          pathLength={100}
          transform="rotate(-90 50 50)"
        />
        <circle
          className="novr-loader__arc-svg novr-loader__arc-svg--blue"
          cx="50"
          cy="50"
          r="43"
          pathLength={100}
          transform="rotate(-90 50 50)"
        />
        <circle
          className="novr-loader__arc-svg novr-loader__arc-svg--red"
          cx="50"
          cy="50"
          r="43"
          pathLength={100}
          transform="rotate(-90 50 50)"
        />
        {/* Seam covers: white rects over each gap turn the wedge-shaped
            radial gaps into straight parallel-edged notches (like the
            logo). Seams sit at 12, 3, and 9 o'clock. */}
        <g aria-hidden="true">
          <rect className="novr-loader__seam" x="46.7" y="0.35" width="6.6" height="13.4" />
          <rect className="novr-loader__seam" x="46.7" y="0.35" width="6.6" height="13.4" transform="rotate(90 50 50)" />
          <rect className="novr-loader__seam" x="46.7" y="0.35" width="6.6" height="13.4" transform="rotate(270 50 50)" />
        </g>
      </svg>
      <div className="novr-loader__sheen" />
    </div>
  );
}
