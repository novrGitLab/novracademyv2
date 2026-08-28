"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enrollFreeAction, redeemCodeAction, startCheckoutAction } from "./actions";

interface AppliedDiscount {
  codeId: string;
  finalPriceCents: number;
}

export function EnrollButton({
  courseId,
  priceCents,
  currency,
}: {
  courseId: string;
  priceCents: number;
  currency: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"FREE" | "STRIPE" | "PAYSTACK" | "CODE" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<AppliedDiscount | null>(null);
  const [codeMessage, setCodeMessage] = useState<string | null>(null);

  const effectivePriceCents = applied ? applied.finalPriceCents : priceCents;

  async function handleFree() {
    setLoading("FREE");
    setError(null);
    const outcome = await enrollFreeAction(courseId);
    setLoading(null);
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    router.refresh();
  }

  async function handleCheckout(provider: "STRIPE" | "PAYSTACK") {
    setLoading(provider);
    setError(null);
    const outcome = await startCheckoutAction(courseId, provider, applied?.codeId);
    setLoading(null);
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    window.location.href = outcome.checkoutUrl;
  }

  async function handleRedeemCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading("CODE");
    setError(null);
    setCodeMessage(null);
    const outcome = await redeemCodeAction(code.trim());
    setLoading(null);

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    if (outcome.result.enrolled) {
      setCodeMessage("Code applied — you're enrolled!");
      router.refresh();
      return;
    }
    setApplied({ codeId: outcome.result.codeId, finalPriceCents: outcome.result.finalPriceCents });
    setCodeMessage(
      outcome.result.finalPriceCents === 0
        ? "Code applied — this course is now free for you."
        : `Code applied — new price: ${(outcome.result.finalPriceCents / 100).toFixed(2)} ${currency}`
    );
  }

  return (
    <div className="mt-6 rounded-card border border-border bg-surface p-4">
      {effectivePriceCents === 0 ? (
        <button
          type="button"
          onClick={handleFree}
          disabled={loading !== null}
          className="rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
        >
          {loading === "FREE" ? "Enrolling…" : "Enroll for free"}
        </button>
      ) : (
        <div>
          <p className="text-[15px] font-medium text-text-primary">
            {(effectivePriceCents / 100).toFixed(2)} {currency}
            {applied && (
              <span className="ml-2 text-[13px] font-normal text-text-secondary line-through">
                {(priceCents / 100).toFixed(2)} {currency}
              </span>
            )}
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => handleCheckout("STRIPE")}
              disabled={loading !== null}
              className="rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
            >
              {loading === "STRIPE" ? "Redirecting…" : "Pay with card (Stripe)"}
            </button>
            <button
              type="button"
              onClick={() => handleCheckout("PAYSTACK")}
              disabled={loading !== null}
              className="rounded-card border border-[#4451A2] px-4 py-2 text-[15px] font-medium text-[#4451A2] hover:bg-[#4451A2]/10 disabled:opacity-50"
            >
              {loading === "PAYSTACK" ? "Redirecting…" : "Pay with Paystack"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 rounded-pill bg-[#E82027]/15 px-3 py-2 text-[13px] font-semibold text-[#E82027]">{error}</p>}

      <form onSubmit={handleRedeemCode} className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Have a code?"
          disabled={Boolean(applied) || loading !== null}
          className="w-40 rounded-card border border-border bg-background px-3 py-1.5 text-[13px] text-text-primary outline-none focus:border-[#683290] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={Boolean(applied) || loading !== null || !code.trim()}
          className="rounded-card border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary hover:bg-background disabled:opacity-50"
        >
          {loading === "CODE" ? "Checking…" : "Apply"}
        </button>
      </form>
      {codeMessage && <p className="mt-2 text-[13px] text-success">{codeMessage}</p>}
    </div>
  );
}
