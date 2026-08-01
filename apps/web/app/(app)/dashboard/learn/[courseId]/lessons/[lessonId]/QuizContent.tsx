"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ChevronRight, Award } from "lucide-react";

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
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  questions: QuizQuestion[];
  totalLessons: number;
  lessonOrder: number;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

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

  if (finished) {
    return (
      <div className="rounded-card border border-border bg-background p-8 text-center shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-white">
          <Award className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-[22px] font-semibold text-text-primary">Quiz Complete!</h2>
        <p className="mt-2 text-[40px] font-bold text-text-primary">
          {score}/{totalQuestions}
        </p>
        <p className="mt-2 text-[15px] text-text-secondary">
          {passed
            ? `Congratulations! You passed with ${score} out of ${totalQuestions} correct.`
            : `You needed ${passMark} correct answers to pass. Review the material and try again.`}
        </p>
        {passed && lessonOrder < totalLessons && (
          <a
            href={`/dashboard/learn/${courseId}/lessons/${lessonOrder + 1}`}
            className="mt-6 inline-flex items-center gap-2 rounded-card bg-blue px-5 py-2.5 text-[14px] font-medium text-white hover:bg-blue/90"
          >
            Continue to next lesson <ChevronRight className="h-4 w-4" />
          </a>
        )}
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
        <span>Score: {score}/{totalQuestions}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-brand transition-all"
          style={{ width: `${((currentQ + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h3 className="mt-6 text-[16px] font-semibold text-text-primary">{question.question}</h3>

      {/* Options */}
      <div className="mt-4 space-y-2">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selected;
          let borderColor = "border-border";
          let bgColor = "bg-background";
          if (answered) {
            if (isCorrect) {
              borderColor = "border-success";
              bgColor = "bg-success-light";
            } else if (isSelected && !isCorrect) {
              borderColor = "border-red";
              bgColor = "bg-red-light";
            }
          } else if (isSelected) {
            borderColor = "border-blue";
            bgColor = "bg-blue-light";
          }

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left text-[14px] transition ${borderColor} ${bgColor} ${
                !answered ? "hover:border-blue/50 cursor-pointer" : "cursor-default"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-[12px] font-medium">
                {answered && isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : answered && isSelected && !isCorrect ? (
                  <XCircle className="h-4 w-4 text-red" />
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
              ? "bg-success-light text-success"
              : "bg-red-light text-red"
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
            className="rounded-card bg-blue px-5 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-blue/90 disabled:opacity-40"
          >
            Submit answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-card bg-blue px-5 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-blue/90"
          >
            {currentQ + 1 < totalQuestions ? "Next question" : "See results"}
          </button>
        )}
      </div>
    </div>
  );
}
