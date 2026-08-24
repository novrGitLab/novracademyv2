"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiMutate } from "@/lib/useApi";
import { Toast } from "@/components/ui/Toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB] p-4">
        <div className="w-full max-w-md rounded-[12px] border border-[#E5E7EB] bg-white p-8 shadow-[0_2px_12px_rgba(26,26,46,0.08)]">
          <div className="text-center">
            <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Invalid Reset Link</h1>
            <p className="mt-2 text-[14px] text-[#6B7280]">This password reset link is invalid or has expired.</p>
            <Link href="/login" className="mt-6 inline-block rounded-[8px] bg-[#683290] px-6 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#542573]">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }

    if (password.length < 8) {
      setToast({ message: "Password must be at least 8 characters", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await apiMutate("/auth/reset-password", "POST", { token, password });
      setSuccess(true);
      setToast({ message: "Password reset successful", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to reset password", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB] p-4">
        <div className="w-full max-w-md rounded-[12px] border border-[#E5E7EB] bg-white p-8 shadow-[0_2px_12px_rgba(26,26,46,0.08)]">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F0FDF4]">
              <svg className="h-6 w-6 text-[#16A34A]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="mt-4 font-serif text-[24px] font-semibold text-[#1A1A2E]">Password Reset Complete</h1>
            <p className="mt-2 text-[14px] text-[#6B7280]">Your password has been updated. You can now log in with your new password.</p>
            <Link href="/login" className="mt-6 inline-block rounded-[8px] bg-[#683290] px-6 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#542573]">
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB] p-4">
      <div className="w-full max-w-md rounded-[12px] border border-[#E5E7EB] bg-white p-8 shadow-[0_2px_12px_rgba(26,26,46,0.08)]">
        <div className="text-center">
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Reset Your Password</h1>
          <p className="mt-2 text-[14px] text-[#6B7280]">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">NEW PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">CONFIRM PASSWORD</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="mt-1.5 h-10 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#1A1A2E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-[8px] bg-[#683290] text-[14px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#6B7280]">
          <Link href="/login" className="font-medium text-[#683290] hover:underline">Back to Login</Link>
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
