"use client";

import { useState } from "react";
import { requestSessionAction } from "./actions";

export function RequestSessionForm({ mentorId }: { mentorId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    const outcome = await requestSessionAction(mentorId, formData);
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setSent(true);
    setError(null);
  }

  if (sent) {
    return <p className="mt-2 text-[13px] text-emerald-600">Session requested — waiting on the mentor to accept.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 rounded-card bg-[#683290] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#542573]"
      >
        Request a session
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="mt-2 space-y-2">
      <input
        name="topic"
        required
        placeholder="What would you like to talk about?"
        className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[13px] text-text-primary outline-none focus:border-[#683290]"
      />
      {error && <p className="rounded-pill bg-[#E82027]/15 px-3 py-2 text-[13px] font-semibold text-[#E82027]">{error}</p>}
      <button type="submit" className="rounded-card bg-[#683290] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#542573]">
        Send request
      </button>
    </form>
  );
}
