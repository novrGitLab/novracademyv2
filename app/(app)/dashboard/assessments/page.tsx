import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { apiFetchSafe } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";

interface AssessmentSummary {
  id: string;
  title: string;
  type: "BASELINE" | "MONTHLY" | "CLOSING";
  questionCount: number;
}

interface LearnerAssessments {
  pendingBaseline: AssessmentSummary | null;
  pendingClosing: AssessmentSummary[];
  dueMonthly: AssessmentSummary[];
}

function AssessmentRow({ assessment, as }: { assessment: AssessmentSummary; as: "BASELINE" | "MONTHLY" | "CLOSING" }) {
  return (
    <Link
      href={`/dashboard/assessments/${assessment.id}?as=${as}`}
      className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3 hover:border-blue transition-colors"
    >
      <div>
        <p className="text-[15px] font-medium text-text-primary">{assessment.title}</p>
        <p className="text-[13px] text-text-secondary">
          {assessment.questionCount} question{assessment.questionCount === 1 ? "" : "s"}
        </p>
      </div>
      <span className="rounded-pill bg-blue/10 px-3 py-1 text-[13px] font-medium text-blue">Start</span>
    </Link>
  );
}

export default async function DashboardAssessmentsPage() {
  const data = await apiFetchSafe<LearnerAssessments>("/assessments", {
    pendingBaseline: null,
    pendingClosing: [],
    dueMonthly: [],
  });

  const hasAny = data.pendingBaseline || data.pendingClosing.length > 0 || data.dueMonthly.length > 0;

  return (
    <div className="max-w-2xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Assessments</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Baseline, monthly, and closing assessments track your growth over time.
      </p>

      {!hasAny ? (
        <div className="mt-6">
          <EmptyState icon={ClipboardCheck} title="Nothing due right now" description="Check back later for new assessments." />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {data.pendingBaseline && (
            <section>
              <h2 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-text-secondary">Baseline</h2>
              <AssessmentRow assessment={data.pendingBaseline} as="BASELINE" />
            </section>
          )}

          {data.dueMonthly.length > 0 && (
            <section>
              <h2 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-text-secondary">
                Monthly assessments due
              </h2>
              <div className="space-y-2">
                {data.dueMonthly.map((a) => (
                  <AssessmentRow key={a.id} assessment={a} as="MONTHLY" />
                ))}
              </div>
            </section>
          )}

          {data.pendingClosing.length > 0 && (
            <section>
              <h2 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-text-secondary">
                Closing assessment
              </h2>
              <div className="space-y-2">
                {data.pendingClosing.map((a) => (
                  <AssessmentRow key={a.id} assessment={a} as="CLOSING" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
