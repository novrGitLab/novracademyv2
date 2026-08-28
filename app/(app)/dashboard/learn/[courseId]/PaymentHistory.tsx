"use client";

import { formatPrice } from "@/lib/currency";

interface Payment {
  id: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  amountCents: number;
  currency: string;
  provider: "STRIPE" | "PAYSTACK";
  createdAt: string;
}

export function PaymentHistory({ payments }: { payments: Payment[] }) {
  if (!payments || payments.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-card border border-border bg-background p-6">
      <h3 className="text-sm font-semibold text-text-primary">Payment History</h3>
      <div className="mt-4 space-y-2">
        {payments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between rounded-card bg-surface px-3 py-2 text-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">
                  {formatPrice(payment.amountCents, payment.currency)}
                </span>
                <span className="text-xs text-text-secondary">via {payment.provider}</span>
              </div>
              <span className="text-xs text-text-secondary">
                {new Date(payment.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <PaymentStatusBadge status={payment.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    SUCCEEDED: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Completed",
    },
    PENDING: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      label: "Pending",
    },
    FAILED: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Failed",
    },
    REFUNDED: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Refunded",
    },
  };

  const style = styles[status] || styles.PENDING;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
