"use client";

import { useState } from "react";
import { startDirectThreadAction } from "./actions";

export function StartChatForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await startDirectThreadAction(formData);
    setPending(false);
    if (result?.ok === false) {
      setError(result.error);
    }
    // On success the action itself calls redirect(), which navigates away.
  }

  return (
    <div>
      <form action={handleSubmit} className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="Message someone by email…"
          className="flex-1 rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-purple"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-card bg-purple px-4 py-2 text-[15px] font-medium text-white hover:bg-purple/90 disabled:opacity-50"
        >
          Start chat
        </button>
      </form>
      {error && <p className="mt-2 rounded-pill bg-red-light px-3 py-2 text-[13px] text-red">{error}</p>}
    </div>
  );
}
