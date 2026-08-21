"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { apiMutate } from "@/lib/useApi";
import { Eye, EyeOff, Lock } from "lucide-react";

export function ChangePasswordModal() {
  const { data: session, update } = useSession();
  const mustChange = session?.user?.mustChangePassword ?? false;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      await apiMutate(`/users/${userId}/password`, "PATCH", { password: newPassword });
      await update();
      setToast({ message: "Password updated successfully", type: "success" });
    } catch (err) {
      setError((err as Error).message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal open={mustChange} onClose={() => {}} title="Change Your Password" description="You&apos;re using a temporary password. Please set a new one to continue." size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
              NEW PASSWORD
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-10 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                autoFocus
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition hover:text-[#1A1A2E]">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
              CONFIRM NEW PASSWORD
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-10 text-[13px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition hover:text-[#1A1A2E]">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-[6px] bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="h-10 w-full rounded-[8px] bg-[#683290] text-[13px] font-semibold text-white transition hover:bg-[#542573] disabled:opacity-60"
          >
            {loading ? "Updating..." : "Set New Password"}
          </button>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
