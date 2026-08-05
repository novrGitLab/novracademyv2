"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Settings, UserRound } from "lucide-react";

function initials(name: string | null | undefined, email: string | undefined) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ name, email }: { name: string | null | undefined; email: string | undefined }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-purple text-[13px] font-semibold text-white shadow-card transition hover:brightness-105"
      >
        {initials(name, email)}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-card border border-border bg-background shadow-pop">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-[14px] font-medium text-text-primary">{name ?? email}</p>
            {name && <p className="truncate text-[12px] text-text-secondary">{email}</p>}
          </div>
          <div className="py-1">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-[14px] text-text-primary transition hover:bg-surface"
            >
              <UserRound className="h-4 w-4 text-text-secondary" strokeWidth={2} />
              Profile
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-[14px] text-text-primary transition hover:bg-surface"
            >
              <Settings className="h-4 w-4 text-text-secondary" strokeWidth={2} />
              Settings
            </Link>
          </div>
          <div className="border-t border-border py-1">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[14px] text-red transition hover:bg-red-light"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
