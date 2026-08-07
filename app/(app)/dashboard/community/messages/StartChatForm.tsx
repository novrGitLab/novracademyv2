"use client";

import { useState } from "react";
import { Button, Input } from "@/components/DesignSystem";
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
      <form action={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="email"
          type="email"
          required
          placeholder="Message someone by email…"
          aria-label="Member email"
          className="h-10 flex-1"
        />
        <Button
          type="submit"
          disabled={pending}
          variant="primary"
          size="md"
        >
          Start chat
        </Button>
      </form>
      {error && <p role="alert" className="mt-2 rounded-[8px] bg-[#E82027]/10 px-3 py-2 text-sm text-[#E82027]">{error}</p>}
    </div>
  );
}
