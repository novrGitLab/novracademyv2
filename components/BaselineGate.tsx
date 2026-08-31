"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { GraduationCap } from "lucide-react";
import { useApi } from "@/lib/useApi";

interface LearnerAssessments {
  pendingBaseline: { id: string; title: string; questionCount: number } | null;
  pendingClosing: unknown[];
  dueMonthly: unknown[];
}

// Assessment-managing admins get a different response shape from GET
// /assessments (see routes/assessments.ts) and aren't gated as learners.
const EXEMPT_ROLES = new Set(["SUPER_ADMIN", "ORG_ADMIN"]);

/**
 * Full-screen blocking modal shown until a learner completes their baseline
 * assessment. Mounted once in app/(app)/layout.tsx so it covers both the
 * dashboard and admin shells for any role that isn't exempt.
 *
 * Navigation-aware: while the user is on an assessment page (the gate sent
 * them there), the modal hides so the assessment is usable; after they
 * finish and leave, data is refetched and the gate clears permanently.
 */
export function BaselineGate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const role = session?.user?.role as string | undefined;
  const enabled = status === "authenticated" && role !== undefined && !EXEMPT_ROLES.has(role);

  const { data, refetch } = useApi<LearnerAssessments>(enabled ? "/assessments" : "__disabled__", {
    pendingBaseline: null,
    pendingClosing: [],
    dueMonthly: [],
  });

  const onAssessmentPage = pathname.startsWith("/dashboard/assessments/");

  // Refetch when leaving an assessment page so a completed baseline
  // clears the gate instead of haunting the user forever.
  useEffect(() => {
    if (enabled && !onAssessmentPage) {
      refetch();
    }
  }, [pathname, enabled, onAssessmentPage, refetch]);

  if (!enabled || !data.pendingBaseline || onAssessmentPage) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-card border border-border bg-background p-8 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue/10">
          <GraduationCap className="h-6 w-6 text-blue" />
        </div>
        <h1 className="mt-4 text-[20px] font-semibold text-text-primary">Quick baseline check</h1>
        <p className="mt-2 text-[14px] text-text-secondary">
          Before you dive in, complete a short baseline assessment ({data.pendingBaseline.questionCount} question
          {data.pendingBaseline.questionCount === 1 ? "" : "s"}). We use it to measure your growth over time.
        </p>
        <button
          onClick={() => router.push(`/dashboard/assessments/${data.pendingBaseline!.id}`)}
          className="mt-6 w-full rounded-card bg-blue px-4 py-2.5 text-[14px] font-medium text-white hover:bg-blue/90 transition-colors"
        >
          Start baseline assessment
        </button>
      </div>
    </div>
  );
}
