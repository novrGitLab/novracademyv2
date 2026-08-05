"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinGroupAction, leaveGroupAction } from "../actions";

export function GroupJoinButton({ groupId, isMember }: { groupId: string; isMember: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [joined, setJoined] = useState(isMember);

  function toggle() {
    startTransition(async () => {
      if (joined) {
        await leaveGroupAction(groupId);
      } else {
        await joinGroupAction(groupId);
      }
      setJoined((v) => !v);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={
        joined
          ? "rounded-card border border-border px-4 py-2 text-[13px] font-medium text-text-secondary hover:border-red hover:text-red disabled:opacity-50"
          : "rounded-card bg-purple px-4 py-2 text-[13px] font-medium text-white hover:bg-purple/90 disabled:opacity-50"
      }
    >
      {joined ? "Leave" : "Join"}
    </button>
  );
}
