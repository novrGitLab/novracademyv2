"use client";

import { Menu } from "lucide-react";

export function MobileMenuButton() {
  return (
    <button
      type="button"
      aria-label="Open navigation"
      onClick={() => window.dispatchEvent(new CustomEvent("novr:toggle-sidebar"))}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card text-text-secondary transition hover:bg-surface hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#683290] lg:hidden"
    >
      <Menu className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}
