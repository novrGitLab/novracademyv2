"use client";

import { useState } from "react";
import { useApi } from "@/lib/useApi";
import {
  ArrowDownToLine,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";

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
}

export default function ItfExportPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

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
    // Trigger download via a hidden link
    const a = document.createElement("a");
    a.href = `/api/proxy/itf/export?year=${selectedYear}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 3000);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-[#683290]" />
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">
            ITF Reclaim Export
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Generate training records for ITF compliance reimbursement claims.
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
          Select the training year to generate a report for. All enrollments active or completed
          in that calendar year will be included.
        </p>
      </div>

      {error && (
        <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          {error}
        </div>
      )}

      {/* Preview */}
      {previewData && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <div className="text-[12px] font-bold tracking-[0.6px] text-[#6B7280]">TRAINEES</div>
              <div className="mt-2 text-[28px] font-semibold text-[#1A1A2E]">{previewData.totalTrainees}</div>
              <div className="text-[12px] text-[#6B7280]">unique employees trained</div>
            </div>
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <div className="text-[12px] font-bold tracking-[0.6px] text-[#6B7280]">TOTAL HOURS</div>
              <div className="mt-2 text-[28px] font-semibold text-[#1A1A2E]">{previewData.totalHours}</div>
              <div className="text-[12px] text-[#6B7280]">contact training hours</div>
            </div>
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <div className="text-[12px] font-bold tracking-[0.6px] text-[#6B7280]">TOTAL COST</div>
              <div className="mt-2 text-[28px] font-semibold text-[#1A1A2E]">₦{previewData.totalCostNgn.toLocaleString()}</div>
              <div className="text-[12px] text-[#6B7280]">across all courses</div>
            </div>
          </div>

          {/* Category breakdown */}
          {previewData.categories.length > 0 && (
            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
              <h3 className="text-[14px] font-semibold text-[#1A1A2E]">ITF Category Breakdown (TR-2A)</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      <th className="pb-2 pr-4">Category</th>
                      <th className="pb-2 pr-4 text-right">Trainees</th>
                      <th className="pb-2 text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.categories.map((c) => (
                      <tr key={c.category} className="border-b border-[#F3F4F6]">
                        <td className="py-2 pr-4 font-medium text-[#1A1A2E]">{c.category}</td>
                        <td className="py-2 pr-4 text-right text-[#374151]">{c.trainees}</td>
                        <td className="py-2 text-right text-[#374151]">{c.hours}</td>
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

          {/* Download */}
          <div className="flex justify-end">
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
          </div>
        </>
      )}
    </div>
  );
}
