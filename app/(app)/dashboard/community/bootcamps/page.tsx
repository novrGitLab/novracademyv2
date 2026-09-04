"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BackLink, Badge, Button, Card, EmptyState, PageHeader } from "@/components/DesignSystem";
import { Calendar, Clock, MapPin, Search, Users, Zap } from "lucide-react";

const STATUS_OPTIONS = ["All", "UPCOMING", "IN_PROGRESS", "COMPLETED"] as const;

interface BootcampSummary {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  scheduleLabel: string | null;
  format: string;
  location: string | null;
  seatsTotal: number;
  level: string;
  topics: string[];
  status: string;
  courseId: string | null;
  _count?: { enrollments: number };
}

interface BootcampListResponse {
  bootcamps: BootcampSummary[];
  total: number;
  page: number;
  pageSize: number;
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000)));
}

function formatRange(startAt: string, endAt: string, scheduleLabel: string | null): string {
  const s = new Date(startAt);
  const e = new Date(endAt);
  const d = daysBetween(s, e);
  const datePart = `${s.toLocaleDateString()} – ${e.toLocaleDateString()}`;
  if (scheduleLabel) return `${datePart} · ${scheduleLabel}`;
  if (d === 1) return `${datePart} · 1 day`;
  return `${datePart} · ${d} days`;
}

