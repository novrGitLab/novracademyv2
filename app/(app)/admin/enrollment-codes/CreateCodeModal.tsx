"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { createEnrollmentCodeAction } from "./actions";

interface Course {
  id: string;
  title: string;
}

export function CreateCodeModal({ courses }: { courses: Course[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [discountType, setDiscountType] = useState<"FREE" | "PERCENTAGE" | "FIXED_AMOUNT">("FREE");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createEnrollmentCodeAction(formData);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-blue/90 transition-colors"
      >
        Create code
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Create enrollment code" size="sm">
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary">Course</label>
            <select
              name="courseId"
              required
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary">Code (optional — auto-generated if blank)</label>
            <input
              name="code"
              placeholder="NOVR-XXXX-XXXX"
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 font-mono text-[15px] text-text-primary outline-none focus:border-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary">Discount type</label>
              <select
                name="discountType"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as typeof discountType)}
                className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
              >
                <option value="FREE">Free access</option>
                <option value="PERCENTAGE">Percentage off</option>
                <option value="FIXED_AMOUNT">Fixed amount off</option>
              </select>
            </div>
            {discountType !== "FREE" && (
              <div>
                <label className="block text-[13px] font-medium text-text-secondary">
                  {discountType === "PERCENTAGE" ? "Percent off" : "Cents off"}
                </label>
                <input
                  name="discountValue"
                  type="number"
                  min={0}
                  required
                  className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary">Max uses</label>
              <input
                name="maxUses"
                type="number"
                min={1}
                defaultValue={1}
                className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary">Expires (optional)</label>
              <input
                name="expiresAt"
                type="date"
                className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-card border border-border px-4 py-2 text-[14px] font-medium text-text-primary hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-blue/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Creating..." : "Create code"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
