"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Award, Download, ArrowLeft, CheckCircle } from "lucide-react";
import { getHardcodedCourse } from "@/lib/courses-data";
import { getCompletedLessons } from "@/lib/progress";

export default function CertificatePage({
  params,
}: {
  params: { courseId: string };
}) {
  return <CertificateClient courseId={params.courseId} />;
}

function CertificateClient({ courseId }: { courseId: string }) {
  const { data: session } = useSession();
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [mounted, setMounted] = useState(false);

  const course = getHardcodedCourse(courseId);
  const learnerName = session?.user?.name || session?.user?.email || "Learner";
  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (course) {
      const completed = getCompletedLessons(courseId);
      setCompletedCount(completed.length);
      setTotalLessons(course.lessons.length);
    }
    setMounted(true);
  }, [courseId, course]);

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-text-secondary">Course not found.</p>
        <Link href="/dashboard/learn" className="mt-4 inline-block text-blue hover:underline">
          Browse courses
        </Link>
      </div>
    );
  }

  const allComplete = mounted && completedCount === totalLessons && totalLessons > 0;

  if (!allComplete && mounted) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-text-secondary">
          <Award className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-[22px] font-semibold text-text-primary">Not yet!</h1>
        <p className="mt-2 text-[15px] text-text-secondary">
          You need to complete all {totalLessons} lessons to earn your certificate.
          {mounted && ` You've completed ${completedCount} so far.`}
        </p>
        <Link
          href={`/dashboard/learn/${courseId}`}
          className="mt-6 inline-flex items-center gap-2 rounded-card bg-blue px-5 py-2.5 text-[14px] font-medium text-white hover:bg-blue/90"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>
      </div>
    );
  }

  // Generate a cert UID based on courseId + date
  const certUid = `NOVR-${courseId.replace("course-", "").toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  function handleDownload() {
    if (!course) return;
    // Create a printable version
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${course.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f1f5f9; font-family: 'Inter', sans-serif; }
          .certificate { width: 800px; padding: 60px; background: white; border: 3px solid #3b82f6; border-radius: 16px; text-align: center; position: relative; }
          .certificate::before { content: ''; position: absolute; inset: 8px; border: 1px solid #e2e8f0; border-radius: 12px; }
          .logo { font-size: 14px; font-weight: 600; color: #3b82f6; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
          .title { font-size: 32px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
          .subtitle { font-size: 14px; color: #64748b; margin-bottom: 32px; }
          .name { font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 8px; }
          .course-label { font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
          .course-name { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 32px; }
          .details { display: flex; justify-content: center; gap: 48px; margin-bottom: 32px; }
          .detail-item { text-align: center; }
          .detail-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
          .detail-value { font-size: 13px; font-weight: 500; color: #334155; margin-top: 2px; }
          .footer { font-size: 11px; color: #94a3b8; }
          @media print { body { background: none; } .certificate { border-color: #3b82f6; } }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="logo">✦ Novr Academy</div>
          <div class="title">Certificate of Completion</div>
          <div class="subtitle">This certifies that</div>
          <div class="name">${learnerName}</div>
          <div class="course-label">has successfully completed</div>
          <div class="course-name">${course.title}</div>
          <div class="details">
            <div class="detail-item">
              <div class="detail-label">Date</div>
              <div class="detail-value">${completionDate}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Certificate ID</div>
              <div class="detail-value">${certUid}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Lessons</div>
              <div class="detail-value">${totalLessons}</div>
            </div>
          </div>
          <div class="footer">Verify at novracademy.com/verify/${certUid}</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Success banner */}
      <div className="rounded-card border border-success/30 bg-success-light p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success text-white">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-3 text-[22px] font-semibold text-text-primary">
          Congratulations!
        </h1>
        <p className="mt-1 text-[15px] text-text-secondary">
          You&apos;ve completed all {totalLessons} lessons in <strong>{course.title}</strong>
        </p>
      </div>

      {/* Certificate card */}
      <div className="mt-6 overflow-hidden rounded-card border-2 border-blue bg-white shadow-premium">
        {/* Decorative top bar */}
        <div className="h-2 bg-gradient-brand" />

        <div className="px-12 py-10 text-center">
          {/* Branding */}
          <p className="text-[12px] font-semibold uppercase tracking-[3px] text-blue">
            ✦ Novr Academy
          </p>

          <h2 className="mt-4 text-[28px] font-bold text-text-primary">
            Certificate of Completion
          </h2>
          <p className="mt-1 text-[14px] text-text-secondary">
            This certifies that
          </p>

          {/* Learner name */}
          <p className="mt-4 text-[26px] font-bold text-blue">
            {learnerName}
          </p>

          <p className="mt-1 text-[13px] uppercase tracking-wider text-text-secondary">
            has successfully completed
          </p>

          {/* Course name */}
          <p className="mt-2 text-[18px] font-semibold text-text-primary">
            {course.title}
          </p>

          {/* Divider */}
          <div className="mx-auto mt-6 h-px w-48 bg-border" />

          {/* Details */}
          <div className="mt-6 flex items-center justify-center gap-12">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wider text-text-secondary">
                Date
              </p>
              <p className="mt-1 text-[13px] font-medium text-text-primary">
                {completionDate}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wider text-text-secondary">
                Certificate ID
              </p>
              <p className="mt-1 font-mono text-[13px] font-medium text-text-primary">
                {certUid}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wider text-text-secondary">
                Lessons
              </p>
              <p className="mt-1 text-[13px] font-medium text-text-primary">
                {totalLessons} completed
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-2 bg-gradient-brand" />
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-card bg-blue px-5 py-2.5 text-[14px] font-medium text-white shadow-card transition hover:bg-blue/90"
        >
          <Download className="h-4 w-4" /> Download / Print
        </button>
        <Link
          href={`/dashboard/learn/${courseId}`}
          className="inline-flex items-center gap-2 rounded-card border border-border bg-background px-5 py-2.5 text-[14px] font-medium text-text-primary shadow-card transition hover:bg-surface"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>
      </div>
    </div>
  );
}
