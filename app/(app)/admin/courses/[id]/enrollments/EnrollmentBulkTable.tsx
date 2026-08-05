"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bulkExtendValidityAction, bulkUnenrollAction } from "./bulkActions";

interface EnrollmentRow {
  id: string;
  source: string;
  status: string;
  enrolledAt: string;
  expiresAt: string | null;
  progressPct: number;
  completedAt: string | null;
  user: { id: string; name: string | null; email: string };
  payment: { status: string; amountCents: number; currency: string; provider: string } | null;
}

export function EnrollmentBulkTable({ enrollments }: { enrollments: EnrollmentRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === enrollments.length ? new Set() : new Set(enrollments.map((e) => e.id))));
  }

  async function handleUnenroll() {
    if (!confirm(`Unenroll ${selected.size} learner(s)?`)) return;
    setPending(true);
    await bulkUnenrollAction(Array.from(selected));
    setSelected(new Set());
    setPending(false);
    router.refresh();
  }

  async function handleExtend() {
    const days = Number(prompt("Extend validity by how many days?", "30"));
    if (!days) return;
    setPending(true);
    await bulkExtendValidityAction(Array.from(selected), days);
    setSelected(new Set());
    setPending(false);
    router.refresh();
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-card border border-blue bg-blue-light px-4 py-3">
          <span className="text-[13px] font-medium text-blue">{selected.size} selected</span>
          <button
            disabled={pending}
            onClick={handleExtend}
            className="rounded-pill bg-white px-3 py-1 text-[13px] text-text-primary hover:bg-surface disabled:opacity-50"
          >
            Extend validity
          </button>
          <button
            disabled={pending}
            onClick={handleUnenroll}
            className="rounded-pill bg-white px-3 py-1 text-[13px] text-red hover:bg-surface disabled:opacity-50"
          >
            Unenroll
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-[15px]">
          <thead className="bg-surface text-[13px] text-text-secondary">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === enrollments.length && enrollments.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3 font-medium">Learner</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Enrolled</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Payment</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">{e.user.name ?? e.user.email}</p>
                  <p className="text-[13px] text-text-secondary">{e.user.email}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary">{e.source}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-pill px-2 py-1 text-[13px] ${
                      e.status === "ACTIVE" ? "bg-success-light text-success" : "bg-surface text-text-secondary"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {e.completedAt ? <span className="text-success">Completed</span> : `${Math.round(e.progressPct)}%`}
                </td>
                <td className="px-4 py-3 text-text-secondary">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : "Lifetime"}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {e.payment ? `${(e.payment.amountCents / 100).toFixed(2)} ${e.payment.currency} (${e.payment.provider})` : "—"}
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">
                  No enrollments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
