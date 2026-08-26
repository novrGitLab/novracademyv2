"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export function PaymentStatusAlert() {
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");

  if (!checkoutStatus) {
    return null;
  }

  if (checkoutStatus === "success") {
    return (
      <div className="mb-6 flex gap-3 rounded-card border border-green-200/50 bg-green-50/80 p-4 text-green-900">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
        <div>
          <p className="font-semibold">Payment successful!</p>
          <p className="mt-1 text-sm opacity-90">
            Your payment has been processed and you are now enrolled in this course. Enjoy learning!
          </p>
        </div>
      </div>
    );
  }

  if (checkoutStatus === "cancelled") {
    return (
      <div className="mb-6 flex gap-3 rounded-card border border-amber-200/50 bg-amber-50/80 p-4 text-amber-900">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Payment cancelled</p>
          <p className="mt-1 text-sm opacity-90">
            You cancelled the payment. Try again when you're ready, or contact support for help.
          </p>
        </div>
      </div>
    );
  }

  if (checkoutStatus === "failed") {
    return (
      <div className="mb-6 flex gap-3 rounded-card border border-red-200/50 bg-red-50/80 p-4 text-red-900">
        <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <div>
          <p className="font-semibold">Payment failed</p>
          <p className="mt-1 text-sm opacity-90">
            We encountered an issue processing your payment. Please try again or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
