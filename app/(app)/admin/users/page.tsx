"use client";

import { useSession } from "next-auth/react";
import { UsersManager } from "./UsersManager";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  if (status === "loading" || role === undefined) {
    return (
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#F1F3F5] border-t-[#683290]" />
      </div>
    );
  }

  const isPlatform = role === "SUPER_ADMIN" || role === "CYBERNOVR_ADMIN";
  return <UsersManager mode={isPlatform ? "platform" : "org"} />;
}
