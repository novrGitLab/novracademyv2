"use client";

import { useState } from "react";
import { importQuestionsAction, type CsvQuestionRow } from "../actions";

const EXPECTED_HEADERS = ["prompt", "type", "option_a", "option_b", "option_c", "option_d", "correct_answer", "points"];

function parseCsv(text: string): CsvQuestionRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: CsvQuestionRow[] = [];

  for (const line of lines.slice(1)) {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));

    const type = row.type?.toUpperCase() as CsvQuestionRow["type"];
    const points = row.points ? Number(row.points) : 1;
    if (!row.prompt || !type) continue;

    if (type === "MULTIPLE_CHOICE") {
      const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
      const raw = (row.correct_answer ?? "").trim();
      let correctAnswer = -1;
      // Accept "A"/"B"/"C"/"D", a 0-based index, or the option's exact text.
      if (/^[a-dA-D]$/.test(raw)) correctAnswer = raw.toUpperCase().charCodeAt(0) - 65;
      else if (/^\d+$/.test(raw)) correctAnswer = Number(raw);
      else correctAnswer = options.findIndex((o) => o.toLowerCase() === raw.toLowerCase());
      if (correctAnswer < 0 || correctAnswer >= options.length) continue;
      rows.push({ type, prompt: row.prompt, options, correctAnswer, points });
    } else if (type === "TRUE_FALSE") {
      rows.push({ type, prompt: row.prompt, correctAnswer: row.correct_answer?.toLowerCase() === "true", points });
    } else if (type === "SHORT_ANSWER") {
      rows.push({ type, prompt: row.prompt, correctAnswer: row.correct_answer ?? "", points });
    }
  }
  return rows;
}

export function CsvQuestionImport({ assessmentId }: { assessmentId: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setStatus(null);

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      setError("No valid rows found — check the CSV has prompt, type, and correct_answer columns.");
      setImporting(false);
      return;
    }

    const { imported, skipped } = await importQuestionsAction(assessmentId, rows);
    setImporting(false);
    setStatus(`Imported ${imported} question(s)${skipped ? `, skipped ${skipped} invalid row(s)` : ""}.`);
    e.target.value = "";
  }

  return (
    <div className="rounded-card border border-dashed border-border p-4">
      <p className="text-[13px] font-medium text-text-secondary">Bulk import questions (CSV)</p>
      <p className="mt-1 text-[13px] text-text-secondary">
        Columns: <span className="font-mono">{EXPECTED_HEADERS.join(", ")}</span> — option/correct_answer columns are
        only used for Multiple Choice rows.
      </p>
      <input type="file" accept=".csv,text/csv" onChange={handleFile} disabled={importing} className="mt-3 text-[13px]" />
      {importing && <p className="mt-2 text-[13px] text-text-secondary">Importing…</p>}
      {status && <p className="mt-2 rounded-pill bg-success-light px-3 py-2 text-[13px] text-success">{status}</p>}
      {error && <p className="mt-2 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}
    </div>
  );
}
