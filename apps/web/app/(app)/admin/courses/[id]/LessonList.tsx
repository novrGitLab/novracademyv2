"use client";

import { useState } from "react";
import Link from "next/link";
import { createLessonAction, deleteLessonAction, reorderLessonAction } from "../actions";

interface Quiz {
  id: string;
  passMarkPct: number;
  maxAttempts: number;
  questions: unknown[];
}

interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "PDF" | "QUIZ" | "LIVE";
  order: number;
  minWatchPct: number;
  contentUrl: string | null;
  quiz: Quiz | null;
}

const typeLabels: Record<Lesson["type"], string> = {
  VIDEO: "Video",
  PDF: "PDF",
  QUIZ: "Quiz",
  LIVE: "Live class",
};

export function LessonList({ courseId, lessons }: { courseId: string; lessons: Lesson[] }) {
  const [newType, setNewType] = useState<Lesson["type"]>("VIDEO");

  const boundCreate = createLessonAction.bind(null, courseId);

  return (
    <div className="mt-4 space-y-2">
      {lessons.map((lesson, i) => (
        <div
          key={lesson.id}
          className="flex items-center justify-between rounded-card border border-border bg-background px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-pill bg-blue-light px-2 py-1 text-[13px] font-medium text-blue">
              {typeLabels[lesson.type]}
            </span>
            <div>
              <Link
                href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                className="text-[15px] font-medium text-text-primary hover:text-blue"
              >
                {lesson.title}
              </Link>
              {lesson.type === "VIDEO" && (
                <p className="text-[13px] text-text-secondary">Min watch: {lesson.minWatchPct}%</p>
              )}
              {lesson.type === "QUIZ" && lesson.quiz && (
                <p className="text-[13px] text-text-secondary">
                  Pass mark: {lesson.quiz.passMarkPct}% · Max attempts: {lesson.quiz.maxAttempts} ·{" "}
                  {lesson.quiz.questions.length} question(s)
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <form action={reorderLessonAction.bind(null, courseId, lesson.id, "up")}>
              <button
                type="submit"
                disabled={i === 0}
                className="rounded-card px-2 py-1 text-text-secondary hover:bg-surface disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
            </form>
            <form action={reorderLessonAction.bind(null, courseId, lesson.id, "down")}>
              <button
                type="submit"
                disabled={i === lessons.length - 1}
                className="rounded-card px-2 py-1 text-text-secondary hover:bg-surface disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
            </form>
            <form action={deleteLessonAction.bind(null, courseId, lesson.id)}>
              <button type="submit" className="rounded-card px-2 py-1 text-[13px] text-red hover:bg-red-light">
                Delete
              </button>
            </form>
          </div>
        </div>
      ))}

      <form action={boundCreate} className="mt-4 space-y-3 rounded-card border border-dashed border-border p-4">
        <p className="text-[13px] font-medium text-text-secondary">Add a lesson</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            name="title"
            required
            placeholder="Lesson title"
            className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          />
          <select
            name="type"
            value={newType}
            onChange={(e) => setNewType(e.target.value as Lesson["type"])}
            className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          >
            <option value="VIDEO">Video</option>
            <option value="PDF">PDF</option>
            <option value="QUIZ">Quiz</option>
            <option value="LIVE">Live class</option>
          </select>
        </div>

        {newType === "VIDEO" && (
          <input
            name="minWatchPct"
            type="number"
            defaultValue={80}
            placeholder="Min watch %"
            className="w-40 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          />
        )}
        {newType === "QUIZ" && (
          <div className="flex gap-3">
            <input
              name="quizPassMarkPct"
              type="number"
              defaultValue={70}
              placeholder="Pass mark %"
              className="w-40 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
            <input
              name="quizMaxAttempts"
              type="number"
              defaultValue={3}
              placeholder="Max attempts"
              className="w-40 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
            />
          </div>
        )}

        <button
          type="submit"
          className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90"
        >
          Add lesson
        </button>
      </form>
    </div>
  );
}
