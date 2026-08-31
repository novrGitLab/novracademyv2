"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ChevronRight, Award, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  explanation: string;
}

interface AttemptResult {
  correct: boolean;
  explanation?: string;
}

interface SubmitResponse {
  attemptId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  passMarkPct: number;
  maxAttempts: number;
  attemptsRemaining: number;
  results: { questionId: string; correct: boolean }[];
  courseProgressPct: number;
}

interface AttemptHistoryEntry {
  id: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  submittedAt: string;
}

export function QuizContent({
  courseId,
  lessonId,
  lessonTitle,
  questions,
  totalLessons,
  lessonOrder,
  allLessonIds,
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  questions: QuizQuestion[];
  totalLessons: number;
  lessonOrder: number;
  allLessonIds: string[];
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Server-graded result state (set after a submit succeeds)
  const [attempt, setAttempt] = useState<SubmitResponse | null>(null);
  const [perQuestion, setPerQuestion] = useState<Record<string, { correct: boolean }>>({});
  const [justPassed, setJustPassed] = useState(false);

  // Attempt history from the server
  const [attempts, setAttempts] = useState<AttemptHistoryEntry[]>([]);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/proxy/courses/${courseId}/lessons/${lessonId}/quiz/attempts`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return (await res.json()) as { attempts: AttemptHistoryEntry[]; maxAttempts: number };
      })
      .then((data) => {
        setAttempts(data.attempts ?? []);
        setMaxAttempts(data.maxAttempts ?? 3);
      })
      .catch(() => {
        // History is best-effort; the quiz still works without it.
      })
      .finally(() => setHistoryLoading(false));
  }, [courseId, lessonId]);

  const question = questions[currentQ];
  const totalQuestions = questions.length;
  const usedAttempts = attempts.length;
  const attemptsRemaining = Math.max(0, maxAttempts - usedAttempts);
  const noAttemptsLeft = !historyLoading && attemptsRemaining <= 0;

  function handleSelect(i: number) {
    if (submitting) return;
    setSelected(i);
    setSubmitError(null);
  }

  function handleNext() {
    if (selected === null) return;
    setAnswers((prev) => ({ ...prev, [question.id]: selected }));
    if (currentQ + 1 < totalQuestions) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      // All answered — submit to the server for grading.
      const finalAnswers = { ...answers, [question.id]: selected };
      submitAttempt(finalAnswers);
    }
  }

  async function submitAttempt(allAnswers: Record<string, number>) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/proxy/courses/${courseId}/lessons/${lessonId}/quiz/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: allAnswers }),
        cache: "no-store",
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error ?? `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as SubmitResponse;
      setAttempt(data);
      setPerQuestion(Object.fromEntries(data.results.map((r) => [r.questionId, { correct: r.correct }])));
      setJustPassed(data.passed && !attempts.some((a) => a.passed));
      // The backend already created LessonProgress on pass.
    } catch (err) {
      setSubmitError((err as Error).message || "Could not submit your quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setCurrentQ(0);
    setSelected(null);
    setAnswers({});
    setAttempt(null);
    setPerQuestion({});
    setSubmitError(null);
    setJustPassed(false);
    // Refresh history so the attempt count is current.
    setHistoryLoading(true);
    fetch(`/api/proxy/courses/${courseId}/lessons/${lessonId}/quiz/attempts`, { cache: "no-store" })
      .then(async (res) => (res.ok ? (await res.json()) as { attempts: AttemptHistoryEntry[]; maxAttempts: number } : null))
      .then((data) => {
        if (data) {
          setAttempts(data.attempts ?? []);
          setMaxAttempts(data.maxAttempts ?? 3);
        }
      })
      .finally(() => setHistoryLoading(false));
  }

  // Next lesson navigation
  const currentLessonIndex = allLessonIds.indexOf(lessonId);
  const nextLessonId =
    currentLessonIndex >= 0 && currentLessonIndex < allLessonIds.length - 1
      ? allLessonIds[currentLessonIndex + 1]
      : null;

  // ---------- Result screen ----------
  if (attempt) {
    const passed = attempt.passed;
    return (
      <div className="rounded-card border border-border bg-background p-8 text-center shadow-card">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            passed ? "bg-emerald-600" : "bg-surface"
          } text-white`}
        >
          <Award className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-[22px] font-semibold text-text-primary">
          {passed ? "Quiz Complete!" : "Not quite"}
        </h2>
        <p className="mt-2 text-[40px] font-bold text-text-primary">
          {attempt.score.toFixed(0)}%
        </p>
        <p className="mt-2 text-[15px] text-text-secondary">
          {passed
            ? `Congratulations! You passed with ${attempt.score.toFixed(0)}% (pass mark ${attempt.passMarkPct}%).`
            : `You needed ${attempt.passMarkPct}% to pass. You have ${attempt.attemptsRemaining} attempt${attempt.attemptsRemaining === 1 ? "" : "s"} remaining.`}
        </p>

        {/* Per-question breakdown */}
        <div className="mt-6 space-y-2 text-left">
          {questions.map((q, i) => {
            const r = perQuestion[q.id];
            return (
              <div
                key={q.id}
                className={`flex items-start gap-3 rounded-card border px-4 py-3 text-[13px] ${
                  r?.correct
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {r?.correct ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                )}
                <div>
                  <p className="font-medium">{i + 1}. {q.question}</p>
                  {!r?.correct && q.explanation && (
                    <p className="mt-1 text-[12px] opacity-80">{q.explanation}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          {!passed && attempt.attemptsRemaining > 0 && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-card border border-border bg-background px-5 py-2.5 text-[14px] font-medium text-text-primary shadow-card transition hover:bg-surface"
            >
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          )}
          {passed && nextLessonId && (
            <Link
              href={`/dashboard/learn/${courseId}/lessons/${nextLessonId}`}
              className="inline-flex items-center gap-2 rounded-card bg-[#4451A2] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#39458e]"
            >
              Continue to next lesson <ChevronRight className="h-4 w-4" />
            </Link>
          )}
          {passed && !nextLessonId && (
            <Link
              href={`/dashboard/learn/${courseId}`}
              className="inline-flex items-center gap-2 rounded-card bg-emerald-600 px-5 py-2.5 text-[14px] font-medium text-white hover:bg-emerald-700"
            >
              <Award className="h-4 w-4" /> View course
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ---------- Max attempts reached ----------
  if (noAttemptsLeft) {
    return (
      <div className="rounded-card border border-border bg-background p-8 text-center shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-text-secondary">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-[22px] font-semibold text-text-primary">No attempts left</h2>
        <p className="mt-2 text-[15px] text-text-secondary">
          You&apos;ve used all {maxAttempts} attempts for this quiz. Review the material and reach out to your admin if you need a reset.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href={`/dashboard/learn/${courseId}`}
            className="inline-flex items-center gap-2 rounded-card bg-[#4451A2] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#39458e]"
          >
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Quiz form ----------
  return (
    <div className="rounded-card border border-border bg-background p-6 shadow-card">
      {/* Attempt status */}
      <div className="mb-4 flex items-center justify-between text-[13px] text-text-secondary">
        <span>
          {historyLoading ? "Loading attempts..." : `Attempt ${Math.min(usedAttempts + 1, maxAttempts)} of ${maxAttempts}`}
        </span>
        <span>
          Question {currentQ + 1} of {totalQuestions}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-brand transition-all"
          style={{ width: `${((currentQ + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {submitError && (
        <div className="mt-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {submitError}
        </div>
      )}

      {/* Question */}
      <h3 className="mt-6 text-[16px] font-semibold text-text-primary">{question.question}</h3>

      {/* Options */}
      <div className="mt-4 space-y-2">
        {question.options.map((option, i) => {
          const isSelected = i === selected;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={submitting}
              className={`flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left text-[14px] transition ${
                isSelected
                  ? "border-[#4451A2] bg-[#4451A2]/10"
                  : "border-border bg-background hover:border-[#4451A2]/50"
              } ${submitting ? "cursor-wait opacity-60" : "cursor-pointer"}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-[12px] font-medium">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-text-primary">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleNext}
          disabled={selected === null || submitting}
          className="inline-flex items-center gap-2 rounded-card bg-[#4451A2] px-5 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-[#39458e] disabled:opacity-40"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : currentQ + 1 < totalQuestions ? (
            "Next question"
          ) : (
            "Submit quiz"
          )}
        </button>
      </div>
    </div>
  );
}
