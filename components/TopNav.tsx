import Link from "next/link";
import { getServerSession } from "next-auth";
import { AlertTriangle, Bell, Search, Settings } from "lucide-react";
import { ADMIN_ROLES } from "@novr/types";
import { authOptions } from "@/lib/auth";
import { apiFetchSafe } from "@/lib/api";
import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "./UserMenu";

export async function TopNav() {
  const session = await getServerSession(authOptions);

  const isAdmin = Boolean(session?.user?.role && ADMIN_ROLES.includes(session.user.role));
  // Parallel: unread-count and demo-mode health check are independent reads.
  const [{ count }, { demoMode }] = await Promise.all([
    apiFetchSafe<{ count: number }>("/notifications/unread-count", { count: 0 }),
    isAdmin ? apiFetchSafe<{ demoMode: boolean }>("/health", { demoMode: false }) : Promise.resolve({ demoMode: false }),
  ]);

  return (
    <header className="relative flex h-16 shrink-0 items-center gap-2 border-b-2 border-[#683290]/20 bg-gradient-to-b from-white to-[#F4ECF8]/40 px-4 pl-14 backdrop-blur sm:gap-4 sm:px-6 lg:pl-6">
      {demoMode && (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-pill bg-yellow-400 px-3 py-0.5 text-[11px] font-semibold text-yellow-950 shadow-sm">
          <AlertTriangle className="mr-1 inline h-3 w-3" aria-hidden="true" /> Demo mode — payments disabled
        </span>
      )}
      <div className="hidden sm:block">
        <Breadcrumbs />
      </div>

      <div className="relative hidden min-w-0 w-full max-w-sm sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search courses, labs…"
          aria-label="Search courses and labs"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-pill border border-border bg-surface py-2 pl-9 pr-3 text-[14px] text-text-primary outline-none transition focus:border-[#683290] focus:bg-background focus:ring-[#683290]/10 focus-visible:ring-2 focus-visible:ring-[#683290]"
        />
      </div>
      {/* Mobile search icon */}
      <div className="flex flex-1 sm:hidden" />
      <Link
        href={session?.user ? "/dashboard/learn" : "/login"}
        aria-label="Search"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#683290] sm:hidden [touch-action:manipulation]"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
      </Link>

      <div className="ml-auto flex items-center gap-1 sm:gap-3">
        <Link
          href={session?.user ? "/dashboard/notifications" : "/login"}
          aria-label="Notifications"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#683290] [touch-action:manipulation]"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
          {count > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[10px] font-semibold leading-none text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>

        <Link
          href={session?.user ? "/dashboard/profile" : "/login"}
          aria-label="Settings"
          className="hidden h-11 w-11 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#683290] sm:flex [touch-action:manipulation]"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
        </Link>

        {session?.user ? (
          <UserMenu name={session.user.name} email={session.user.email ?? undefined} />
        ) : (
          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-1.5 rounded-auth bg-auth-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-[#542573] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#683290] [touch-action:manipulation]"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
