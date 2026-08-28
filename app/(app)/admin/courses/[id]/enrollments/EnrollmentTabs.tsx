"use client";

import { useState } from "react";
import { BulkEnrollForm } from "./BulkEnrollForm";

interface Cohort {
  id: string;
  name: string;
  year: number | null;
  _count: { members: number };
}

interface EnrollmentCode {
  id: string;
  code: string;
  discountType: "FREE" | "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

function discountLabel(row: EnrollmentCode) {
  if (row.discountType === "FREE") return "Free access";
  if (row.discountType === "PERCENTAGE") return `${row.discountValue}% off`;
  return `$${(row.discountValue / 100).toFixed(2)} off`;
}

const TABS = ["Manual", "Bulk", "Cohort", "Code"] as const;

export function EnrollmentTabs({
  courseId,
  cohorts,
  codes,
  assignAction,
  cohortAction,
}: {
  courseId: string;
  cohorts: Cohort[];
  codes: EnrollmentCode[];
  assignAction: (formData: FormData) => void | Promise<void>;
  cohortAction: (formData: FormData) => void | Promise<void>;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Manual");

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[14px] font-medium transition-colors ${
              tab === t ? "border-b-2 border-blue text-blue" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t} Enroll
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-card border border-border bg-background p-4">
        {tab === "Manual" && (
          <form action={assignAction} className="space-y-3">
            <label className="block text-[13px] font-medium text-text-secondary">Search user by email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="learner@example.com"
              className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
            <input
              name="validityDays"
              type="number"
              placeholder="Validity (days)"
              className="w-64 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
            <button type="submit" className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90">
              Assign
            </button>
          </form>
        )}

        {tab === "Bulk" && <BulkEnrollForm courseId={courseId} />}

        {tab === "Cohort" && (
          <form action={cohortAction} className="space-y-3">
            <label className="block text-[13px] font-medium text-text-secondary">Select cohort</label>
            <select
              name="cohortId"
              required
              className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            >
              <option value="">Select a cohort…</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.year ? `(${c.year})` : ""} — {c._count.members} members
                </option>
              ))}
            </select>
            <input
              name="validityDays"
              type="number"
              placeholder="Validity (days)"
              className="w-64 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
            <button
              type="submit"
              disabled={cohorts.length === 0}
              className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90 disabled:opacity-50"
            >
              Enroll cohort
            </button>
            {cohorts.length === 0 && <p className="text-[13px] text-text-secondary">No cohorts yet.</p>}
          </form>
        )}

        {tab === "Code" && (
          <div>
            <p className="text-[13px] text-text-secondary">
              Enrollment codes that grant access to this course.{" "}
              <a href="/admin/enrollment-codes" className="text-blue hover:underline">
                Manage all codes →
              </a>
            </p>
            {codes.length === 0 ? (
              <p className="mt-3 text-[13px] text-text-secondary">No codes created for this course yet.</p>
            ) : (
              <div className="mt-3 overflow-hidden rounded-card border border-border">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-surface text-[12px] text-text-secondary">
                    <tr>
                      <th className="px-3 py-2 font-medium">Code</th>
                      <th className="px-3 py-2 font-medium">Discount</th>
                      <th className="px-3 py-2 font-medium">Uses</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((c) => (
                      <tr key={c.id} className="border-t border-border">
                        <td className="px-3 py-2 font-mono text-text-primary">{c.code}</td>
                        <td className="px-3 py-2 text-text-secondary">{discountLabel(c)}</td>
                        <td className="px-3 py-2 text-text-secondary">
                          {c.usedCount} / {c.maxUses}
                        </td>
                        <td className="px-3 py-2 text-text-secondary">{c.isActive ? "Active" : "Deactivated"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
