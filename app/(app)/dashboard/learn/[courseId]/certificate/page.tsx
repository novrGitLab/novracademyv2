"use client";

import { useMemo, useState } from "react";
import { Award, CalendarDays, CheckCircle2, Download, Hash, Share2, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { BackLink, Badge, Button, Card, PageHeader } from "@/components/DesignSystem";
import { getHardcodedCourse } from "@/lib/courses-data";

export default function CertificatePage({ params }: { params: { courseId: string } }) {
  const { data: session } = useSession();
  const [shareLabel, setShareLabel] = useState("Share");
  const course = getHardcodedCourse(params.courseId);

  const certificate = useMemo(() => {
    const date = new Date();
    const dateLabel = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      learnerName: session?.user?.name || session?.user?.email || "Alex Johnson",
      courseName: course?.title || "Cybersecurity Foundations",
      completionDate: dateLabel,
      id: `NOVR-${params.courseId.replace(/[^a-z0-9]/gi, "").toUpperCase()}-2026`,
    };
  }, [course?.title, params.courseId, session?.user?.email, session?.user?.name]);

  const printCertificate = () => window.print();

  const shareCertificate = async () => {
    const shareData = {
      title: "Novr Academy Certificate",
      text: `${certificate.learnerName} completed ${certificate.courseName}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(window.location.href);
    setShareLabel("Link copied");
    window.setTimeout(() => setShareLabel("Share"), 2000);
  };

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:px-6">
        <PageHeader title="Certificate of Completion" description="Your certificate for completing this course." />
        <Card padding="lg">
          <p className="text-sm text-[#666666]">Course not found.</p>
          <Button href="/dashboard/learn" className="mt-5">Browse courses</Button>
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-12 pt-2 sm:px-6">
      <BackLink href={`/dashboard/learn/${params.courseId}`} label="Back to Course" className="mb-5" />
      <PageHeader title="Certificate of Completion" description="Your certificate for completing this course." />

      <div className="mb-5 flex items-center justify-between gap-3">
        <Badge variant="success" className="gap-1.5">
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> Completed
        </Badge>
        <span className="text-xs text-[#767782]">Issued by Novr Academy</span>
      </div>

      <Card id="certificate" padding="none" className="overflow-hidden border-0 bg-[#F8F9FB] shadow-[0_8px_30px_rgba(26,26,46,0.12)] print:shadow-none">
        <div className="bg-gradient-to-r from-[#4451A2] via-[#683290] to-[#4451A2] p-1">
          <div className="relative overflow-hidden bg-white px-5 py-10 text-center sm:px-12 sm:py-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-[#683290]/20 sm:inset-5" />
            <div aria-hidden="true" className="absolute left-0 top-0 h-24 w-24 rounded-br-full bg-[#4451A2]/5" />
            <div aria-hidden="true" className="absolute bottom-0 right-0 h-24 w-24 rounded-tl-full bg-[#683290]/5" />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#4451A2]/10 text-[#4451A2]">
                <Award aria-hidden="true" className="h-7 w-7" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#683290]">Novr Academy</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#1A1A2E] sm:text-4xl">Certificate of Completion</h2>
              <p className="mt-3 text-sm text-[#666666]">This certificate is proudly presented to</p>
              <p className="mt-5 break-words font-serif text-3xl font-semibold text-[#4451A2] sm:text-4xl">{certificate.learnerName}</p>
              <p className="mt-4 text-sm uppercase tracking-[0.18em] text-[#767782]">for successfully completing</p>
              <p className="mx-auto mt-3 max-w-lg text-xl font-semibold text-[#1A1A2E]">{certificate.courseName}</p>

              <div className="mx-auto my-8 h-px max-w-sm bg-gradient-to-r from-transparent via-[#E5E5E5] to-transparent" />
              <div className="grid gap-5 text-left sm:grid-cols-3 sm:gap-3">
                <CertificateDetail icon={CalendarDays} label="Completion date" value={certificate.completionDate} />
                <CertificateDetail icon={Hash} label="Certificate ID" value={certificate.id} mono />
                <CertificateDetail icon={UserRound} label="Credential" value="Verified learner" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
        <Button onClick={printCertificate}>
          <Download aria-hidden="true" className="h-4 w-4" /> Download
        </Button>
        <Button
          variant="secondary"
          onClick={shareCertificate}
          className="border-[#683290] text-[#683290] hover:bg-[#683290]/5 focus-visible:ring-[#683290]"
        >
          <Share2 aria-hidden="true" className="h-4 w-4" /> {shareLabel}
        </Button>
        <Button variant="secondary" onClick={printCertificate}>
          Print
        </Button>
      </div>
    </main>
  );
}

function CertificateDetail({ icon: Icon, label, value, mono = false }: { icon: typeof CalendarDays; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2.5 sm:block sm:text-center">
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#683290] sm:mx-auto sm:mb-2" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#767782]">{label}</p>
        <p className={`mt-1 break-all text-xs font-medium text-[#1A1A2E] ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
