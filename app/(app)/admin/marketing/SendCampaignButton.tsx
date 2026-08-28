"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiMutate } from "@/lib/useApi";
import { Toast } from "@/components/ui/Toast";

interface SendResult {
  deliveryStats: { sent: number; failed: number } | null;
}

export function SendCampaignButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleSend() {
    setSending(true);
    try {
      const result = await apiMutate<SendResult>(`/marketing-campaigns/${campaignId}/send`, "POST");
      if (result.deliveryStats) {
        const { sent, failed } = result.deliveryStats;
        setToast({
          message: failed > 0 ? `Sent to ${sent}, ${failed} failed` : `Sent to ${sent} subscriber${sent === 1 ? "" : "s"}`,
          type: failed > 0 ? "error" : "success",
        });
      } else {
        setToast({ message: "Queued for background sending", type: "success" });
      }
      router.refresh();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to send", type: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button onClick={handleSend} disabled={sending} className="text-[13px] font-medium text-blue hover:underline disabled:opacity-50">
        {sending ? "Sending…" : "Send now"}
      </button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
