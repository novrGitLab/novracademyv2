import Link from "next/link";
import { apiFetchSafe } from "@/lib/api";
import { assignEnrollmentAction, cohortEnrollAction } from "../../actions";
import { EnrollmentTabs } from "./EnrollmentTabs";
import { EnrollmentBulkTable } from "./EnrollmentBulkTable";

interface EnrollmentRow {
  id: string;
  source: "SELF_PAID" | "ADMIN_ASSIGNED" | "BULK" | "COHORT" | "CODE";
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

export default async function EnrollmentsPage({ params }: { params: { id: string } }) {
  const [{ enrollments }, { cohorts }, codes] = await Promise.all([
    apiFetchSafe<{ enrollments: EnrollmentRow[] }>(`/courses/${params.id}/enroll`, { enrollments: [] }),
    apiFetchSafe<{ cohorts: Cohort[] }>("/cohorts", { cohorts: [] }),
    apiFetchSafe<EnrollmentCode[]>(`/enrollment-codes?courseId=${params.id}`, []),
  ]);

  const boundAssign = assignEnrollmentAction.bind(null, params.id);
  const boundCohort = cohortEnrollAction.bind(null, params.id);

  return (
    <div className="max-w-4xl">
      <Link href={`/admin/courses/${params.id}`} className="text-[13px] text-text-secondary hover:text-[#683290]">
        ← Back to course
      </Link>
      <h1 className="mt-2 text-[24px] font-semibold text-text-primary">Enrollments</h1>

      <div className="mt-6">
        <EnrollmentTabs
          courseId={params.id}
          cohorts={cohorts}
          codes={codes}
          assignAction={boundAssign}
          cohortAction={boundCohort}
        />
      </div>

      <div className="mt-8">
        <EnrollmentBulkTable enrollments={enrollments} />
      </div>
    </div>
  );
}
