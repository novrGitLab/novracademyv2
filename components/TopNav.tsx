import Link from "next/link";
import { getServerSession } from "next-auth";
import { Bell, Search, Settings } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { apiFetchSafe } from "@/lib/api";
import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "./UserMenu";

export async function TopNav() {
  const session = await getServerSession(authOptions);
  const { count } = await apiFetchSafe<{ count: number }>("/notifications/unread-count", { count: 0 });

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
      <Breadcrumbs />

      <div className="relative min-w-0 w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={2} />
        <input
          type="search"
          placeholder="Search courses, labs..."
          aria-label="Search courses and labs"
          className="w-full rounded-pill border border-border bg-surface py-2 pl-9 pr-3 text-[14px] text-text-primary outline-none transition focus:border-[#683290] focus:bg-background focus:ring-[#683290]/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/dashboard/notifications"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-text-primary"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          {count > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[10px] font-semibold leading-none text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>

        <Link
          href="/dashboard/profile"
          aria-label="Settings"
          className="hidden h-9 w-9 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-text-primary sm:flex"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>

        {session?.user && <UserMenu name={session.user.name} email={session.user.email ?? undefined} />}
      </div>
    </header>
  );
}
