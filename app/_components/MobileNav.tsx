"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Platform", href: "#features" },
  { label: "Resources", href: "#how-it-works" },
  { label: "Company", href: "#testimonial" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#1A1A2E] transition hover:bg-[#F8F9FB]"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-[#E5E7EB] bg-white px-6 pb-6 pt-4 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[8px] px-3 py-2.5 text-[15px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-[#E5E7EB] pt-4">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-[8px] px-4 py-2.5 text-center text-[15px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="rounded-[8px] bg-[#683290] px-4 py-2.5 text-center text-[15px] font-medium text-white transition hover:bg-[#542573]"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
