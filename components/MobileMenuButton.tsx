"use client";

import { Menu } from "lucide-react";

export function MobileMenuButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("novr:open-sidebar"))}
      aria-label="Open navigation menu"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-background shadow-card ring-1 ring-border lg:hidden [touch-action:manipulation] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#683290]"
    >
      <Menu className="h-5 w-5 text-text-primary" aria-hidden="true" />
    </button>
  );
}
