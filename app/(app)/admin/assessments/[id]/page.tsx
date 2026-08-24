import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch, apiFetchSafe } from "@/lib/api";
import { releaseClosingAction } from "../actions";
import { QuestionBuilder, type AssessmentQuestion } from "./QuestionBuilder";
import { ResultsTable } from "./ResultsTable";

interface AssessmentDetail {
  id: string;
  title: string;
  type: "BASELINE" | "MONTHLY" | "CLOSING";
  scope: "UNIVERSAL" | "ORGANIZATION";
  questions: AssessmentQuestion[];
}

interface CohortRow {
  id: string;
  name: string;
}

export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  const assessment = await apiFetch<AssessmentDetail>(`/assessments/${params.id}`).catch(() => null);
  if (!assessment) notFound();

  const { cohorts } = await apiFetchSafe<{ cohorts: CohortRow[] }>("/cohorts", { cohorts: [] });

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/assessments"
        className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to assessments
      </Link>

      <h1 className="text-[24px] font-semibold text-text-primary">{assessment.title}</h1>
      <p className="mt-1 text-[14px] text-text-secondary">
        {assessment.type} · {assessment.scope}
      </p>

      <section className="mt-6">
        <h2 className="mb-2 text-[15px] font-medium text-text-primary">Questions</h2>
        <QuestionBuilder assessmentId={assessment.id} questions={assessment.questions} />
      </section>

      {assessment.type === "BASELINE" && (
        <section className="mt-8">
          <h2 className="mb-2 text-[15px] font-medium text-text-primary">Release closing assessment</h2>
          <p className="mb-3 text-[13px] text-text-secondary">
            Learners can&apos;t take the closing pass until it&apos;s released to them, individually or by cohort.
          </p>
          <form action={releaseClosingAction.bind(null, assessment.id)} className="flex flex-wrap items-end gap-3 rounded-card border border-dashed border-border p-4">
            <div>
              <label className="block text-[13px] text-text-secondary">User ID</label>
              <input
                name="userId"
                placeholder="Release to one user"
                className="mt-1 w-56 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
              />
            </div>
            <span className="pb-2 text-[13px] text-text-secondary">or</span>
            <div>
              <label className="block text-[13px] text-text-secondary">Cohort</label>
              <select
                name="cohortId"
                className="mt-1 w-56 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
              >
                <option value="">Select a cohort…</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-blue/90 transition-colors">
              Release
            </button>
          </form>
        </section>
      )}

      <section className="mt-8">
        <ResultsTable assessmentId={assessment.id} />
      </section>
    </div>
  );
}
