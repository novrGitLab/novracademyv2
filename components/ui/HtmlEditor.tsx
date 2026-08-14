"use client";

import { useState } from "react";
import { Code2, Eye } from "lucide-react";

interface HtmlEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: React.ReactNode;
  placeholder?: string;
}

/** Textarea with an Edit/Preview toggle that renders the HTML in a sandboxed iframe. */
export function HtmlEditor({ label, value, onChange, hint, placeholder }: HtmlEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,46,0.08)]">
      <div className="flex items-center justify-between">
        <label className="block text-[12px] font-bold tracking-[0.6px] text-[#1A1A2E]">{label}</label>
        <div className="flex rounded-[6px] border border-[#E5E7EB] p-0.5">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-[12px] font-medium transition ${
              mode === "edit" ? "bg-[#683290] text-white" : "text-[#6B7280] hover:text-[#1A1A2E]"
            }`}
          >
            <Code2 className="h-3 w-3" strokeWidth={2} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-[12px] font-medium transition ${
              mode === "preview" ? "bg-[#683290] text-white" : "text-[#6B7280] hover:text-[#1A1A2E]"
            }`}
          >
            <Eye className="h-3 w-3" strokeWidth={2} />
            Preview
          </button>
        </div>
      </div>

      {hint && <p className="mt-1 text-[13px] text-[#6B7280]">{hint}</p>}

      {mode === "edit" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          placeholder={placeholder}
          spellCheck={false}
          className="mt-3 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] font-mono text-[#1A1A2E] outline-none transition focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
        />
      ) : (
        <iframe
          srcDoc={value}
          title={label}
          sandbox="allow-forms allow-scripts"
          className="mt-3 h-[420px] w-full rounded-[8px] border border-[#E5E7EB] bg-white"
        />
      )}
    </div>
  );
}
