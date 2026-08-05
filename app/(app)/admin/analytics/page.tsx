"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { TableSkeleton } from "@/components/Skeleton";

interface CourseHealth {
  courseId: string;
  title: string;
  enrollments: number;
  certificatesIssued: number;
  completionRatePct: number;
  avgProgressPct: number;
  avgQuizScorePct: number | null;
  health: "green" | "amber" | "red";
}

interface CohortPerformance {
  cohortId: string;
  name: string;
  members: number;
  avgProgressPct: number;
  certificatesEarned: number;
}

const healthDot: Record<CourseHealth["health"], string> = {
  green: "bg-success",
  amber: "bg-yellow-500",
  red: "bg-red",
};

export default function LmsAnalyticsPage() {
  const { data: courseData, loading: coursesLoading } = useApi<{ courses: CourseHealth[] }>(
    "/analytics/lms/course-health",
    { courses: [] }
  );
  const { data: cohortData, loading: cohortsLoading } = useApi<{ cohorts: CohortPerformance[] }>(
    "/analytics/lms/cohort-performance",
    { cohorts: [] }
  );
  const { data: validity, loading: validityLoading } = useApi<{ in7d: number; in30d: number; in60d: number; in90d: number }>(
    "/analytics/lms/enrollment-validity",
    { in7d: 0, in30d: 0, in60d: 0, in90d: 0 }
  );

  const courses = courseData.courses;
  const cohorts = cohortData.cohorts;

  return (
    <div className="max-w-4xl">
      <h1 className="text-[24px] font-semibold text-text-primary">LMS analytics</h1>

      <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Enrollments expiring</h2>
      {validityLoading ? (
        <div className="mt-3 grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-card border border-border bg-surface" />
          ))}
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-4">
          {[
            ["7 days", validity.in7d],
            ["30 days", validity.in30d],
            ["60 days", validity.in60d],
            ["90 days", validity.in90d],
          ].map(([label, count]) => (
            <div key={label as string} className="rounded-card border border-border bg-background p-4 text-center">
              <p className="text-[20px] font-semibold text-text-primary">{count}</p>
              <p className="text-[13px] text-text-secondary">within {label}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Course health</h2>
      {coursesLoading ? (
        <div className="mt-3">
          <TableSkeleton />
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Enrollments</th>
                <th className="px-4 py-3 font-medium">Completion</th>
                <th className="px-4 py-3 font-medium">Avg progress</th>
                <th className="px-4 py-3 font-medium">Avg quiz score</th>
                <th className="px-4 py-3 font-medium">Certificates</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.courseId} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${healthDot[c.health]}`} />
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.enrollments}</td>
                  <td className="px-4 py-3 text-text-secondary">{Math.round(c.completionRatePct)}%</td>
                  <td className="px-4 py-3 text-text-secondary">{Math.round(c.avgProgressPct)}%</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {c.avgQuizScorePct != null ? `${Math.round(c.avgQuizScorePct)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.certificatesIssued}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/analytics/${c.courseId}`} className="text-[13px] text-blue hover:underline">
                      Drop-off →
                    </Link>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                    No published courses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-8 text-[15px] font-medium text-text-secondary">Cohort performance</h2>
      {cohortsLoading ? (
        <div className="mt-3">
          <TableSkeleton />
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Cohort</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">Avg progress</th>
                <th className="px-4 py-3 font-medium">Certificates earned</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.cohortId} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.members}</td>
                  <td className="px-4 py-3 text-text-secondary">{Math.round(c.avgProgressPct)}%</td>
                  <td className="px-4 py-3 text-text-secondary">{c.certificatesEarned}</td>
                </tr>
              ))}
              {cohorts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                    No cohorts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
