import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { AssessmentQuestion } from "../QuestionBuilder";

interface AssessmentDetail {
  id: string;
  title: string;
  type: "BASELINE" | "MONTHLY" | "CLOSING";
  questions: AssessmentQuestion[];
}

export default async function AssessmentPreviewPage({ params }: { params: { id: string } }) {
  const assessment = await apiFetch<AssessmentDetail>(`/assessments/${params.id}`).catch(() => null);
  if (!assessment) notFound();

  return (
    <div className="mx-auto max-w-xl py-6">
      <Link
        href={`/admin/assessments/${assessment.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to editor
      </Link>

      <div className="rounded-card border border-border bg-background p-4 shadow-card">
        <p className="text-[13px] text-text-secondary">Learner preview — correct answers highlighted for you only</p>
        <h1 className="mt-1 text-[22px] font-semibold text-text-primary">{assessment.title}</h1>
      </div>

      {assessment.questions.length === 0 ? (
        <p className="mt-6 text-[15px] text-text-secondary">This assessment has no questions yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {assessment.questions.map((q, i) => (
            <div key={q.id} className="rounded-card border border-border bg-background p-5">
              <p className="text-[13px] text-text-secondary">
                Question {i + 1} of {assessment.questions.length} · {q.points} pt{q.points === 1 ? "" : "s"}
              </p>
              <p className="mt-2 text-[17px] font-medium text-text-primary">{q.prompt}</p>

              {q.type === "MULTIPLE_CHOICE" && q.options && (
                <div className="mt-4 space-y-2">
                  {q.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`rounded-card border px-3 py-2.5 text-[15px] ${
                        idx === q.correctAnswer
                          ? "border-success bg-success-light text-success font-medium"
                          : "border-border text-text-primary"
                      }`}
                    >
                      {idx === q.correctAnswer ? "✓ " : ""}
                      {opt}
                    </div>
                  ))}
                </div>
              )}

              {q.type === "TRUE_FALSE" && (
                <div className="mt-4 flex gap-3">
                  {[true, false].map((val) => (
                    <div
                      key={String(val)}
                      className={`flex-1 rounded-card border px-3 py-2.5 text-center text-[15px] ${
                        val === q.correctAnswer
                          ? "border-success bg-success-light text-success font-medium"
                          : "border-border text-text-primary"
                      }`}
                    >
                      {val ? "True" : "False"}
                    </div>
                  ))}
                </div>
              )}

              {q.type === "SHORT_ANSWER" && (
                <div className="mt-4 rounded-card border border-dashed border-border px-3 py-2.5 text-[15px] text-text-secondary">
                  Expected: <span className="font-medium text-success">{String(q.correctAnswer)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
