import Link from "next/link";
import { apiFetchSafe } from "@/lib/api";
import { notFound } from "next/navigation";
import { Badge, PageHeader } from "@/components/DesignSystem";
import { formatPrice } from "@/lib/currency";
import { EnrollButton } from "./EnrollButton";
import { LessonList } from "./LessonList";
import { PaymentStatusAlert } from "./PaymentStatusAlert";

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  lessons: Lesson[];
  enrolled?: boolean;
  isAnonymous?: boolean;
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
  const isAnonymous = course.isAnonymous ?? false;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      {/* Payment status alert — only show for logged-in users */}
      {!isAnonymous && <PaymentStatusAlert />}

      {/* Course header */}
      <div className="rounded-card bg-gradient-brand p-5 text-white shadow-premium sm:p-8">
        <PageHeader
          title={course.title}
          description={course.description ?? ""}
          backLink={{ href: isAnonymous ? "/catalog" : "/dashboard/learn", label: "Back to courses" }}
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

      {/* Content based on enrollment state and auth state */}
      {course.enrolled ? (
        /* Logged in and enrolled — show full lesson list */
        <LessonList courseId={course.id} lessons={lessons} />
      ) : isAnonymous ? (
        /* Anonymous user — show lesson preview but prompt to login */
        <>
          <div className="mt-5 rounded-card border border-border bg-background p-6 shadow-card">
            <h2 className="font-serif text-xl font-semibold text-text-primary">Preview this course</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">
              Sign in to enroll and access all lessons, track your progress, and earn your certificate.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Link
                href={`/login?redirect=/dashboard/learn/${course.id}`}
                className="rounded-lg bg-[#683290] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#542573]"
              >
                Sign in to Enroll
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-[#683290] px-4 py-2 text-sm font-medium text-[#683290] transition hover:bg-[#683290]/10"
              >
                Create Account
              </Link>
            </div>
          </div>
          {/* Show lesson list as preview (locked) */}
          <div className="mt-5">
            <h3 className="mb-4 font-serif text-xl font-semibold text-text-primary">Course Content</h3>
            <div className="rounded-card border border-border bg-background p-4">
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-4 opacity-60"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#683290]/10 text-[#683290]">
                      {lesson.order}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{lesson.title}</p>
                      <p className="text-xs capitalize text-text-secondary">{lesson.type.toLowerCase()}</p>
                    </div>
                    <span className="text-xs text-text-secondary">🔒 Locked</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Logged in but not enrolled — show enroll button */
        <div className="mt-5 rounded-card border border-border bg-background p-6 shadow-card">
          <h2 className="font-serif text-xl font-semibold text-text-primary">Get started with this course</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">
            Enroll to unlock the lessons, track your progress, and earn your certificate on completion.
          </p>
          <div className="mt-4">
            <EnrollButton courseId={course.id} priceCents={course.priceCents} currency={course.currency} />
          </div>
        </div>
      )}
    </div>
  );
}
