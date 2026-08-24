"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttemptAction, type AssessmentAttemptResult } from "../actions";

export interface AssessmentQuestionForLearner {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  prompt: string;
  options: string[] | null;
}

export function AssessmentTaker({
  assessmentId,
  as,
  questions,
}: {
  assessmentId: string;
  as: "BASELINE" | "MONTHLY" | "CLOSING";
  questions: AssessmentQuestionForLearner[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentAttemptResult | null>(null);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const answered = answers[question?.id] !== undefined;

  async function handleNext() {
    if (!answered) {
      setError("Select an answer to continue.");
      return;
    }
    setError(null);

    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    const outcome = await submitAssessmentAttemptAction(assessmentId, as, answers);
    setSubmitting(false);

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setResult(outcome.result);
  }

  if (result) {
    return (
      <div className="rounded-card border border-border bg-background p-6 text-center shadow-card">
        <p className="text-[15px] text-text-secondary">Assessment complete</p>
        <p className="mt-2 text-[40px] font-semibold text-text-primary">{Math.round(result.attempt.score)}%</p>
        {result.growthRecord && (
          <p className="mt-2 text-[15px] text-text-secondary">
            Growth from baseline:{" "}
            <span className={result.growthRecord.growthRate >= 0 ? "text-success font-medium" : "text-red font-medium"}>
              {result.growthRecord.growthRate >= 0 ? "+" : ""}
              {result.growthRecord.growthRate} pts
            </span>
          </p>
        )}
        <button
          onClick={() => router.push("/dashboard/assessments")}
          className="mt-6 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-blue/90 transition-colors"
        >
          Back to assessments
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-background p-6 shadow-card">
      <p className="text-[13px] text-text-secondary">
        Question {index + 1} of {questions.length}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-surface">
        <div
          className="h-full bg-blue transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <fieldset key={question.id} className="mt-6" disabled={submitting}>
        <legend className="text-[17px] font-medium text-text-primary">{question.prompt}</legend>

        {question.type === "MULTIPLE_CHOICE" && question.options && (
          <div className="mt-4 space-y-2">
            {question.options.map((opt, idx) => (
              <label
                key={idx}
                className={`flex cursor-pointer items-center gap-2 rounded-card border px-3 py-2.5 text-[15px] transition-colors ${
                  answers[question.id] === idx ? "border-blue bg-blue/5 text-text-primary" : "border-border text-text-primary hover:bg-surface"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  className="h-4 w-4"
                  checked={answers[question.id] === idx}
                  onChange={() => setAnswers((a) => ({ ...a, [question.id]: idx }))}
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {question.type === "TRUE_FALSE" && (
          <div className="mt-4 flex gap-3">
            {[true, false].map((val) => (
              <label
                key={String(val)}
                className={`flex-1 cursor-pointer rounded-card border px-3 py-2.5 text-center text-[15px] transition-colors ${
                  answers[question.id] === val ? "border-blue bg-blue/5 text-text-primary" : "border-border text-text-primary hover:bg-surface"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  className="sr-only"
                  checked={answers[question.id] === val}
                  onChange={() => setAnswers((a) => ({ ...a, [question.id]: val }))}
                />
                {val ? "True" : "False"}
              </label>
            ))}
          </div>
        )}

        {question.type === "SHORT_ANSWER" && (
          <input
            type="text"
            value={(answers[question.id] as string) ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [question.id]: e.target.value }))}
            className="mt-4 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
          />
        )}
      </fieldset>

      {error && <p className="mt-4 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}

      <div className="mt-6 flex justify-end border-t border-border pt-4">
        <button
          onClick={handleNext}
          disabled={submitting}
          className="rounded-card bg-blue px-5 py-2 text-[14px] font-medium text-white hover:bg-blue/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting…" : isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
