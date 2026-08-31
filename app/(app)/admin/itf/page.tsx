"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowDownToLine,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  XCircle,
  Edit,
  RefreshCw,
  X,
} from "lucide-react";

type ItfClaimStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

interface CategoryEstimate {
  category: string;
  trainees: number;
  hours: number;
  pctTrained: number;
  awardPct: number;
  reclaimEstimate: number;
}

interface ItfEstimate {
  estimatedAmountNgn: number;
  pctTrained: number;
  awardPct: number;
  perCategory: CategoryEstimate[];
}

interface CoursePreview {
  courseId: string;
  title: string;
  category: string;
  enrolled: number;
  completed: number;
  hours: number;
  costNgn: number;
}

interface PreviewData {
  year: number;
  orgName: string;
  totalTrainees: number;
  totalHours: number;
  totalCostNgn: number;
  courses: CoursePreview[];
  categories: { category: string; trainees: number; hours: number }[];
  warnings: string[];
  estimate: ItfEstimate;
}

interface ClaimUser {
  id: string;
  name: string | null;
  email: string;
}

interface ItfClaim {
  id: string;
  organizationId: string | null;
  trainingYear: number;
  status: ItfClaimStatus;
  estimatedAmountNgn: number;
  totalTrainingCostNgn: number;
  totalTrainees: number;
  totalHours: number;
  itfReference: string | null;
  submittedAt: string | null;
  submittedById: string | null;
  submissionNotes: string | null;
  approvedAmountNgn: number | null;
  approvedAt: string | null;
  approvedById: string | null;
  approvalNotes: string | null;
  rejectedAt: string | null;
  rejectedById: string | null;
  rejectionReason: string | null;
  itfExportId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: ClaimUser | null;
  submittedBy?: ClaimUser | null;
  approvedBy?: ClaimUser | null;
  rejectedBy?: ClaimUser | null;
}

