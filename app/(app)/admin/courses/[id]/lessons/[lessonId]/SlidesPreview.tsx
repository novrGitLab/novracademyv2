"use client";

import { SlidesLessonViewer, type SlidesManifest } from "@/components/DesignSystem";
import { Download } from "lucide-react";

/**
 * Admin preview of a generated/uploaded slide deck. Reuses the exact same
 * viewer students see, so what the admin previews is what learners get.
 */
export function SlidesPreview({ manifest }: { manifest: SlidesManifest }) {
  return (
    <div className="rounded-card border border-border bg-background p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] font-medium text-text-primary">Slide deck preview</p>
        {manifest.pptxUrl && (
          <a
            href={manifest.pptxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-card border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary transition hover:bg-surface"
          >
            <Download className="h-3.5 w-3.5" /> Download PowerPoint
          </a>
        )}
      </div>
      <SlidesLessonViewer manifest={manifest} />
      <p className="mt-3 text-[12px] text-text-secondary">
        {manifest.voiceoverEnabled && manifest.audioUrl
          ? "Narration included — press play to auto-advance."
          : "No narration — use the arrows, dots, or keyboard to move between slides."}
      </p>
    </div>
  );
}