async function fetchBootcamps(params: URLSearchParams): Promise<BootcampListResponse> {
  const res = await fetch(`/api/proxy/bootcamps?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load bootcamps");
  return res.json();
}

export default function BootcampsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [bootcamps, setBootcamps] = useState<BootcampSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [mine, setMine] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    try {
      const [list, my] = await Promise.all([
        fetchBootcamps(params),
        fetch("/api/proxy/bootcamps/mine", { cache: "no-store" })
          .then((r) => (r.ok ? (r.json() as Promise<{ enrollments: { bootcampId: string }[] }>) : { enrollments: [] }))
          .catch(() => ({ enrollments: [] as { bootcampId: string }[] })),
      ]);
      setBootcamps(list.bootcamps);
      setTotal(list.total);
      setMine(new Set(my.enrollments.map((e) => e.bootcampId)));
    } catch {
      setBootcamps([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  async function handleRegister(id: string) {
    const res = await fetch(`/api/proxy/bootcamps/${id}/register`, { method: "POST" });
    if (res.ok) {
      await load();
    }
  }

  async function handleCancel(id: string) {
    const res = await fetch(`/api/proxy/bootcamps/${id}/cancel`, { method: "POST" });
    if (res.ok) await load();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink href="/dashboard/community" label="Community" className="mb-4" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#1A1A2E]">Bootcamps</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">Intensive, multi-day programs to level up faster.</p>
        </div>
        <button onClick={() => setShowCreate((o) => !o)} className="shrink-0 rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573]">
          {showCreate ? "Close" : "Create Bootcamp"}
        </button>
      </div>

      {showCreate && <BootcampCreateForm onCreated={load} onCancel={() => setShowCreate(false)} />}

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search bootcamps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[8px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[14px] text-[#1A1A2E] outline-none focus:border-[#683290] focus:ring-2 focus:ring-[#683290]/10"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${status === s ? "bg-[#683290] text-white" : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F9FB]"}`}
          >
            {s === "All" ? "All" : s.replace("_", " ").toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 py-12 text-[13px] text-[#9CA3AF]">Loading bootcamps…</div>
      ) : bootcamps.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-10 w-10" />}
          title="No bootcamps scheduled right now"
          description="Check back soon — new bootcamps are announced here first."
          className="mt-8"
        />
      ) : (
        <div className="mt-6 grid gap-4">
          {bootcamps.map((b) => (
            <BootcampCard key={b.id} bootcamp={b} isRegistered={mine.has(b.id)} onRegister={handleRegister} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </main>
  );
}

function BootcampCard({
  bootcamp,
  isRegistered,
  onRegister,
  onCancel,
}: {
  bootcamp: BootcampSummary;
  isRegistered: boolean;
  onRegister: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const seatsLeft = Math.max(0, bootcamp.seatsTotal - (bootcamp._count?.enrollments ?? 0));
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-semibold leading-snug text-[#1A1A2E]">{bootcamp.title}</h3>
        <span className="shrink-0 rounded-full bg-[#F4ECF8] px-2 py-0.5 text-[11px] font-semibold text-[#683290]">{bootcamp.level}</span>
      </div>
      {bootcamp.description && <p className="mt-2 text-[13px] leading-relaxed text-[#6B7280]">{bootcamp.description}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="purple" className="text-[10px]">{bootcamp.format}</Badge>
        {bootcamp.topics.map((t) => (
          <Badge key={t} variant="default" className="text-[10px]">#{t}</Badge>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
        <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatRange(bootcamp.startAt, bootcamp.endAt, bootcamp.scheduleLabel)}</span>
        {bootcamp.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {bootcamp.location}</span>}
        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {seatsLeft} of {bootcamp.seatsTotal} seats left</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {bootcamp._count?.enrollments} enrolled</span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {!isRegistered ? (
          <button
            onClick={() => onRegister(bootcamp.id)}
            disabled={seatsLeft === 0}
            className="rounded-[8px] bg-[#683290] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
          >
            {seatsLeft === 0 ? "Full" : "Register Now"}
          </button>
        ) : (
          <>
            <Badge variant="purple">Registered</Badge>
            <button onClick={() => onCancel(bootcamp.id)} className="rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">Cancel registration</button>
          </>
        )}
        {bootcamp.courseId && (
          <Link href={`/dashboard/learn/${bootcamp.courseId}`} className="text-[13px] font-medium text-[#683290] hover:underline">
            Continue Learning →
          </Link>
        )}
      </div>
    </Card>
  );
}

function BootcampCreateForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [scheduleLabel, setScheduleLabel] = useState("");
  const [format, setFormat] = useState("ONLINE");
  const [location, setLocation] = useState("");
  const [seatsTotal, setSeatsTotal] = useState(30);
  const [level, setLevel] = useState("Beginner");
  const [topics, setTopics] = useState("");

  async function handleCreate() {
    const res = await fetch("/api/proxy/bootcamps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        scheduleLabel: scheduleLabel || undefined,
        format,
        location: location || undefined,
        seatsTotal: Number(seatsTotal),
        level,
        topics: topics.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) onCreated();
  }

  return (
    <Card className="mt-4 p-4">
      <h3 className="text-[14px] font-semibold text-[#1A1A2E]">Create Bootcamp</h3>
      <div className="mt-3 grid gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title*" className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]" />
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]" />
        </div>
        <input value={scheduleLabel} onChange={(e) => setScheduleLabel(e.target.value)} placeholder="Schedule label (e.g. Mon–Fri 10am–2pm WAT)" className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]" />
        <div className="grid gap-3 sm:grid-cols-3">
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]" />
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]">
            <option value="ONLINE">Online</option><option value="HYBRID">Hybrid</option><option value="IN_PERSON">In Person</option>
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]">
            <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
          </select>
        </div>
        <input type="number" value={seatsTotal} onChange={(e) => setSeatsTotal(Number(e.target.value))} min={1} placeholder="Total seats" className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]" />
        <input value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Topics (comma-separated, e.g. Web Security, Incident Response)" className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] outline-none focus:border-[#683290]" />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 text-[13px] font-medium text-[#6B7280] hover:bg-[#F8F9FB]">Close</button>
        <button
          onClick={handleCreate}
          disabled={!title.trim() || !startAt || !endAt}
          className="rounded-[8px] bg-[#683290] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#542573] disabled:opacity-50"
        >
          Create
        </button>
      </div>
    </Card>
  );
}


