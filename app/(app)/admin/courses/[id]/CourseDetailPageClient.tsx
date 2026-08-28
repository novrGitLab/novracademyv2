"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Eye,
  Plus,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Radio,
  MoveUp,
  MoveDown,
  Loader2,
  BookOpen,
} from "lucide-react";
import {
  updateCourseAction,
  setCourseStatusAction,
  createLessonAction,
  deleteLessonAction,
  reorderLessonAction,
  regenerateCertificatesAction,
} from "../actions";
import { ThumbnailUpload } from "@/components/ui/ThumbnailUpload";
import { CURRENCIES, formatPrice } from "@/lib/currency";

interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "PDF" | "QUIZ" | "LIVE";
  durationSeconds?: number;
  minWatchPct?: number;
}

interface CourseDetail {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  priceCents: number;
  currency: string;
  passMarkPct?: number;
  defaultValidityDays?: number;
  allowForwardScrub: boolean;
  lessons: Lesson[];
}

export default function CourseDetailPageClient({ course }: { course: CourseDetail }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateMessage, setRegenerateMessage] = useState<string | null>(null);

  function handleStatusToggle(newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    startTransition(async () => {
      await setCourseStatusAction(course.id, newStatus);
    });
  }

  async function handleRegenerateCertificates() {
    setRegenerating(true);
    setRegenerateMessage(null);
    const outcome = await regenerateCertificatesAction(course.id);
    setRegenerating(false);
    setRegenerateMessage(outcome.ok ? `Regenerated ${outcome.count} certificate(s).` : outcome.error);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>

        {/* Edit Mode & Status Controls */}
        <div className="flex items-center gap-3">
          {/* Status Switcher */}
          <select
            value={course.status}
            onChange={(e) => handleStatusToggle(e.target.value as any)}
            disabled={isPending}
            className="rounded-card border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text-primary outline-none focus:border-blue"
          >
            <option value="DRAFT">🟡 Draft</option>
            <option value="PUBLISHED">🟢 Published</option>
            <option value="ARCHIVED">⚪ Archived</option>
          </select>

          {/* Admin Mode Toggle Switch */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 rounded-card border px-3 py-1.5 text-[13px] font-medium transition-colors ${
              isEditMode
                ? "border-blue bg-blue/10 text-blue"
                : "border-border bg-surface text-text-secondary hover:text-text-primary"
            }`}
          >
            {isEditMode ? (
              <>
                <Pencil className="h-4 w-4 text-blue" /> Edit Mode: ON
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Preview Mode
              </>
            )}
          </button>

          <button
            onClick={handleRegenerateCertificates}
            disabled={regenerating}
            className="rounded-card border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text-primary hover:bg-surface/70 disabled:opacity-50 transition-colors"
          >
            {regenerating ? "Regenerating…" : "Regenerate certificates"}
          </button>
        </div>
      </div>

      {regenerateMessage && (
        <p className="rounded-pill bg-blue/10 px-3 py-2 text-[13px] text-blue">{regenerateMessage}</p>
      )}

      {/* Course Hero / Metadata Section */}
      <div className="rounded-card border border-border bg-background p-6 shadow-card">
        {isEditMode ? (
          /* Editable Course Metadata Form */
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateCourseAction(course.id, formData);
              });
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-[16px] font-semibold text-text-primary">Edit Shell Details</h2>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-card bg-blue px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-blue/90 disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save Settings
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] font-medium text-text-secondary">Course Title</label>
                  <input
                    name="title"
                    defaultValue={course.title}
                    required
                    className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-1.5 text-[14px]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-text-secondary">Thumbnail Image</label>
                  <ThumbnailUpload name="thumbnailUrl" initialValue={course.thumbnailUrl} />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-text-secondary">Description</label>
                  <textarea
                    name="description"
                    defaultValue={course.description || ""}
                    rows={3}
                    className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-1.5 text-[14px]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-text-secondary">Price (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="priceNaira"
                      defaultValue={course.priceCents / 100}
                      className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-1.5 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-text-secondary">Currency</label>
                    <select
                      name="currency"
                      defaultValue={course.currency}
                      className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-1.5 text-[14px]"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-text-secondary">Pass Mark %</label>
                    <input
                      type="number"
                      name="passMarkPct"
                      defaultValue={course.passMarkPct ?? ""}
                      className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-1.5 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-text-secondary">Validity (Days)</label>
                    <input
                      type="number"
                      name="defaultValidityDays"
                      defaultValue={course.defaultValidityDays ?? ""}
                      placeholder="Lifetime"
                      className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-1.5 text-[14px]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-2 text-[13px] text-text-primary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="allowForwardScrub"
                    defaultChecked={course.allowForwardScrub}
                    className="h-4 w-4 rounded border-border text-blue"
                  />
                  Allow forward scrubbing on video lessons
                </label>
              </div>
            </div>
          </form>
        ) : (
          /* Read-Only Course Preview Header */
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="h-36 w-60 rounded-card object-cover border border-border"
              />
            ) : (
              <div className="flex h-36 w-60 items-center justify-center rounded-card border border-dashed border-border bg-surface text-text-secondary text-[13px]">
                No thumbnail provided
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-pill px-2 py-0.5 text-[11px] font-medium ${
                    course.status === "PUBLISHED"
                      ? "bg-success-light text-success"
                      : "bg-yellow-light text-yellow"
                  }`}
                >
                  {course.status}
                </span>
                <span className="text-[13px] text-text-secondary">
                  {formatPrice(course.priceCents, course.currency)}
                </span>
              </div>
              <h1 className="text-[22px] font-semibold text-text-primary">{course.title}</h1>
              <p className="text-[14px] text-text-secondary max-w-2xl">
                {course.description || "No description available."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Curriculum & Lesson Builder Section */}
      <div className="rounded-card border border-border bg-background p-6 shadow-card">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-[18px] font-semibold text-text-primary">Curriculum</h3>
            <p className="text-[13px] text-text-secondary">
              {(course.lessons || []).length} lesson{(course.lessons || []).length === 1 ? "" : "s"} in this course.
            </p>
          </div>

          {isEditMode && (
            <button
              onClick={() => setShowAddLessonModal(true)}
              className="flex items-center gap-1.5 rounded-card bg-blue px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-blue/90"
            >
              <Plus className="h-4 w-4" /> Add Lesson
            </button>
          )}
        </div>

        {/* Empty State */}
        {(!course.lessons || course.lessons.length === 0) && (
          <div className="my-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-text-secondary/50" />
            <p className="mt-2 text-[14px] font-medium text-text-primary">This course shell has no lessons yet.</p>
            <p className="text-[13px] text-text-secondary">
              {isEditMode
                ? "Click 'Add Lesson' above to begin building your content."
                : "Toggle Edit Mode to start adding lessons."}
            </p>
          </div>
        )}

        {/* Lessons List */}
        <div className="mt-4 space-y-2">
          {(course.lessons || []).map((lesson, idx) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3 hover:border-border/80"
            >
              <div className="flex items-center gap-3">
                <LessonTypeIcon type={lesson.type} />
                <Link
                  href={`/admin/courses/${course.id}/lessons/${lesson.id}`}
                  className="text-[14px] font-medium text-text-primary hover:text-blue"
                >
                  {idx + 1}. {lesson.title}
                </Link>
                <span className="rounded bg-background px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border">
                  {lesson.type}
                </span>
              </div>

              {/* Edit Controls for reordering/deleting */}
              {isEditMode && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      startTransition(() => reorderLessonAction(course.id, lesson.id, "up"))
                    }
                    disabled={idx === 0 || isPending}
                    className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-30"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      startTransition(() => reorderLessonAction(course.id, lesson.id, "down"))
                    }
                    disabled={idx === course.lessons.length - 1 || isPending}
                    className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-30"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      startTransition(() => deleteLessonAction(course.id, lesson.id))
                    }
                    disabled={isPending}
                    className="p-1 text-text-secondary hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Lesson Modal */}
      {showAddLessonModal && (
        <AddLessonModal
          courseId={course.id}
          onClose={() => setShowAddLessonModal(false)}
        />
      )}
    </div>
  );
}

