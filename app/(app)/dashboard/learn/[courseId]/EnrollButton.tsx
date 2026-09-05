"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/currency";
import { isPaystackConfigured } from "@/lib/payment-config";
import { enrollFreeAction, redeemCodeAction, startCheckoutAction } from "./actions";
import { Loader2 } from "lucide-react";

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
  const paystackReady = isPaystackConfigured();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<AppliedDiscount | null>(null);
  const [codeMessage, setCodeMessage] = useState<string | null>(null);

  const effectivePriceCents = applied ? applied.finalPriceCents : priceCents;

  async function handleFree() {
    setLoading("FREE");
    setError(null);
    try {
      const outcome = await enrollFreeAction(courseId);
      if (!outcome) {
        setError("Could not enroll — please try again");
        return;
      }
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleCheckout(provider: "STRIPE" | "PAYSTACK") {
    setLoading(provider);
    setError(null);
    try {
      const outcome = await startCheckoutAction(courseId, provider, applied?.codeId);
      if (!outcome) {
        setError("Could not start checkout — please try again");
        return;
      }
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }

      // Paystack: use redirect URL (checkout page) since inline v2 API is unreliable
      window.open(outcome.checkoutUrl, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(null);
    }
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
        : `Code applied — new price: ${formatPrice(outcome.result.finalPriceCents, currency)}`
    );
  }

  return (
    <div className="mt-6 rounded-card border border-border bg-surface p-4">
      {effectivePriceCents === 0 ? (
        <button
          type="button"
          onClick={handleFree}
          disabled={loading !== null}
          className="flex items-center gap-2 rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
        >
          {loading === "FREE" && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading === "FREE" ? "Enrolling…" : "Enroll for free"}
        </button>
      ) : (
        <div>
          <p className="text-[15px] font-medium text-text-primary">
            {formatPrice(effectivePriceCents, currency)}
            {applied && (
              <span className="ml-2 text-[13px] font-normal text-text-secondary line-through">
                {formatPrice(priceCents, currency)}
              </span>
            )}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => handleCheckout("STRIPE")}
              disabled={loading !== null}
              className="flex items-center justify-center gap-2 rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
            >
              {loading === "STRIPE" && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading === "STRIPE" ? "Redirecting…" : "Pay with card (Stripe)"}
            </button>
            <button
              type="button"
              onClick={() => handleCheckout("PAYSTACK")}
              disabled={loading !== null || !paystackReady}
              title={!paystackReady ? "Paystack is not configured" : ""}
              className="flex items-center justify-center gap-2 rounded-card border border-[#4451A2] px-4 py-2 text-[15px] font-medium text-[#4451A2] hover:bg-[#4451A2]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "PAYSTACK" && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading === "PAYSTACK" ? "Redirecting…" : "Pay with Paystack"}
            </button>
          </div>
          {!paystackReady && (
            <p className="mt-2 text-[12px] text-text-secondary">
              💡 Paystack payment is not configured. Please contact support.
            </p>
          )}
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
          className="flex items-center gap-2 rounded-card border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary hover:bg-background disabled:opacity-50"
        >
          {loading === "CODE" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading === "CODE" ? "Checking…" : "Apply"}
        </button>
      </form>
      {codeMessage && <p className="mt-2 text-[13px] text-success">{codeMessage}</p>}
    </div>
  );
}
