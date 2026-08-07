import Link from "next/link";
import { apiFetchSafe } from "@/lib/api";
import { assignEnrollmentAction, cohortEnrollAction } from "../../actions";
import { BulkEnrollForm } from "./BulkEnrollForm";
import { EnrollmentBulkTable } from "./EnrollmentBulkTable";

interface EnrollmentRow {
  id: string;
  source: "SELF_PAID" | "ADMIN_ASSIGNED" | "BULK" | "COHORT";
  status: "ACTIVE" | "EXPIRED" | "PENDING" | "CANCELLED";
  enrolledAt: string;
  expiresAt: string | null;
  progressPct: number;
  completedAt: string | null;
  user: { id: string; name: string | null; email: string };
  payment: { status: string; amountCents: number; currency: string; provider: string } | null;
}

interface Cohort {
  id: string;
  name: string;
  year: number | null;
  _count: { members: number };
}

export default async function EnrollmentsPage({ params }: { params: { id: string } }) {
  const [{ enrollments }, { cohorts }] = await Promise.all([
    apiFetchSafe<{ enrollments: EnrollmentRow[] }>(`/courses/${params.id}/enroll`, { enrollments: [] }),
    apiFetchSafe<{ cohorts: Cohort[] }>("/cohorts", { cohorts: [] }),
  ]);

  const boundAssign = assignEnrollmentAction.bind(null, params.id);
  const boundCohort = cohortEnrollAction.bind(null, params.id);

  return (
    <div className="max-w-4xl">
      <Link href={`/admin/courses/${params.id}`} className="text-[13px] text-text-secondary hover:text-[#683290]">
        ← Back to course
      </Link>
      <h1 className="mt-2 text-[24px] font-semibold text-text-primary">Enrollments</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-card border border-border bg-background p-4">
          <p className="text-[15px] font-medium text-text-primary">Assign a learner</p>
          <form action={boundAssign} className="mt-3 space-y-3">
            <input
              name="email"
              type="email"
              required
              placeholder="learner@example.com"
              className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
            />
            <input
              name="validityDays"
              type="number"
              placeholder="Validity (days)"
              className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
            />
            <button
              type="submit"
              className="rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573]"
            >
              Assign
            </button>
          </form>
        </div>

        <div className="rounded-card border border-border bg-background p-4">
          <p className="text-[15px] font-medium text-text-primary">Bulk enroll</p>
          <div className="mt-3">
            <BulkEnrollForm courseId={params.id} />
          </div>
        </div>

        <div className="rounded-card border border-border bg-background p-4">
          <p className="text-[15px] font-medium text-text-primary">Enroll a cohort</p>
          <form action={boundCohort} className="mt-3 space-y-3">
            <select
              name="cohortId"
              required
              className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
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
              className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#683290]"
            />
            <button
              type="submit"
              disabled={cohorts.length === 0}
              className="rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
            >
              Enroll cohort
            </button>
            {cohorts.length === 0 && (
              <p className="text-[13px] text-text-secondary">No cohorts yet — cohort management lands in Phase 3.</p>
            )}
          </form>
        </div>
      </div>

      <div className="mt-8">
        <EnrollmentBulkTable enrollments={enrollments} />
      </div>
    </div>
  );
}
