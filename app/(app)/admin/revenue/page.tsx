"use client";

import { DollarSign, Receipt } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { EmptyState } from "@/components/EmptyState";
import { StatCardsSkeleton, TableSkeleton } from "@/components/Skeleton";
import { StatCard } from "../StatCard";

interface RevenueSummary {
  byProvider: Record<string, number>;
  countsByStatus: Record<string, number>;
  byCourse: { courseId: string | null; title: string; totalCents: number }[];
  recentTransactions: {
    id: string;
    amountCents: number;
    currency: string;
    provider: string;
    status: string;
    createdAt: string;
    user: { name: string | null; email: string };
    course: { title: string } | null;
  }[];
}

function formatCents(cents: number, currency = "USD") {
  return `${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export default function RevenuePage() {
  const { data, loading } = useApi<RevenueSummary>("/analytics/revenue", {
    byProvider: {},
    countsByStatus: {},
    byCourse: [],
    recentTransactions: [],
  });
  const totalRevenue = Object.values(data.byProvider).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Revenue</h1>

      <div className="mt-6">
        {loading ? (
          <StatCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total revenue" value={formatCents(totalRevenue)} />
            <StatCard label="Via Stripe" value={formatCents(data.byProvider.STRIPE ?? 0)} />
            <StatCard label="Via Paystack" value={formatCents(data.byProvider.PAYSTACK ?? 0)} />
            <StatCard label="Failed payments" value={data.countsByStatus.FAILED ?? 0} />
          </div>
        )}
      </div>

      <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Revenue by course</h2>
      {loading ? (
        <div className="mt-3">
          <TableSkeleton />
        </div>
      ) : data.byCourse.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon={DollarSign} title="No revenue yet" description="Revenue by course will appear once learners start enrolling." />
        </div>
      ) : (
      <div className="mt-3 overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-[15px]">
          <thead className="bg-surface text-[13px] text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.byCourse.map((c) => (
              <tr key={c.courseId ?? c.title} className="border-t border-border">
                <td className="px-4 py-3 text-text-primary">{c.title}</td>
                <td className="px-4 py-3 text-text-secondary">{formatCents(c.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Recent transactions</h2>
      {loading ? (
        <div className="mt-3">
          <TableSkeleton />
        </div>
      ) : data.recentTransactions.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon={Receipt} title="No transactions yet" description="Successful payments will show up here." />
        </div>
      ) : (
      <div className="mt-3 overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-[15px]">
          <thead className="bg-surface text-[13px] text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recentTransactions.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3 text-text-primary">{t.user.name ?? t.user.email}</td>
                <td className="px-4 py-3 text-text-secondary">{t.course?.title ?? "—"}</td>
                <td className="px-4 py-3 text-text-secondary">{formatCents(t.amountCents, t.currency)}</td>
                <td className="px-4 py-3 text-text-secondary">{t.provider}</td>
                <td className="px-4 py-3 text-text-secondary">{t.status}</td>
                <td className="px-4 py-3 text-text-secondary">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
