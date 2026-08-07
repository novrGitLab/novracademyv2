"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/DesignSystem";
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
    <Button type="button" onClick={toggle} disabled={pending} variant={joined ? "secondary" : "purple"} size="sm">
      {joined ? "Leave" : "Join"}
    </Button>
  );
}
