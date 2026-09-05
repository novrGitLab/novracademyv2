"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";

type VerifyResponse = { enrolled: boolean; via?: string; reason?: string };

export function PaymentStatusAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const checkoutStatus = searchParams.get("checkout");
  const courseId = params.courseId;

  const [verifying, setVerifying] = useState(checkoutStatus === "success");
  const [enrolled, setEnrolled] = useState(false);
  const attemptsRef = useRef(0);
  const maxAttempts = 15; // ~30s at 2s interval

  useEffect(() => {
    if (checkoutStatus !== "success" || !courseId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function verify() {
      attemptsRef.current += 1;
      try {
        const res = await fetch(`/api/proxy/courses/${courseId}/enroll/verify`, {
          method: "POST",
          cache: "no-store",
        });
        const data = (await res.json().catch(() => null)) as VerifyResponse | null;
        if (cancelled) return;
        if (data?.enrolled) {
          setEnrolled(true);
          setVerifying(false);
          // Enrollment is active — refresh server components so CourseDetailPage
          // re-fetches GET /courses/:id (enrolled:true) and swaps EnrollButton
          // for LessonList without a full reload.
          router.refresh();
          return;
        }
      } catch {
        // transient — retry
      }
      if (cancelled) return;
      if (attemptsRef.current >= maxAttempts) {
        setVerifying(false);
        return;
      }
      timer = setTimeout(verify, 2000);
    }

    verify();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [checkoutStatus, courseId, router]);

  if (!checkoutStatus) return null;

  if (checkoutStatus === "success") {
    if (enrolled) {
      return (
        <div className="mb-6 flex gap-3 rounded-card border border-green-200/50 bg-green-50/80 p-4 text-green-900">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
          <div>
            <p className="font-semibold">Payment successful — you&apos;re enrolled!</p>
            <p className="mt-1 text-sm opacity-90">Your course is now unlocked. Start learning below.</p>
          </div>
        </div>
      );
    }
    if (verifying) {
      return (
        <div className="mb-6 flex gap-3 rounded-card border border-blue-200/50 bg-blue-50/80 p-4 text-blue-900">
          <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-blue-600" />
          <div>
            <p className="font-semibold">Verifying payment…</p>
            <p className="mt-1 text-sm opacity-90">We&apos;re confirming your payment with Paystack. This usually takes a few seconds — your course will unlock automatically.</p>
          </div>
        </div>
      );
    }
    // verify timed out but webhook may still land — keep optimistic success copy
    // but hint to refresh / contact support. enrolled will still flip if webhook arrives later and user refreshes.
    return (
      <div className="mb-6 flex gap-3 rounded-card border border-amber-200/50 bg-amber-50/80 p-4 text-amber-900">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Payment received — finalizing enrollment…</p>
          <p className="mt-1 text-sm opacity-90">
            If your course is still locked, refresh in a moment or check your email. Webhook confirmation can take up to a minute. Contact support if it persists.
          </p>
        </div>
      </div>
    );
  }

  if (checkoutStatus === "cancelled") {
    return (
      <div className="mb-6 flex gap-3 rounded-card border border-amber-200/50 bg-amber-50/80 p-4 text-amber-900">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Payment cancelled</p>
          <p className="mt-1 text-sm opacity-90">You cancelled the payment. Try again when you&apos;re ready, or contact support for help.</p>
        </div>
      </div>
    );
  }

  if (checkoutStatus === "failed") {
    return (
      <div className="mb-6 flex gap-3 rounded-card border border-red-200/50 bg-red-50/80 p-4 text-red-900">
        <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <div>
          <p className="font-semibold">Payment failed</p>
          <p className="mt-1 text-sm opacity-90">We encountered an issue processing your payment. Please try again or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  return null;
}
