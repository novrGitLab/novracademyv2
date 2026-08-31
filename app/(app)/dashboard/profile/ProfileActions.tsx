"use client";

import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { Button } from "@/components/DesignSystem";
import { LockKeyhole } from "lucide-react";

export function ProfileActions() {
  return (
    <ChangePasswordModal
      trigger={
        <Button variant="secondary">
          <LockKeyhole aria-hidden="true" className="h-4 w-4" />
          Change password
        </Button>
      }
    />
  );
}
