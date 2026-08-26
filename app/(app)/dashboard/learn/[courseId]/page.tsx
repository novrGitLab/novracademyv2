import { apiFetchSafe } from "@/lib/api";
import { notFound } from "next/navigation";
import { Badge, PageHeader } from "@/components/DesignSystem";
import { formatPrice } from "@/lib/currency";
import { EnrollButton } from "./EnrollButton";
import { LessonList } from "./LessonList";
import { PaymentStatusAlert } from "./PaymentStatusAlert";
import { PaymentHistory } from "./PaymentHistory";

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
}

interface Payment {
  id: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  amountCents: number;
  currency: string;
  provider: "STRIPE" | "PAYSTACK";
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  lessons: Lesson[];
  enrolled?: boolean;
  progressPct?: number;
  payments?: Payment[];
}

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await apiFetchSafe<Course | null>(
    `/courses/${params.courseId}`,
    null
  );

  if (!course) notFound();

  const lessons = course.lessons ?? [];
  const payments = course.payments ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6">
      {/* Payment status alert */}
      <PaymentStatusAlert />

      {/* Course header */}
      <div className="rounded-card bg-gradient-brand p-5 text-white shadow-premium sm:p-8">
        <PageHeader
          title={course.title}
          description={course.description ?? ""}
          backLink={{ href: "/dashboard/learn", label: "Back to courses" }}
          className="mb-0 [&_a]:!text-white [&_a]:!text-white/80 [&_a]:hover:!text-white [&_h1]:!text-white [&_p]:!text-white/85"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/25 bg-white/15 text-white backdrop-blur">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </Badge>
              <Badge className="border-white/25 bg-white/15 text-white backdrop-blur">
                {formatPrice(course.priceCents, course.currency)}
              </Badge>
            </div>
          }
        />
        <div className="mt-5 flex items-center gap-4 text-[13px] text-white/70">
          <span>
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/50" />
          <span>{course.priceCents === 0 ? "Free access" : "Premium course"}</span>
        </div>
      </div>

      {/* Enrolled: lesson list with progress tracking. Not enrolled: enroll CTA. */}
      {course.enrolled ? (
        <>
          {(course.progressPct ?? 0) > 0 && (
            <div className="mt-5 flex items-center gap-3">
              <span className="text-[13px] font-semibold text-[#683290]">{course.progressPct}% complete</span>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#E5E7EB]">
                <div className="h-full rounded-full bg-[#683290]" style={{ width: `${course.progressPct}%` }} />
              </div>
            </div>
          )}
          <LessonList courseId={course.id} lessons={lessons} />
          <PaymentHistory payments={payments} />
        </>
      ) : (
        <div className="mt-5 rounded-card border border-border bg-background p-6 shadow-card">
          <h2 className="font-serif text-xl font-semibold text-text-primary">Get started with this course</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">
            Enroll to unlock the lessons, track your progress, and earn your certificate on completion.
          </p>
          <div className="mt-4">
            <EnrollButton courseId={course.id} priceCents={course.priceCents} currency={course.currency} />
          </div>
          <PaymentHistory payments={payments} />
        </div>
      )}
    </div>
  );
}
