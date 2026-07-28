import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ClaimForm } from "./ClaimForm";

interface ClaimInfo {
  fullName: string;
  courseName: string;
  cohortLabel: string | null;
  hasExistingAccount: boolean;
}

export default async function ClaimPage({ params }: { params: { token: string } }) {
  const info = await apiFetch<ClaimInfo>(`/alumni/claim/${params.token}`).catch(() => null);
  if (!info) notFound();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12">
      <div className="w-full rounded-card border border-border bg-background p-8 shadow-card">
        <p className="text-[13px] font-medium uppercase tracking-widest text-text-secondary">Novr Academy</p>
        <h1 className="mt-4 text-[24px] font-semibold text-text-primary">Claim your profile</h1>
        <p className="mt-2 text-[15px] text-text-secondary">
          Hi {info.fullName} — your training record for <strong>{info.courseName}</strong>
          {info.cohortLabel ? ` (${info.cohortLabel})` : ""} is ready, along with your certificate.
        </p>

        <div className="mt-6">
          <ClaimForm claimToken={params.token} hasExistingAccount={info.hasExistingAccount} />
        </div>
      </div>
    </div>
  );
}
