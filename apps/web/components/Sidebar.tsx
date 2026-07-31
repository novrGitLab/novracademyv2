"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ADMIN_ROLES, MANAGER_ROLES } from "@novr/types";
import {
  BookOpen,
  Home,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
  Users2,
  Bell,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const baseNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Learn", href: "/dashboard/learn", icon: BookOpen },
  { label: "Community", href: "/dashboard/community", icon: Users },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
];

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const nav = [...baseNav];
  if (role && MANAGER_ROLES.includes(role)) {
    nav.push({ label: "Team", href: "/team", icon: Users2 });
  }
  if (role && ADMIN_ROLES.includes(role)) {
    nav.push({ label: "Admin", href: "/admin", icon: ShieldCheck });
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-card">
          <Sparkles className="h-4.5 w-4.5" strokeWidth={2.25} />
        </div>
        <span className="text-[17px] font-bold tracking-tight text-text-primary">Novr Academy</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map((item) => {
          // Only use prefix matching for items that don't have child routes in the nav.
          // Otherwise, "/dashboard/learn" would highlight both Home and Learn.
          const isParent = nav.some((other) => other !== item && other.href.startsWith(`${item.href}/`));
          const active = isParent
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-pill px-3 py-2 text-[14px] font-medium transition-all ${
                active
                  ? "bg-blue text-white shadow-card"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  active ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                }`}
                strokeWidth={2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {session?.user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-card px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-purple text-[13px] font-semibold text-white">
              {initials(session.user.name, session.user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-text-primary">
                {session.user.name ?? session.user.email}
              </p>
              <p className="truncate text-[12px] text-text-secondary">{role}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
              className="shrink-0 rounded-md p-1.5 text-text-secondary transition hover:bg-red-light hover:text-red"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
