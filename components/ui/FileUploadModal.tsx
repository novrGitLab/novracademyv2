"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Modal } from "./Modal";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (rows: Record<string, string>[]) => Promise<void>;
  title?: string;
  description?: string;
  templateHeaders?: string[];
  templateDownloadUrl?: string;
  accept?: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function FileUploadModal({
  open,
  onClose,
  onImport,
  title = "Import Data",
  description = "Upload a CSV or Excel file to bulk import data.",
  templateHeaders = [],
  templateDownloadUrl,
  accept = ".csv,.xlsx,.xls,text/csv",
}: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [status, setStatus] = useState<"idle" | "preview" | "importing" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        setError("File has no data rows.");
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const cells = line.split(",").map((c) => c.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = cells[i] ?? ""; });
        return row;
      });
      setPreview(rows.slice(0, 5));
      setStatus("preview");
    };
    reader.readAsText(f);
  }

  async function handleImport() {
    if (!file) return;
    setStatus("importing");
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const cells = line.split(",").map((c) => c.trim());
          const row: Record<string, string> = {};
          headers.forEach((h, i) => { row[h] = cells[i] ?? ""; });
          return row;
        });
        await onImport(rows);
        setImportedCount(rows.length);
        setStatus("success");
      };
      reader.readAsText(file);
    } catch {
      setError("Import failed. Please try again.");
      setStatus("error");
    }
  }

  function handleClose() {
    setFile(null);
    setPreview([]);
    setStatus("idle");
    setError(null);
    setImportedCount(0);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={title} description={description} size="md">
      {status === "idle" && (
        <div className="space-y-4">
          {/* Download template */}
          {templateHeaders.length > 0 && (
            <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F8F9FB] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A2E]">Download template</p>
                  <p className="mt-0.5 text-[12px] text-[#6B7280]">
                    Required columns: {templateHeaders.join(", ")}
                  </p>
                </div>
                {templateDownloadUrl ? (
                  <a
                    href={templateDownloadUrl}
                    download
                    className="flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-white"
                  >
                    <Download className="h-3 w-3" /> CSV
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      const csv = templateHeaders.join(",") + "\n";
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "template.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 rounded-[6px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-white"
                  >
                    <Download className="h-3 w-3" /> CSV
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center rounded-[8px] border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FB] p-8 transition hover:border-[#683290]/40 hover:bg-[#F4ECF8]/30"
          >
            <Upload className="h-8 w-8 text-[#9CA3AF]" strokeWidth={1.5} />
            <p className="mt-3 text-[14px] font-medium text-[#1A1A2E]">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-[12px] text-[#6B7280]">CSV, XLS, or XLSX (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-[6px] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      )}

      {status === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#683290]" />
            <span className="text-[13px] font-medium text-[#1A1A2E]">
              {file?.name} — {preview.length} rows shown ({file ? Math.max(0, 0) : 0} total)
            </span>
          </div>

          <div className="max-h-[200px] overflow-auto rounded-[8px] border border-[#E5E7EB]">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                  {preview[0] && Object.keys(preview[0]).map((h) => (
                    <th key={h} className="px-3 py-2 font-medium text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-[#E5E7EB] last:border-b-0">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-[#1A1A2E]">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setFile(null); setPreview([]); setStatus("idle"); }}
              className="rounded-[8px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
            >
              Choose Different File
            </button>
            <button
              onClick={handleImport}
              className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]"
            >
              Import {preview.length} Rows
            </button>
          </div>
        </div>
      )}

      {status === "importing" && (
        <div className="flex flex-col items-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F1F3F5] border-t-[#683290]" />
          <p className="mt-4 text-[14px] text-[#6B7280]">Importing data...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center py-8">
          <CheckCircle2 className="h-12 w-12 text-[#16A34A]" />
          <p className="mt-4 text-[16px] font-semibold text-[#1A1A2E]">Import Complete</p>
          <p className="mt-1 text-[14px] text-[#6B7280]">{importedCount} records imported successfully.</p>
          <button
            onClick={handleClose}
            className="mt-6 rounded-[8px] bg-[#683290] px-6 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]"
          >
            Done
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center py-8">
          <AlertTriangle className="h-12 w-12 text-[#DC2626]" />
          <p className="mt-4 text-[16px] font-semibold text-[#1A1A2E]">Import Failed</p>
          <p className="mt-1 text-[14px] text-[#6B7280]">{error}</p>
          <button
            onClick={() => { setStatus("idle"); setError(null); }}
            className="mt-6 rounded-[8px] bg-[#683290] px-6 py-2 text-[13px] font-medium text-white transition hover:bg-[#542573]"
          >
            Try Again
          </button>
        </div>
      )}
    </Modal>
  );
}
