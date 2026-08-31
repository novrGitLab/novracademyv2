"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Download, Eye, Loader2, Lock } from "lucide-react";
import { BackLink } from "@/components/DesignSystem";
import { useToast } from "@/components/ui/toast-context";

interface CourseCert {
  id: string;
  certUid: string;
  courseTitle: string | null;
  issuedAt: string;
  isLegacy: boolean;
  pdfUrl: string | null;
}

export default function CertificatePage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { toast } = useToast();
  const [cert, setCert] = useState<CourseCert | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fetchCert() {
    setLoading(true);
    fetch(`/api/proxy/me/certificates/${courseId}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return (await res.json()) as CourseCert;
      })
      .then((data) => setCert(data))
      .catch(() => setError("Could not load your certificate."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/me/certificates/${courseId}/generate`, {
        method: "POST",
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as { certificate: CourseCert };
      setCert(data.certificate);
      toast("Certificate generated!");
    } catch (err) {
      setError((err as Error).message || "Could not generate the certificate.");
      toast((err as Error).message || "Could not generate the certificate.", "error");
    } finally {
      setGenerating(false);
    }
  }

  const pdfUrl = cert ? `/api/proxy/certificates/${cert.certUid}/pdf` : null;
  const pdfReady = cert && cert.pdfUrl;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href={`/dashboard/learn/${courseId}`} label="Back to course" className="mb-4" />

      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F4ECF8] text-[#683290]">
          <Award className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-serif text-[26px] font-semibold text-[#1A1A2E]">Your Certificate</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          {cert
            ? `Certificate of completion for ${cert.courseTitle ?? "this course"}`
            : "Complete this course to earn your certificate."}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-[#9CA3AF]">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking for certificate…
        </div>
      ) : cert && pdfUrl ? (
        <div className="mt-8 overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(26,26,46,0.08)]">
          {/* Certificate preview */}
          <div className="relative aspect-[1.414/1] w-full bg-white">
            <iframe
              src={pdfUrl}
              title="Certificate"
              className="h-full w-full"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[#E5E7EB] px-6 py-4">
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280]">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              {cert.issuedAt ? `Issued ${new Date(cert.issuedAt).toLocaleDateString()}` : "Issued"}
            </span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </a>
            <a
              href={`/certificates/${cert.certUid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
            >
              <Eye className="h-3.5 w-3.5" /> Verify certificate
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-[12px] border border-dashed border-[#E5E7EB] bg-white px-6 py-12 text-center">
          <Lock className="mx-auto h-8 w-8 text-[#D1D5DB]" />
          <h2 className="mt-3 text-[16px] font-semibold text-[#1A1A2E]">
            No certificate yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-[14px] text-[#6B7280]">
            Complete every lesson in this course and your certificate will be ready to download.
          </p>

          {error && (
            <p className="mx-auto mt-3 max-w-md rounded-[8px] bg-red-50 px-4 py-2 text-[13px] text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#683290] px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Award className="h-3.5 w-3.5" />}
              {generating ? "Generating…" : "Generate certificate"}
            </button>
            <Link
              href={`/dashboard/learn/${courseId}`}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] px-5 py-2.5 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
            >
              Back to course
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
