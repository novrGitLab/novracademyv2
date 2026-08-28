import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";

interface CertificateVerification {
  certUid: string;
  learnerName: string;
  courseTitle: string | null;
  issuedAt: string;
  isLegacy: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getCertificate(certUid: string) {
  return apiFetch<CertificateVerification>(`/certificates/${certUid}`).catch(() => null);
}

export async function generateMetadata({ params }: { params: { certUid: string } }): Promise<Metadata> {
  const certificate = await getCertificate(params.certUid);
  if (!certificate) {
    return { title: "Certificate not found — Novr Academy" };
  }
  const title = `${certificate.learnerName} — ${certificate.courseTitle ?? "Certificate"} | Novr Academy`;
  const description = `Verified certificate of completion issued by Novr Academy.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CertificateVerificationPage({ params }: { params: { certUid: string } }) {
  const certificate = await getCertificate(params.certUid);

  if (!certificate) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-12">
        <div className="w-full rounded-card border border-border bg-background p-8 text-center shadow-card">
          <p className="text-[13px] font-medium uppercase tracking-widest text-text-secondary">Novr Academy</p>
          <div className="mt-4 rounded-pill bg-red-light px-3 py-1 text-[13px] font-medium text-red">
            ✕ Invalid certificate
          </div>
          <p className="mt-4 text-[15px] text-text-secondary">
            We couldn&apos;t find a certificate matching this ID. It may have been revoked or the link may be incorrect.
          </p>
          <p className="mt-4 font-mono text-[13px] text-text-secondary">ID {params.certUid}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-12">
      <div className="w-full rounded-card border border-border bg-background p-8 text-center shadow-card">
        <p className="text-[13px] font-medium uppercase tracking-widest text-text-secondary">Novr Academy</p>
        <div className="mt-4 rounded-pill bg-success-light px-3 py-1 text-[13px] font-medium text-success">
          ✓ Verified certificate
        </div>

        <h1 className="mt-6 text-[24px] font-semibold text-text-primary">{certificate.learnerName}</h1>
        <p className="mt-1 text-[15px] text-text-secondary">has successfully completed</p>
        <p className="mt-2 text-[20px] font-medium text-text-primary">{certificate.courseTitle}</p>

        <p className="mt-6 font-mono text-[13px] text-text-secondary">
          Issued {new Date(certificate.issuedAt).toLocaleDateString()} · ID {certificate.certUid}
        </p>

        <a
          href={`${API_URL}/certificates/${certificate.certUid}/pdf`}
          className="mt-6 inline-block rounded-card bg-[#683290] px-4 py-2 text-[15px] font-medium text-white hover:bg-[#542573]"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
