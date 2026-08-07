import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Download,
  FileText,
  FlaskConical,
  Headphones,
  LockKeyhole,
  Radio,
} from "lucide-react";

export function ProgressRing({ value }: { value: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative h-32 w-32 shrink-0" aria-label={`${value}% overall completion`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" role="img">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="white"
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-2xl font-semibold tabular-nums">{value}%</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">complete</span>
      </div>
    </div>
  );
}

export function CourseCard({
  eyebrow,
  title,
  progress,
  tone,
  href = "/dashboard/learn",
}: {
  eyebrow: string;
  title: string;
  progress?: number;
  tone: "blue" | "purple";
  href?: string;
}) {
  const isEmpty = progress === undefined;
  return (
    <div className="flex min-h-[286px] flex-col overflow-hidden rounded-card border border-border bg-background shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className={`flex h-28 items-center justify-center ${tone === "blue" ? "bg-gradient-blue" : "bg-gradient-purple"}`}>
        {isEmpty ? <BookOpen className="h-9 w-9 text-white/80" /> : <span className="font-serif text-3xl text-white/90">N</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-auth-primary">{eyebrow}</p>
        <h3 className="mt-2 font-serif text-lg leading-snug text-text-primary">{title}</h3>
        {isEmpty ? (
          <p className="mt-2 text-xs leading-5 text-text-secondary">Find your next learning challenge and keep building your skills.</p>
        ) : (
          <div className="mt-auto pt-5">
            <div className="flex items-center justify-between text-[11px] text-text-secondary">
              <span>Progress</span><span className="font-semibold text-text-primary">{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-[#683290]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <Link href={href} className="mt-4 inline-flex items-center justify-center gap-2 rounded-auth bg-[#683290] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#542573]">
          {isEmpty ? "Browse Catalog" : "Resume"}<ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function FeatureCard({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="rounded-card border border-border bg-background p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-auth-tint text-auth-primary"><Icon className="h-5 w-5" /></div>
        <span className="rounded-full bg-[#E82027]/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#E82027]">Coming soon</span>
      </div>
      <h3 className="mt-5 font-serif text-lg text-text-primary">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
    </div>
  );
}

export function AchievementBadge({ unlocked = false, label }: { unlocked?: boolean; label: string }) {
  return (
    <div className={`flex min-h-[112px] flex-col items-center justify-center rounded-card border p-3 text-center ${unlocked ? "border-[#683290]/30 bg-[#683290]/10" : "border-dashed border-border bg-surface/50"}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${unlocked ? "bg-[#683290] text-white" : "bg-white text-text-secondary"}`}>
        {unlocked ? <Check className="h-5 w-5" /> : <LockKeyhole className="h-4 w-4" />}
      </div>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-wide text-text-secondary">{label}</span>
    </div>
  );
}

export function CertificateItem({ title, index }: { title: string; index: number }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-background p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-auth-tint text-auth-primary"><FileText className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-text-primary">{title}</p><p className="mt-0.5 text-xs text-text-secondary">Certificate #{index + 1} · Novr Academy</p></div>
      <Link href="/dashboard/profile" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-auth-primary hover:underline"><Download className="h-3.5 w-3.5" /> Download</Link>
    </div>
  );
}

export const featureCards = [
  { title: "Practice Labs", description: "Build confidence with hands-on challenges and realistic scenarios.", icon: FlaskConical },
  { title: "Live Sessions", description: "Learn directly from experts in interactive classes and workshops.", icon: Radio },
  { title: "Support Center", description: "Get help, guidance, and answers whenever you need them.", icon: Headphones },
];

export const placeholderCertificates = ["Foundations of Cybersecurity", "Security Operations Essentials"];
