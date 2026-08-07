"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ChevronRight, Award, RotateCcw } from "lucide-react";
import { isLessonCompleted, markLessonComplete } from "@/lib/progress";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
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
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setAlreadyCompleted(isLessonCompleted(courseId, lessonId));
  }, [courseId, lessonId]);

  const question = questions[currentQ];
  const totalQuestions = questions.length;
  const passMark = Math.ceil(totalQuestions * 0.7);
  const passed = score >= passMark;

  function handleAnswer() {
    if (selected === null) return;
    const correct = selected === question.correctIndex;
    setAnswered(true);
    setResults([...results, { correct }]);
    if (correct) setScore(score + 1);
  }

  function handleNext() {
    if (currentQ + 1 < totalQuestions) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  }

  function handleRetry() {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setResults([]);
    setFinished(false);
  }

  // When quiz finishes and user passed, persist to localStorage
  useEffect(() => {
    if (finished && passed && !alreadyCompleted) {
      markLessonComplete(courseId, lessonId);
      setAlreadyCompleted(true);
    }
  }, [finished, passed, alreadyCompleted, courseId, lessonId]);

  // Find next lessonId for navigation
  const currentLessonIndex = allLessonIds.indexOf(lessonId);
  const nextLessonId =
    currentLessonIndex >= 0 && currentLessonIndex < allLessonIds.length - 1
      ? allLessonIds[currentLessonIndex + 1]
      : null;

  if (finished) {
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
          Quiz Complete!
        </h2>
        <p className="mt-2 text-[40px] font-bold text-text-primary">
          {score}/{totalQuestions}
        </p>
        <p className="mt-2 text-[15px] text-text-secondary">
          {passed
            ? `Congratulations! You passed with ${score} out of ${totalQuestions} correct.`
            : `You needed ${passMark} correct answers to pass. Review the material and try again.`}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          {!passed && (
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
              href={`/dashboard/learn/${courseId}/certificate`}
              className="inline-flex items-center gap-2 rounded-card bg-emerald-600 px-5 py-2.5 text-[14px] font-medium text-white hover:bg-emerald-700"
            >
              <Award className="h-4 w-4" /> View certificate
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-background p-6 shadow-card">
      {/* Progress */}
      <div className="flex items-center justify-between text-[13px] text-text-secondary">
        <span>
          Question {currentQ + 1} of {totalQuestions}
        </span>
        <span>
          Score: {score}/{totalQuestions}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-brand transition-all"
          style={{ width: `${((currentQ + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h3 className="mt-6 text-[16px] font-semibold text-text-primary">
        {question.question}
      </h3>

      {/* Options */}
      <div className="mt-4 space-y-2">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selected;
          let borderColor = "border-border";
          let bgColor = "bg-background";
          if (answered) {
            if (isCorrect) {
              borderColor = "border-emerald-600";
              bgColor = "bg-emerald-50";
            } else if (isSelected && !isCorrect) {
              borderColor = "border-[#E82027]";
              bgColor = "bg-[#E82027]/15";
            }
          } else if (isSelected) {
            borderColor = "border-[#4451A2]";
            bgColor = "bg-[#4451A2]/10";
          }

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left text-[14px] transition ${borderColor} ${bgColor} ${
                !answered ? "hover:border-[#4451A2]/50 cursor-pointer" : "cursor-default"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-[12px] font-medium">
                {answered && isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : answered && isSelected && !isCorrect ? (
                  <XCircle className="h-4 w-4 text-[#E82027]" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="text-text-primary">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div
          className={`mt-4 rounded-card px-4 py-3 text-[13px] ${
            selected === question.correctIndex
              ? "bg-emerald-50 text-emerald-600"
              : "bg-[#E82027]/15 text-[#E82027]"
          }`}
        >
          {selected === question.correctIndex ? "✓ Correct!" : "✗ Incorrect."}{" "}
          {question.explanation}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-end">
        {!answered ? (
          <button
            onClick={handleAnswer}
            disabled={selected === null}
            className="rounded-card bg-[#4451A2] px-5 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-[#39458e] disabled:opacity-40"
          >
            Submit answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-card bg-[#4451A2] px-5 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-[#39458e]"
          >
            {currentQ + 1 < totalQuestions ? "Next question" : "See results"}
          </button>
        )}
      </div>
    </div>
  );
}
