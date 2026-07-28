"use client";

import { useState } from "react";
import { importAlumniAction, type AlumniRecordRow } from "./actions";

const EXPECTED_HEADERS = ["fullName", "email", "phone", "courseName", "completionDate", "score", "cohortLabel"];

function parseCsv(text: string): AlumniRecordRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = cells[i] ?? "";
    });
    return {
      fullName: row.fullName,
      email: row.email || undefined,
      phone: row.phone || undefined,
      courseName: row.courseName,
      completionDate: row.completionDate || undefined,
      score: row.score ? Number(row.score) : undefined,
      cohortLabel: row.cohortLabel || undefined,
    };
  });
}

export function AlumniImportForm({ onImported }: { onImported?: () => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setStatus(null);

    const text = await file.text();
    const records = parseCsv(text).filter((r) => r.fullName && r.courseName);

    if (records.length === 0) {
      setError("No valid rows found — check the CSV has fullName and courseName columns.");
      setUploading(false);
      return;
    }

    const outcome = await importAlumniAction(records);
    setUploading(false);

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setStatus(`Imported ${outcome.count} record(s). Certificates are generating and invite emails are queued.`);
    e.target.value = "";
    onImported?.();
  }

  return (
    <div className="rounded-card border border-dashed border-border p-4">
      <p className="text-[13px] font-medium text-text-secondary">Bulk import (CSV)</p>
      <p className="mt-1 text-[13px] text-text-secondary">
        Columns: <span className="font-mono">{EXPECTED_HEADERS.join(", ")}</span>
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        disabled={uploading}
        className="mt-3 text-[13px]"
      />
      {uploading && <p className="mt-2 text-[13px] text-text-secondary">Importing…</p>}
      {status && <p className="mt-2 rounded-pill bg-success-light px-3 py-2 text-[13px] text-success">{status}</p>}
      {error && <p className="mt-2 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}
    </div>
  );
}
