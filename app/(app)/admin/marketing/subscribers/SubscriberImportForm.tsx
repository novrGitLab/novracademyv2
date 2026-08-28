"use client";

import { useState } from "react";
import { importSubscribersAction, type SubscriberRow } from "../actions";

function parseCsv(text: string): SubscriberRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = cells[i] ?? "";
    });
    return {
      email: row.email,
      firstName: row.firstname || row["first name"] || undefined,
      lastName: row.lastname || row["last name"] || undefined,
    };
  });
}

export function SubscriberImportForm({ onImported }: { onImported?: () => void }) {
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
    const rows = parseCsv(text).filter((r) => r.email);

    if (rows.length === 0) {
      setError("No valid rows found — check the CSV has an email column.");
      setUploading(false);
      return;
    }

    const outcome = await importSubscribersAction(rows);
    setUploading(false);

    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setStatus(`Imported ${outcome.imported} subscriber(s)${outcome.skipped ? `, skipped ${outcome.skipped}` : ""}.`);
    e.target.value = "";
    onImported?.();
  }

  return (
    <div className="rounded-card border border-dashed border-border p-4">
      <p className="text-[13px] font-medium text-text-secondary">Bulk import (CSV)</p>
      <p className="mt-1 text-[13px] text-text-secondary">
        Columns: <span className="font-mono">email, firstName, lastName</span>
      </p>
      <input type="file" accept=".csv,text/csv" onChange={handleFile} disabled={uploading} className="mt-3 text-[13px]" />
      {uploading && <p className="mt-2 text-[13px] text-text-secondary">Importing…</p>}
      {status && <p className="mt-2 rounded-pill bg-success-light px-3 py-2 text-[13px] text-success">{status}</p>}
      {error && <p className="mt-2 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}
    </div>
  );
}
