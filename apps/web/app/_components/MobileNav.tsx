"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Courses", href: "#courses" },
  { label: "Community", href: "#community" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-card text-text-primary transition hover:bg-surface"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-background px-6 pb-6 pt-4 shadow-card">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-card px-3 py-2.5 text-[15px] font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4">
            <Link
              href="/login"
              className="rounded-card px-4 py-2.5 text-center text-[15px] font-medium text-text-secondary transition hover:bg-surface"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-card bg-blue px-4 py-2.5 text-center text-[15px] font-medium text-white shadow-card transition hover:bg-blue/90"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
