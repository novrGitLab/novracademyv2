"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/currency";
import { isPaystackConfigured } from "@/lib/payment-config";
import { enrollFreeAction, startCheckoutAction } from "./actions";

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
  const [loading, setLoading] = useState<"FREE" | "STRIPE" | "PAYSTACK" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const paystackReady = isPaystackConfigured();

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
      const outcome = await startCheckoutAction(courseId, provider);
      if (!outcome) {
        setError("Could not start checkout — please try again");
        return;
      }
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }
      window.location.href = outcome.checkoutUrl;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-6 rounded-card border border-border bg-surface p-4">
      {priceCents === 0 ? (
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
            {formatPrice(priceCents, currency)}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
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
              disabled={loading !== null || !paystackReady}
              title={!paystackReady ? "Paystack is not configured" : ""}
              className="rounded-card border border-[#4451A2] px-4 py-2 text-[15px] font-medium text-[#4451A2] hover:bg-[#4451A2]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
      {error && (
        <p className="mt-3 rounded-pill bg-[#E82027]/15 px-3 py-2 text-[13px] font-semibold text-[#E82027]">
          {error}
        </p>
      )}
    </div>
  );
}
