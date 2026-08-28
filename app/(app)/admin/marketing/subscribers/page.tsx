"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { Users } from "lucide-react";
import { addSubscriberAction } from "../actions";
import { SubscriberImportForm } from "./SubscriberImportForm";

interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  source: "WEBSITE" | "IMPORT" | "MANUAL";
  status: "ACTIVE" | "UNSUBSCRIBED";
  subscribedAt: string;
}

function toCsv(rows: Subscriber[]) {
  const headers = ["email", "firstName", "lastName", "source", "status", "subscribedAt"];
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(","))];
  return lines.join("\n");
}

export default function SubscribersPage() {
  const [search, setSearch] = useState("");
  const { data, loading, refetch } = useApi<{ subscribers: Subscriber[]; total: number }>(
    `/newsletter/subscribers${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    { subscribers: [], total: 0 }
  );

  function handleExport() {
    const csv = toCsv(data.subscribers);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await addSubscriberAction(new FormData(form));
    form.reset();
    refetch();
  }

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/marketing"
        className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Subscribers</h1>
          <p className="mt-1 text-[15px] text-text-secondary">{data.total} total subscriber(s).</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-card border border-border px-4 py-2 text-[14px] font-medium text-text-primary hover:bg-surface transition-colors"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <form onSubmit={handleAdd} className="space-y-3 rounded-card border border-dashed border-border p-4">
          <p className="text-[13px] font-medium text-text-secondary">Add subscriber manually</p>
          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="w-full rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="firstName"
              placeholder="First name"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
            />
            <input
              name="lastName"
              placeholder="Last name"
              className="rounded-card border border-border bg-surface px-3 py-2 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
            />
          </div>
          <button type="submit" className="rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-blue/90 transition-colors">
            Add
          </button>
        </form>

        <SubscriberImportForm onImported={refetch} />
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full rounded-card border border-border bg-surface py-2 pl-9 pr-3 text-[15px] text-text-primary outline-none focus:border-blue transition-colors"
        />
      </div>

      {loading ? (
        <div className="mt-3">
          <TableSkeleton />
        </div>
      ) : data.subscribers.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon={Users} title="No subscribers" description="Add one manually or import a CSV above." />
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface text-[13px] text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {data.subscribers.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">{s.email}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {[s.firstName, s.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{s.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-pill px-2 py-1 text-[13px] ${
                        s.status === "ACTIVE" ? "bg-success-light text-success" : "bg-surface text-text-secondary"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
