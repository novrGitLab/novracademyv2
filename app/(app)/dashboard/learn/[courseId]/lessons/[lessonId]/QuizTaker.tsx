"use client";

import { useState } from "react";
import Link from "next/link";
import { submitQuizAttemptAction, type QuizAttemptResult } from "./actions";

export interface QuizQuestionForLearner {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  prompt: string;
  options: string[] | null;
  points: number;
  order: number;
}

export function QuizTaker({
  courseId,
  lessonId,
  questions,
  passMarkPct,
  maxAttempts,
  attemptsUsed,
  initialCompleted,
  nextLessonHref,
}: {
  courseId: string;
  lessonId: string;
  questions: QuizQuestionForLearner[];
  passMarkPct: number;
  maxAttempts: number;
  attemptsUsed: number;
  initialCompleted: boolean;
  nextLessonHref: string | null;
}) {
  const [answers, setAnswers] = useState<Record<string, number | boolean | string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const attemptsRemaining = result ? result.attemptsRemaining : Math.max(0, maxAttempts - attemptsUsed);
  const outOfAttempts = attemptsRemaining <= 0 && !(result?.passed ?? initialCompleted);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      setError("Answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const outcome = await submitQuizAttemptAction(courseId, lessonId, answers);
    setSubmitting(false);

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setResult(outcome.result);
  }

  const resultByQuestion = new Map(result?.results.map((r) => [r.questionId, r.correct]));

  return (
    <div>
      <p className="text-[13px] text-text-secondary">
        Pass mark: {passMarkPct}% · Attempts used: {result ? result.attemptNumber : attemptsUsed} of {maxAttempts}
      </p>

      {result && (
        <div
          className={`mt-3 rounded-card px-4 py-3 text-[15px] ${
            result.passed ? "bg-emerald-50 text-emerald-600" : "bg-[#E82027]/15 text-[#E82027]"
          }`}
        >
          {result.passed ? "Passed! " : "Not quite — "}Score: {Math.round(result.score)}%
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        {questions.map((q, i) => (
          <fieldset key={q.id} className="rounded-card border border-border bg-background p-4" disabled={Boolean(result?.passed) || outOfAttempts}>
            <legend className="px-1 text-[15px] font-medium text-text-primary">
              {i + 1}. {q.prompt}
              {result && (
                <span className={`ml-2 text-[13px] ${resultByQuestion.get(q.id) ? "text-emerald-600" : "text-[#E82027]"}`}>
                  {resultByQuestion.get(q.id) ? "✓ correct" : "✗ incorrect"}
                </span>
              )}
            </legend>

            {q.type === "MULTIPLE_CHOICE" && q.options && (
              <div className="mt-2 space-y-1.5">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-[15px] text-text-primary">
                    <input
                      type="radio"
                      name={q.id}
                      value={idx}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                      required
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {q.type === "TRUE_FALSE" && (
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2 text-[15px] text-text-primary">
                  <input
                    type="radio"
                    name={q.id}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: true }))}
                    required
                  />
                  True
                </label>
                <label className="flex items-center gap-2 text-[15px] text-text-primary">
                  <input
                    type="radio"
                    name={q.id}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: false }))}
                    required
                  />
                  False
                </label>
              </div>
            )}

            {q.type === "SHORT_ANSWER" && (
              <input
                type="text"
                required
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="mt-2 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-[#4451A2]"
              />
            )}
          </fieldset>
        ))}

        {error && <p className="rounded-pill bg-[#E82027]/15 px-3 py-2 text-[13px] font-semibold text-[#E82027]">{error}</p>}

        {outOfAttempts && !result?.passed && (
                <p className="rounded-pill bg-[#E82027]/15 px-3 py-2 text-[13px] font-semibold text-[#E82027]">
            No attempts remaining for this quiz.
          </p>
        )}

        {!result?.passed && !outOfAttempts && (
          <button
            type="submit"
            disabled={submitting}
            className="rounded-card bg-[#4451A2] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#39458e] disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit quiz"}
          </button>
        )}
      </form>

      {(result?.passed || initialCompleted) && nextLessonHref && (
        <Link
          href={nextLessonHref}
          className="mt-4 inline-block rounded-card bg-[#4451A2] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#39458e]"
        >
          Next lesson →
        </Link>
      )}
    </div>
  );
}
