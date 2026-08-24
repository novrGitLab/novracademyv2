"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { HtmlEditor } from "@/components/ui/HtmlEditor";
import { createCampaignAction } from "../actions";

export default function NewCampaignPage() {
  const [isPending, startTransition] = useTransition();
  const [bodyHtml, setBodyHtml] = useState(
    "<h1>Hello from Novr Academy</h1>\n<p>Write your newsletter content here.</p>"
  );
  const [sendNow, setSendNow] = useState(false);

  function handleSubmit(formData: FormData) {
    formData.set("bodyHtml", bodyHtml);
    startTransition(async () => {
      await createCampaignAction(formData);
    });
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <Link
        href="/admin/marketing"
        className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </Link>

      <div className="rounded-card border border-border bg-background p-6 shadow-card">
        <header className="border-b border-border pb-4">
          <h1 className="text-[22px] font-semibold text-text-primary">New campaign</h1>
          <p className="mt-1 text-[14px] text-text-secondary">Compose a newsletter to send to your subscriber list.</p>
        </header>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary">Internal title</label>
            <input
              name="title"
              required
              placeholder="e.g. September product update"
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary">Email subject</label>
            <input
              name="subject"
              required
              placeholder="What subscribers see in their inbox"
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
            />
          </div>

          <HtmlEditor label="Body" value={bodyHtml} onChange={setBodyHtml} hint="HTML content of the email." />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary">Schedule for (optional)</label>
              <input
                name="scheduledAt"
                type="datetime-local"
                disabled={sendNow}
                className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors disabled:opacity-50"
              />
              <p className="mt-1 text-[12px] text-text-secondary">
                Leave blank and don&apos;t check &quot;Send now&quot; to save as a draft.
              </p>
            </div>
            <label className="flex items-start gap-2 pt-6 text-[15px] text-text-primary cursor-pointer select-none">
              <input
                type="checkbox"
                name="sendNow"
                checked={sendNow}
                onChange={(e) => setSendNow(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-blue focus:ring-blue"
              />
              Send immediately on save
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/admin/marketing"
              className="rounded-card border border-border px-4 py-2 text-[14px] font-medium text-text-primary hover:bg-surface transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white shadow-card hover:bg-blue/90 disabled:opacity-50 transition-all"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Saving..." : sendNow ? "Save & send" : "Save campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