function LessonTypeIcon({ type }: { type: Lesson["type"] }) {
  switch (type) {
    case "VIDEO":
      return <Video className="h-4 w-4 text-blue" />;
    case "PDF":
      return <FileText className="h-4 w-4 text-orange-500" />;
    case "QUIZ":
      return <HelpCircle className="h-4 w-4 text-purple-500" />;
    case "LIVE":
      return <Radio className="h-4 w-4 text-red-500" />;
  }
}

function AddLessonModal({ courseId, onClose }: { courseId: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-card border border-border bg-background p-6 shadow-card">
        <h3 className="text-[18px] font-semibold text-text-primary">Add New Lesson</h3>

        <form
          action={(formData) => {
            startTransition(async () => {
              await createLessonAction(courseId, formData);
              onClose();
            });
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="text-[13px] font-medium text-text-secondary">Lesson Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Introduction to Async/Await"
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[14px]"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-text-secondary">Content Type</label>
            <select
              name="type"
              required
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[14px]"
            >
              <option value="VIDEO">📹 Video</option>
              <option value="PDF">📄 PDF Document</option>
              <option value="QUIZ">❓ Quiz / Assessment</option>
              <option value="LIVE">🎙️ Live Session</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-card border border-border px-3 py-1.5 text-[13px] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-card bg-blue px-4 py-1.5 text-[13px] font-medium text-white hover:bg-blue/90"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}