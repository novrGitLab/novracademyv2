"use client";

import { Mail } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { composeNotificationAction } from "./actions";

interface HistoryEntry {
  title: string;
  sentAt: string;
  recipientCount: number;
  readCount: number;
}

export default function AdminNotificationsPage() {
  const { data, loading, refetch } = useApi<{ history: HistoryEntry[] }>("/notifications/history", { history: [] });
  const history = data.history;

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await composeNotificationAction(new FormData(form));
    form.reset();
    refetch();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-[24px] font-semibold text-text-primary">Notifications & communications</h1>
      <p className="mt-1 text-[15px] text-text-secondary">
        Compose to a segment of members. Automated trigger notifications (enrollment, expiry, etc.) are always on and
        aren't individually toggleable yet.
      </p>

      <form onSubmit={handleSend} className="mt-6 space-y-3 rounded-card border border-dashed border-border p-4">
        <div>
          <label className="text-[13px] font-medium text-text-secondary">Segment</label>
          <select
            name="segment"
            className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
          >
            <option value="all">All members</option>
            <option value="inactive">Inactive members (no posts or DMs)</option>
            <option value="mentors">Active mentors</option>
            <option value="open_to_work">Open to work</option>
          </select>
        </div>
        <input
          name="title"
          required
          placeholder="Title"
          className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
        />
        <textarea
          name="content"
          required
          rows={4}
          placeholder="Message"
          className="w-full resize-none rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue"
        />
        <div className="flex gap-4 text-[15px] text-text-primary">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="channels" value="in_app" defaultChecked className="h-4 w-4" />
            In-app
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="channels" value="email" className="h-4 w-4" />
            Email
          </label>
        </div>
        <button type="submit" className="rounded-card bg-blue px-4 py-2 text-[15px] font-medium text-white hover:bg-blue/90">
          Send
        </button>
      </form>

      <h2 className="mt-8 text-[15px] font-medium text-text-secondary">History</h2>
      {loading ? (
        <div className="mt-3">
          <TableSkeleton />
        </div>
      ) : history.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon={Mail} title="Nothing sent yet" description="Compose a message above to reach a segment of members." />
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Sent</th>
                <th className="px-4 py-3 font-medium">Recipients</th>
                <th className="px-4 py-3 font-medium">Read</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">{h.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(h.sentAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-text-secondary">{h.recipientCount}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {h.readCount}/{h.recipientCount}
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
