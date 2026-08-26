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

      // Paystack Inline: opens an overlay on the page instead of redirecting.
      if (
        provider === "PAYSTACK" &&
        outcome.accessCode &&
        outcome.publicKey
      ) {
        await openPaystackInline(outcome.publicKey, outcome.accessCode, outcome.checkoutUrl);
      } else {
        // Stripe (or fallback): open hosted checkout in a new tab
        window.open(outcome.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setLoading(null);
    }
  }

  function openPaystackInline(
    publicKey: string,
    accessCode: string,
    fallbackUrl: string
  ): Promise<void> {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PaystackPop = (window as any).PaystackPop as
        | undefined
        | {
            setup: (opts: {
              key: string;
              access_code: string;
              callback: (response: { reference: string }) => void;
              onClose: () => void;
            }) => { openIframe: () => void };
          };

      if (!PaystackPop) {
        // Inline script not loaded yet — fall back to a centered popup window
        const popup = window.open(
          fallbackUrl,
          "paystack_payment",
          "width=600,height=700,left=200,top=100,noopener,noreferrer"
        );
        if (!popup) {
          window.location.href = fallbackUrl;
        }
        resolve();
        return;
      }

      const handler = PaystackPop.setup({
        key: publicKey,
        access_code: accessCode,
        callback: (response) => {
          // Stay on the same page — refresh enrollment state from the server
          window.location.href = `/dashboard/learn/${courseId}?checkout=success&ref=${response.reference}`;
          resolve();
        },
        onClose: () => {
          resolve();
        },
      });
      handler.openIframe();
    });
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
