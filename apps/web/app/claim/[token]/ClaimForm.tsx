"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { claimAction } from "./actions";

export function ClaimForm({ claimToken, hasExistingAccount }: { claimToken: string; hasExistingAccount: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimedEmail, setClaimedEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasExistingAccount && password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (!hasExistingAccount && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const outcome = await claimAction(claimToken, hasExistingAccount ? undefined : password);
    setSubmitting(false);

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }

    setClaimedEmail(outcome.email);

    if (!hasExistingAccount) {
      // New account — we have the password, so log them in immediately.
      await signIn("credentials", { email: outcome.email, password, redirect: false });
      router.push("/dashboard");
      router.refresh();
    }
  }

  if (claimedEmail && hasExistingAccount) {
    return (
      <p className="rounded-pill bg-success-light px-3 py-2 text-[13px] text-success">
        Profile claimed! You're already logged in as {claimedEmail} — head to your{" "}
        <a href="/dashboard" className="underline">
          dashboard
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {hasExistingAccount ? (
        <p className="text-[13px] text-text-secondary">
          An account already exists for this email. If you're logged in as that account, claiming will link
          instantly. Otherwise,{" "}
          <a href="/login" className="text-blue underline">
            log in
          </a>{" "}
          first, then return to this link.
        </p>
      ) : (
        <>
          <div>
            <label className="text-[13px] font-medium text-text-secondary">Choose a password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-text-secondary">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
          </div>
        </>
      )}

      {error && <p className="rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90 disabled:opacity-50"
      >
        {submitting ? "Claiming…" : "Claim your profile"}
      </button>
    </form>
  );
}
