import Link from "next/link";
import { Mail, Plus } from "lucide-react";
import { apiFetchSafe } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { deleteCampaignAction } from "./actions";
import { SendCampaignButton } from "./SendCampaignButton";

interface CampaignRow {
  id: string;
  title: string;
  status: "DRAFT" | "SCHEDULED" | "SENT";
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
}

const statusStyles: Record<CampaignRow["status"], string> = {
  DRAFT: "bg-surface text-text-secondary",
  SCHEDULED: "bg-[#FFF7ED] text-[#EA580C]",
  SENT: "bg-success-light text-success",
};

export default async function MarketingPage() {
  const campaigns = await apiFetchSafe<CampaignRow[]>("/marketing-campaigns", []);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Marketing campaigns</h1>
          <p className="mt-1 text-[15px] text-text-secondary">Newsletter blasts sent to your subscriber list.</p>
        </div>
        <Link
          href="/admin/marketing/new"
          className="inline-flex items-center gap-2 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-blue/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New campaign
        </Link>
      </div>

      <div className="mt-6 flex gap-1 border-b border-border">
        <span className="border-b-2 border-blue px-4 py-2 text-[14px] font-medium text-blue">Campaigns</span>
        <Link
          href="/admin/marketing/subscribers"
          className="px-4 py-2 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Subscribers
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Mail} title="No campaigns yet" description="Create your first newsletter campaign." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Recipients</th>
                <th className="px-4 py-3 font-medium">Sent / scheduled</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">{c.title}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-pill px-2 py-1 text-[13px] ${statusStyles[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.recipientCount || "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {c.sentAt
                      ? new Date(c.sentAt).toLocaleString()
                      : c.scheduledAt
                        ? new Date(c.scheduledAt).toLocaleString()
                        : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {c.status !== "SENT" && <SendCampaignButton campaignId={c.id} />}
                      {c.status !== "SENT" && (
                        <form action={deleteCampaignAction.bind(null, c.id)}>
                          <button type="submit" className="text-[13px] font-medium text-red hover:underline">
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
