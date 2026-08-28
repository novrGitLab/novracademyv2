"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createAssessmentAction } from "../actions";

export default function NewAssessmentPage() {
  const { data: session } = useSession();
  const isOrgAdmin = session?.user?.role === "ORG_ADMIN";
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"BASELINE" | "MONTHLY" | "CLOSING">(isOrgAdmin ? "MONTHLY" : "BASELINE");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createAssessmentAction(formData);
    });
  }

  const now = new Date();

  return (
    <div className="mx-auto max-w-xl py-6">
      <Link
        href="/admin/assessments"
        className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to assessments
      </Link>

      <div className="rounded-card border border-border bg-background p-6 shadow-card">
        <header className="border-b border-border pb-4">
          <h1 className="text-[22px] font-semibold text-text-primary">New assessment</h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            {isOrgAdmin
              ? "Org admins can create monthly assessments for their own organization."
              : "Create a baseline, monthly, or closing assessment."}
          </p>
        </header>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary">Title</label>
            <input
              name="title"
              required
              placeholder="e.g. September security awareness check-in"
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary">Type</label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                disabled={isOrgAdmin}
                className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors disabled:opacity-60"
              >
                {!isOrgAdmin && <option value="BASELINE">Baseline (also used for closing)</option>}
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary">Scope</label>
              <select
                name="scope"
                defaultValue={isOrgAdmin ? "ORGANIZATION" : "UNIVERSAL"}
                disabled={isOrgAdmin}
                className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors disabled:opacity-60"
              >
                <option value="UNIVERSAL">Universal (all users)</option>
                <option value="ORGANIZATION">My organization only</option>
              </select>
            </div>
          </div>

          {type === "MONTHLY" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary">Month</label>
                <input
                  name="month"
                  type="number"
                  min={1}
                  max={12}
                  defaultValue={now.getMonth() + 1}
                  className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary">Year</label>
                <input
                  name="year"
                  type="number"
                  defaultValue={now.getFullYear()}
                  className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary">Available from</label>
                <input
                  name="scheduledFor"
                  type="date"
                  className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
                />
              </div>
            </div>
          )}

          <p className="text-[13px] text-text-secondary">You&apos;ll add questions on the next screen.</p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/admin/assessments"
              className="rounded-card border border-border px-4 py-2 text-[14px] font-medium text-text-primary hover:bg-surface transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white shadow-card hover:bg-blue/90 disabled:opacity-50 transition-all"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Creating..." : "Create assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
