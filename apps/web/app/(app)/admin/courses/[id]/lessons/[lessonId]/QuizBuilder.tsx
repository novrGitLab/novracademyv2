"use client";

import { useState } from "react";
import {
  createQuestionAction,
  deleteQuestionAction,
  reorderQuestionAction,
  updateQuizSettingsAction,
} from "../../../actions";

export interface QuizQuestion {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  prompt: string;
  options: string[] | null;
  correctAnswer: number | boolean | string | null;
  points: number;
  order: number;
}

const typeLabels: Record<QuizQuestion["type"], string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / False",
  SHORT_ANSWER: "Short answer",
};

export function QuizBuilder({
  courseId,
  lessonId,
  quiz,
}: {
  courseId: string;
  lessonId: string;
  quiz: { id: string; passMarkPct: number; maxAttempts: number; questions: QuizQuestion[] };
}) {
  const [newType, setNewType] = useState<QuizQuestion["type"]>("MULTIPLE_CHOICE");
  const [optionCount, setOptionCount] = useState(2);

  const boundUpdateSettings = updateQuizSettingsAction.bind(null, courseId, lessonId);
  const boundCreateQuestion = createQuestionAction.bind(null, courseId, lessonId);

  return (
    <div>
      <div className="rounded-card border border-border bg-background p-5">
        <p className="text-[15px] font-medium text-text-primary">Quiz settings</p>
        <form action={boundUpdateSettings} className="mt-3 flex items-end gap-4">
          <div>
            <label className="text-[13px] text-text-secondary">Pass mark %</label>
            <input
              name="passMarkPct"
              type="number"
              defaultValue={quiz.passMarkPct}
              className="mt-1 block w-32 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
          </div>
          <div>
            <label className="text-[13px] text-text-secondary">Max attempts</label>
            <input
              name="maxAttempts"
              type="number"
              defaultValue={quiz.maxAttempts}
              className="mt-1 block w-32 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
          </div>
          <button
            type="submit"
            className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
          >
            Save
          </button>
        </form>
      </div>

      <div className="mt-4 space-y-2">
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="rounded-card border border-border bg-background px-4 py-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-pill bg-blue-light px-2 py-1 text-[13px] font-medium text-blue">
                  {typeLabels[q.type]}
                </span>
                <p className="mt-2 text-[15px] font-medium text-text-primary">{q.prompt}</p>

                {q.type === "MULTIPLE_CHOICE" && q.options && (
                  <ul className="mt-1 space-y-0.5 text-[13px] text-text-secondary">
                    {q.options.map((opt, idx) => (
                      <li key={idx} className={idx === q.correctAnswer ? "font-medium text-success" : ""}>
                        {idx === q.correctAnswer ? "✓ " : "· "}
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
                {q.type === "TRUE_FALSE" && (
                  <p className="mt-1 text-[13px] text-success">Correct: {String(q.correctAnswer)}</p>
                )}
                {q.type === "SHORT_ANSWER" && (
                  <p className="mt-1 text-[13px] text-success">Expected: {String(q.correctAnswer)}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <form action={reorderQuestionAction.bind(null, courseId, lessonId, q.id, "up")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    className="rounded-card px-2 py-1 text-text-secondary hover:bg-surface disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                </form>
                <form action={reorderQuestionAction.bind(null, courseId, lessonId, q.id, "down")}>
                  <button
                    type="submit"
                    disabled={i === quiz.questions.length - 1}
                    className="rounded-card px-2 py-1 text-text-secondary hover:bg-surface disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </form>
                <form action={deleteQuestionAction.bind(null, courseId, lessonId, q.id)}>
                  <button type="submit" className="rounded-card px-2 py-1 text-[13px] text-red hover:bg-red-light">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        <form action={boundCreateQuestion} className="mt-4 space-y-3 rounded-card border border-dashed border-border p-4">
          <p className="text-[13px] font-medium text-text-secondary">Add a question</p>

          <div className="grid grid-cols-2 gap-3">
            <select
              name="type"
              value={newType}
              onChange={(e) => {
                setNewType(e.target.value as QuizQuestion["type"]);
                setOptionCount(2);
              }}
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            >
              <option value="MULTIPLE_CHOICE">Multiple choice</option>
              <option value="TRUE_FALSE">True / False</option>
              <option value="SHORT_ANSWER">Short answer</option>
            </select>
            <input
              name="points"
              type="number"
              defaultValue={1}
              placeholder="Points"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
          </div>

          <textarea
            name="prompt"
            required
            rows={2}
            placeholder="Question prompt"
            className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          />

          {newType === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              {Array.from({ length: optionCount }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="radio" name="correctAnswer" value={idx} required className="h-4 w-4" />
                  <input
                    name="options"
                    required
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
                  />
                </div>
              ))}
              {optionCount < 6 && (
                <button
                  type="button"
                  onClick={() => setOptionCount((n) => n + 1)}
                  className="text-[13px] font-medium text-blue hover:underline"
                >
                  + Add option
                </button>
              )}
              <p className="text-[13px] text-text-secondary">Select the radio button next to the correct option.</p>
            </div>
          )}

          {newType === "TRUE_FALSE" && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-[15px] text-text-primary">
                <input type="radio" name="correctAnswer" value="true" required /> True
              </label>
              <label className="flex items-center gap-2 text-[15px] text-text-primary">
                <input type="radio" name="correctAnswer" value="false" required /> False
              </label>
            </div>
          )}

          {newType === "SHORT_ANSWER" && (
            <input
              name="correctAnswer"
              required
              placeholder="Expected answer"
              className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
          )}

          <button
            type="submit"
            className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
          >
            Add question
          </button>
        </form>
      </div>
    </div>
  );
}
