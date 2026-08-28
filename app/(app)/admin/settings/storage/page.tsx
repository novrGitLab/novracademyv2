"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useApi, apiMutate } from "@/lib/useApi";

interface StorageStatus {
  configured: boolean;
  bucketName: string;
  accountId: string | null;
  publicUrl: string | null;
}

const cardClass = "rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]";

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F4ECF8] text-[12px] font-semibold text-[#683290]">
        {n}
      </span>
      <p className="pt-0.5 text-[13px] text-[#374151]">{children}</p>
    </li>
  );
}

export default function StorageSettingsPage() {
  const { data: status, loading, refetch } = useApi<StorageStatus>("/storage/status", {
    configured: false,
    bucketName: "novracademy-media",
    accountId: null,
    publicUrl: null,
  });

  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleTest() {
    setTesting(true);
    setResult(null);
    try {
      const outcome = await apiMutate<{ ok: boolean; message: string }>("/storage/test", "POST");
      setResult(outcome);
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Test failed" });
    } finally {
      setTesting(false);
      refetch();
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#1A1A2E]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to settings
      </Link>

      <div>
        <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">File storage (Cloudflare R2)</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Video, PDF lessons, and certificates are stored in a Cloudflare R2 bucket.
        </p>
      </div>

      {/* Status */}
      <div className={cardClass}>
        <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Connection status</h3>
        {loading ? (
          <div className="mt-3 flex items-center gap-2 text-[13px] text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking…
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <div
              className={`flex items-center gap-3 rounded-[8px] border p-4 ${
                status.configured ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#FDE68A] bg-[#FFFBEB]"
              }`}
            >
              {status.configured ? (
                <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
              ) : (
                <XCircle className="h-5 w-5 text-[#D97706]" />
              )}
              <div>
                <p className="text-[13px] font-medium text-[#1A1A2E]">
                  {status.configured ? "Configured" : "Not configured"}
                </p>
                <p className="text-[12px] text-[#6B7280]">
                  {status.configured
                    ? `Bucket "${status.bucketName}"${status.accountId ? ` · account ${status.accountId}` : ""}`
                    : "R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY is missing from the backend's .env."}
                </p>
              </div>
            </div>

            <button
              onClick={handleTest}
              disabled={testing || !status.configured}
              className="flex items-center gap-2 rounded-[8px] bg-[#683290] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#542573] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {testing ? "Testing…" : "Test connection"}
            </button>

            {result && (
              <div
                className={`flex items-start gap-2 rounded-[8px] p-3 text-[13px] ${
                  result.ok ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]"
                }`}
              >
                {result.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                {result.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Setup guide */}
      <div className={cardClass}>
        <h3 className="text-[14px] font-semibold text-[#1A1A2E]">How to get your R2 keys</h3>
        <ol className="mt-4 space-y-3">
          <Step n={1}>
            Go to <span className="font-mono">dash.cloudflare.com</span> → <strong>R2 Object Storage</strong>.
          </Step>
          <Step n={2}>
            Click <strong>Create bucket</strong> → name it <span className="font-mono">novracademy-media</span> → Create.
          </Step>
          <Step n={3}>
            On the R2 Overview page, click <strong>Manage R2 API Tokens</strong> (top right).
          </Step>
          <Step n={4}>
            Click <strong>Create API Token</strong>.
          </Step>
          <Step n={5}>
            Token name: <span className="font-mono">novr-academy-media</span>
          </Step>
          <Step n={6}>
            Permissions: <strong>Object Read &amp; Write</strong>
          </Step>
          <Step n={7}>
            Specify bucket: <span className="font-mono">novracademy-media</span>
          </Step>
          <Step n={8}>
            Click <strong>Create API Token</strong>.
          </Step>
          <Step n={9}>
            Copy these 4 values into the backend&apos;s <span className="font-mono">.env</span>:
            <div className="mt-2 rounded-[6px] bg-[#F8F9FB] p-3 font-mono text-[12px] text-[#374151]">
              R2_ACCOUNT_ID=&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#9CA3AF]"># shown on the R2 overview page (32-char hex)</span>
              <br />
              R2_ACCESS_KEY_ID=&nbsp;&nbsp;<span className="text-[#9CA3AF]"># shown after token creation</span>
              <br />
              R2_SECRET_ACCESS_KEY=&nbsp;<span className="text-[#9CA3AF]"># shown once — copy it immediately</span>
              <br />
              R2_BUCKET_NAME=novracademy-media
            </div>
          </Step>
        </ol>

        <div className="mt-5 rounded-[8px] border border-[#E5E7EB] bg-[#F8F9FB] p-4">
          <p className="text-[13px] font-medium text-[#1A1A2E]">Optional: public access for certificates</p>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            To let the bucket serve files publicly, go to the bucket → <strong>Settings</strong> →{" "}
            <strong>Public access</strong> → Allow public access, then copy the public URL it gives you (looks like{" "}
            <span className="font-mono">https://pub-xxxx.r2.dev</span>) into <span className="font-mono">R2_PUBLIC_URL</span>.
            This isn&apos;t required — certificates and lesson files are served through short-lived signed URLs by
            default, which works without public access enabled.
          </p>
        </div>

        <p className="mt-4 text-[12px] text-[#9CA3AF]">
          After editing <span className="font-mono">.env</span>, restart the backend server, then come back and click
          &quot;Test connection&quot; above.
        </p>
      </div>
    </div>
  );
}