const STATUS_STYLES: Record<ItfClaimStatus, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  DRAFT: { bg: "bg-[#F3F4F6]", text: "text-[#374151]", label: "Draft", icon: <FileText className="h-3 w-3" /> },
  SUBMITTED: { bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]", label: "Submitted", icon: <Clock className="h-3 w-3" /> },
  APPROVED: { bg: "bg-[#DCFCE7]", text: "text-[#166534]", label: "Approved", icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED: { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", label: "Rejected", icon: <XCircle className="h-3 w-3" /> },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtNaira(n: number | null | undefined): string {
  if (n == null) return "—";
  return "₦" + n.toLocaleString();
}

function StatusBadge({ status }: { status: ItfClaimStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.bg} ${s.text}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

export default function ItfExportPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claims, setClaims] = useState<ItfClaim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [activeModal, setActiveModal] = useState<"submit" | "approve" | "reject" | "reopen" | null>(null);
  const [modalClaim, setModalClaim] = useState<ItfClaim | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const showToast = (kind: "ok" | "err", text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadClaims = useCallback(async () => {
    setLoadingClaims(true);
    try {
      const res = await fetch(`/api/proxy/itf/claims`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setClaims(data.claims ?? []);
    } catch (err) {
      console.error("Failed to load claims", err);
    } finally {
      setLoadingClaims(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  async function loadPreview() {
    setLoadingPreview(true);
    setError(null);
    setPreviewData(null);
    try {
      const res = await fetch(`/api/proxy/itf/preview?year=${selectedYear}`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      setPreviewData(await res.json());
    } catch (err) {
      setError((err as Error).message || "Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  }

  function handleDownload() {
    setDownloading(true);
    const a = document.createElement("a");
    a.href = `/api/proxy/itf/export?year=${selectedYear}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 3000);
  }

  // The backend returns an `estimate` object (estimatedAmountNgn, pctTrained,
  // awardPct, perCategory). Defensive defaults keep the UI from crashing if a
  // stale backend version is running without it.
  const estimate = previewData?.estimate ?? {
    estimatedAmountNgn: 0,
    pctTrained: 0,
    awardPct: 0,
    perCategory: [] as CategoryEstimate[],
  };

  async function openClaimForYear(year: number): Promise<ItfClaim | null> {
    try {
      const res = await fetch(`/api/proxy/itf/claims/${year}`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error ?? `HTTP ${res.status}`;
        showToast("err", msg);
        return null;
      }
      const data = await res.json();
      return data.claim;
    } catch (err) {
      showToast("err", (err as Error).message);
      return null;
    }
  }

  async function startClaimFromDownload() {
    const claim = await openClaimForYear(selectedYear);
    if (!claim) return;
    if (claim.status === "DRAFT") {
      setModalClaim(claim);
      setActiveModal("submit");
    } else {
      showToast("ok", `Claim for ${selectedYear} is already ${claim.status}. See history below.`);
      loadClaims();
    }
  }

  function openActionModal(action: "submit" | "approve" | "reject" | "reopen", claim: ItfClaim) {
    setModalClaim(claim);
    setActiveModal(action);
  }

  function closeModal() {
    if (busy) return;
    setActiveModal(null);
    setModalClaim(null);
  }

  async function performAction(
    action: "submit" | "approve" | "reject" | "reopen",
    body: Record<string, unknown>,
  ) {
    if (!modalClaim) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/proxy/itf/claims/${modalClaim.trainingYear}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }
      showToast("ok", `Claim ${action}ed successfully`);
      closeModal();
      await loadClaims();
      // Refresh preview if we're on the same year
      if (previewData && previewData.year === modalClaim.trainingYear) {
        loadPreview();
      }
    } catch (err) {
      showToast("err", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-[#683290]" />
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
            Claim ITF Credit
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Prepare and track your ITF reimbursement claims by training year.
          </p>
        </div>
      </div>

      {/* Year Picker */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">
          TRAINING YEAR
        </label>
        <div className="mt-3 flex items-end gap-4">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setPreviewData(null);
            }}
            className="rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={loadPreview}
            disabled={loadingPreview}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#683290] px-5 py-3 text-[14px] font-medium text-white transition hover:bg-[#542573] disabled:opacity-50"
          >
            {loadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loadingPreview ? "Loading..." : "Preview"}
          </button>
        </div>
        <p className="mt-2 text-[12px] text-[#6B7280]">
          Select the training year. All enrollments active or completed in that calendar year will be included.
        </p>
      </div>

      {error && (
        <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          {error}
        </div>
      )}

      {/* Step 1: Estimate & Export */}
      {previewData && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <div className="text-[12px] font-bold tracking-[0.6px] text-[#6B7280]">TRAINEES</div>
              <div className="mt-2 text-[24px] font-semibold text-[#1A1A2E]">{previewData.totalTrainees}</div>
              <div className="text-[11px] text-[#6B7280]">unique employees</div>
            </div>
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <div className="text-[12px] font-bold tracking-[0.6px] text-[#6B7280]">TOTAL HOURS</div>
              <div className="mt-2 text-[24px] font-semibold text-[#1A1A2E]">{previewData.totalHours}</div>
              <div className="text-[11px] text-[#6B7280]">contact training hrs</div>
            </div>
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <div className="text-[12px] font-bold tracking-[0.6px] text-[#6B7280]">TOTAL COST</div>
              <div className="mt-2 text-[20px] font-semibold text-[#1A1A2E]">₦{previewData.totalCostNgn.toLocaleString()}</div>
              <div className="text-[11px] text-[#6B7280]">across all courses</div>
            </div>
            <div className="rounded-[8px] border-2 border-[#683290] bg-[#F9F4FC] p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <div className="text-[12px] font-bold tracking-[0.6px] text-[#683290]">ESTIMATED RECLAIM</div>
              <div className="mt-2 text-[20px] font-semibold text-[#1A1A2E]">
                {fmtNaira(estimate.estimatedAmountNgn)}
              </div>
              <div className="text-[11px] text-[#6B7280]">
                {estimate.awardPct}% award · {estimate.pctTrained}% trained
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          {estimate.perCategory.length > 0 && (
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Award Roll-up (TR-2A)</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      <th className="pb-2 pr-4">Category</th>
                      <th className="pb-2 pr-4 text-right">Trainees</th>
                      <th className="pb-2 pr-4 text-right">Hours</th>
                      <th className="pb-2 pr-4 text-right">% Trained</th>
                      <th className="pb-2 pr-4 text-right">Award %</th>
                      <th className="pb-2 text-right">Reclaim (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimate.perCategory.map((c) => (
                      <tr key={c.category} className="border-b border-[#F3F4F6]">
                        <td className="py-2 pr-4 font-medium text-[#1A1A2E]">{c.category}</td>
                        <td className="py-2 pr-4 text-right text-[#374151]">{c.trainees}</td>
                        <td className="py-2 pr-4 text-right text-[#374151]">{c.hours}</td>
                        <td className="py-2 pr-4 text-right text-[#374151]">{c.pctTrained}%</td>
                        <td className="py-2 pr-4 text-right text-[#374151]">{c.awardPct}%</td>
                        <td className="py-2 text-right font-medium text-[#1A1A2E]">{c.reclaimEstimate.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warnings */}
          {previewData.warnings.length > 0 && (
            <div className="rounded-[8px] border border-[#FEF3C7] bg-[#FFFBEB] p-4 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#92400E]">
                <AlertTriangle className="h-4 w-4" />
                {previewData.warnings.length} warning(s)
              </div>
              <ul className="mt-2 space-y-1 text-[12px] text-[#78350F]">
                {previewData.warnings.slice(0, 10).map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
                {previewData.warnings.length > 10 && (
                  <li className="font-medium">...and {previewData.warnings.length - 10} more</li>
                )}
              </ul>
            </div>
          )}

          {/* Download + Start a Claim */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#16A34A] px-6 py-3 text-[14px] font-medium text-white transition hover:bg-[#15803D] disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowDownToLine className="h-4 w-4" />
              )}
              {downloading ? "Generating..." : "Download XLSX"}
            </button>
            <button
              onClick={startClaimFromDownload}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#683290] bg-white px-5 py-3 text-[14px] font-medium text-[#683290] transition hover:bg-[#F9F4FC]"
            >
              <Edit className="h-4 w-4" />
              Start a Claim
            </button>
          </div>
          <p className="-mt-3 text-right text-[12px] text-[#6B7280]">
            Download the XLSX, submit it to ITF, then record the submission here.
          </p>
        </>
      )}

      {/* Step 3: Claims History */}
      <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-[18px] font-semibold text-[#1A1A2E]">Claims History</h2>
          <button
            onClick={loadClaims}
            disabled={loadingClaims}
            className="inline-flex items-center gap-1 text-[12px] text-[#683290] hover:underline"
          >
            {loadingClaims ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Refresh
          </button>
        </div>

        {loadingClaims && claims.length === 0 ? (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading claims…
          </div>
        ) : claims.length === 0 ? (
          <p className="mt-4 text-[13px] text-[#6B7280]">
            No claims yet. Use "Start a Claim" above to create one for this year.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  <th className="pb-2 pr-4">Year</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4 text-right">Est. Reclaim</th>
                  <th className="pb-2 pr-4 text-right">Approved</th>
                  <th className="pb-2 pr-4">Submitted</th>
                  <th className="pb-2 pr-4">Outcome</th>
                  <th className="pb-2 pr-4">Updated</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} className="border-b border-[#F3F4F6] align-top">
                    <td className="py-3 pr-4 font-medium text-[#1A1A2E]">{c.trainingYear}</td>
                    <td className="py-3 pr-4"><StatusBadge status={c.status} /></td>
                    <td className="py-3 pr-4 text-right text-[#374151]">{fmtNaira(c.estimatedAmountNgn)}</td>
                    <td className="py-3 pr-4 text-right text-[#374151]">{fmtNaira(c.approvedAmountNgn)}</td>
                    <td className="py-3 pr-4 text-[#374151]">
                      {c.submittedAt ? (
                        <div>
                          <div>{fmtDate(c.submittedAt)}</div>
                          {c.itfReference && <div className="text-[11px] text-[#6B7280]">Ref: {c.itfReference}</div>}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-[#374151]">
                      {c.status === "APPROVED" && (
                        <div>
                          <div>{fmtDate(c.approvedAt)}</div>
                          {c.approvedBy && <div className="text-[11px] text-[#6B7280]">by {c.approvedBy.name ?? c.approvedBy.email}</div>}
                        </div>
                      )}
                      {c.status === "REJECTED" && (
                        <div>
                          <div>{fmtDate(c.rejectedAt)}</div>
                          {c.rejectionReason && <div className="text-[11px] text-[#6B7280]">{c.rejectionReason}</div>}
                        </div>
                      )}
                      {c.status === "SUBMITTED" && <span className="text-[11px] text-[#6B7280]">Awaiting ITF</span>}
                      {c.status === "DRAFT" && <span className="text-[11px] text-[#6B7280]">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-[12px] text-[#6B7280]">{fmtDate(c.updatedAt)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.status === "DRAFT" && (
                          <button
                            onClick={() => openActionModal("submit", c)}
                            className="rounded-[6px] bg-[#683290] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#542573]"
                          >
                            Submit
                          </button>
                        )}
                        {c.status === "SUBMITTED" && (
                          <>
                            <button
                              onClick={() => openActionModal("approve", c)}
                              className="rounded-[6px] bg-[#16A34A] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#15803D]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal("reject", c)}
                              className="rounded-[6px] bg-[#DC2626] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#B91C1C]"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => openActionModal("submit", c)}
                              className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                              title="Re-open the submission form to correct the ITF reference"
                            >
                              Edit Ref
                            </button>
                          </>
                        )}
                        {(c.status === "APPROVED" || c.status === "REJECTED") && (
                          <button
                            onClick={() => openActionModal("reopen", c)}
                            className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                          >
                            Reopen
                          </button>
                        )}
                        <a
                          href={`/api/proxy/itf/export?year=${c.trainingYear}`}
                          className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                        >
                          View Export
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal && modalClaim && (
        <ClaimActionModal
          action={activeModal}
          claim={modalClaim}
          busy={busy}
          onClose={closeModal}
          onSubmit={performAction}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-[8px] px-4 py-3 text-[13px] font-medium shadow-lg ${
            toast.kind === "ok" ? "bg-[#16A34A] text-white" : "bg-[#DC2626] text-white"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

interface ModalProps {
  action: "submit" | "approve" | "reject" | "reopen";
  claim: ItfClaim;
  busy: boolean;
  onClose: () => void;
  onSubmit: (action: "submit" | "approve" | "reject" | "reopen", body: Record<string, unknown>) => void;
}

function ClaimActionModal({ action, claim, busy, onClose, onSubmit }: ModalProps) {
  const [itfReference, setItfReference] = useState(claim.itfReference ?? "");
  const [submissionNotes, setSubmissionNotes] = useState(claim.submissionNotes ?? "");
  const [submittedAt, setSubmittedAt] = useState(
    claim.submittedAt ? claim.submittedAt.slice(0, 10) : todayISO(),
  );
  const [approvedAmount, setApprovedAmount] = useState(
    claim.approvedAmountNgn != null ? String(claim.approvedAmountNgn) : String(claim.estimatedAmountNgn),
  );
  const [approvedAt, setApprovedAt] = useState(
    claim.approvedAt ? claim.approvedAt.slice(0, 10) : todayISO(),
  );
  const [approvalNotes, setApprovalNotes] = useState(claim.approvalNotes ?? "");
  const [rejectionReason, setRejectionReason] = useState(claim.rejectionReason ?? "");
  const [rejectedAt, setRejectedAt] = useState(
    claim.rejectedAt ? claim.rejectedAt.slice(0, 10) : todayISO(),
  );
  const [confirmReopen, setConfirmReopen] = useState(false);

  const titles: Record<ModalProps["action"], string> = {
    submit: "Submit to ITF",
    approve: "Mark as Approved",
    reject: "Mark as Rejected",
    reopen: "Reopen Claim",
  };

  function handleConfirm() {
    if (action === "submit") {
      onSubmit("submit", { itfReference, submittedAt, submissionNotes: submissionNotes || undefined });
    } else if (action === "approve") {
      const amt = Number(approvedAmount);
      onSubmit("approve", { approvedAmountNgn: amt, approvedAt, approvalNotes: approvalNotes || undefined });
    } else if (action === "reject") {
      onSubmit("reject", { rejectionReason, rejectedAt });
    } else {
      onSubmit("reopen", {});
    }
  }

  const canConfirm =
    action === "submit" ? itfReference.trim().length > 0 :
    action === "approve" ? Number.isFinite(Number(approvedAmount)) && Number(approvedAmount) >= 0 :
    action === "reject" ? rejectionReason.trim().length > 0 :
    confirmReopen;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[8px] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-[18px] font-semibold text-[#1A1A2E]">{titles[action]}</h3>
            <p className="mt-1 text-[12px] text-[#6B7280]">Training year {claim.trainingYear}</p>
          </div>
          <button onClick={onClose} disabled={busy} className="text-[#6B7280] hover:text-[#1A1A2E]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {action === "submit" && (
            <>
              <Field label="ITF Reference / Acknowledgment #" required>
                <input
                  type="text"
                  value={itfReference}
                  onChange={(e) => setItfReference(e.target.value)}
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                  placeholder="e.g. ITF/2025/12345"
                />
              </Field>
              <Field label="Submission Date" required>
                <input
                  type="date"
                  value={submittedAt}
                  onChange={(e) => setSubmittedAt(e.target.value)}
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                />
              </Field>
              <Field label="Notes (optional)">
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                />
              </Field>
            </>
          )}

          {action === "approve" && (
            <>
              <Field label="Approved Amount (₦)" required>
                <input
                  type="number"
                  min={0}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                />
                <p className="mt-1 text-[11px] text-[#6B7280]">Estimated reclaim was {fmtNaira(claim.estimatedAmountNgn)}.</p>
              </Field>
              <Field label="Approval Date" required>
                <input
                  type="date"
                  value={approvedAt}
                  onChange={(e) => setApprovedAt(e.target.value)}
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                />
              </Field>
              <Field label="Notes (optional)">
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                />
              </Field>
            </>
          )}

          {action === "reject" && (
            <>
              <Field label="Rejection Reason" required>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                />
              </Field>
              <Field label="Rejection Date">
                <input
                  type="date"
                  value={rejectedAt}
                  onChange={(e) => setRejectedAt(e.target.value)}
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
                />
              </Field>
            </>
          )}

          {action === "reopen" && (
            <>
              <p className="text-[13px] text-[#374151]">
                This will move the claim back to <strong>DRAFT</strong> and clear the lifecycle fields
                (ITF reference, approval/rejection data). Use this to correct a mistake.
              </p>
              <label className="flex items-center gap-2 text-[13px] text-[#374151]">
                <input
                  type="checkbox"
                  checked={confirmReopen}
                  onChange={(e) => setConfirmReopen(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E5E7EB] text-[#683290] focus:ring-[#683290]"
                />
                I understand this will reset the claim status
              </label>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy || !canConfirm}
            className="inline-flex items-center gap-2 rounded-[6px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            {action === "submit" ? "Submit Claim" :
             action === "approve" ? "Mark Approved" :
             action === "reject" ? "Mark Rejected" :
             "Reopen Claim"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[#374151]">
        {label}{required && <span className="text-[#DC2626]"> *</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
