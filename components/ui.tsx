import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-card text-[14px] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#683290] disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  ...props
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: "bg-[#683290] text-white shadow-card hover:bg-[#542573] hover:shadow-card-hover active:scale-[0.98]",
    secondary: "bg-brand-purple text-white shadow-card hover:bg-brand-purple/90 hover:shadow-card-hover active:scale-[0.98]",
    ghost: "text-text-secondary hover:bg-surface hover:text-text-primary active:scale-[0.98]",
    danger: "bg-[#E82027] text-white shadow-card hover:bg-[#c9181e] hover:shadow-card-hover active:scale-[0.98]",
    outline: "border border-border bg-background text-text-primary shadow-card hover:bg-surface hover:shadow-card-hover active:scale-[0.98]",
  };
  const sizes = { sm: "px-3 py-1.5 text-[13px]", md: "px-4 py-2.5 text-[14px]", lg: "px-6 py-3 text-[15px]" };

  return (
    <button
      {...props}
      className={`${buttonBase} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
      {children}
    </button>
  );
}

export function Badge({
  variant = "default",
  children,
  className = "",
}: {
  variant?: "default" | "brand" | "success" | "warning" | "danger" | "purple" | "outline";
  children: React.ReactNode;
  className?: string;
}) {
  const variants = {
    default: "bg-surface text-text-secondary border-border",
    brand: "bg-[#4451A2] text-white border-[#4451A2]",
    success: "bg-emerald-600 text-white border-emerald-600",
    warning: "bg-warning-light text-warning border-warning/20",
    danger: "bg-[#E82027] text-white border-[#E82027]",
    purple: "bg-[#683290] text-white border-[#683290]",
    outline: "bg-transparent text-text-secondary border-border",
  };
  return <span className={`inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-[12px] font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

export function Card({
  className = "",
  children,
  hover = false,
  ...props
}: { className?: string; children: React.ReactNode; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-card border border-border bg-background p-5 shadow-card ${hover ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover" : ""} ${className}`} {...props}>{children}</div>;
}

export function StatTile({
  label,
  value,
  icon: Icon,
  color = "blue",
  sublabel,
  trend,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: "blue" | "purple" | "red" | "success" | "warning";
  sublabel?: string;
  trend?: number;
}) {
  const colorMap = {
    blue: { bg: "bg-[#4451A2]", text: "text-white" },
    purple: { bg: "bg-[#683290]", text: "text-white" },
    red: { bg: "bg-[#E82027]", text: "text-white" },
    success: { bg: "bg-emerald-600", text: "text-white" },
    warning: { bg: "bg-warning-light", text: "text-warning" },
  };
  const c = colorMap[color];
  return <Card className="!p-4" hover>
    <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-text-secondary">{label}</p>{Icon && <div className={`flex h-8 w-8 items-center justify-center rounded-full ${c.bg} ${c.text}`}><Icon className="h-4 w-4" strokeWidth={2} /></div>}</div>
    <div className="mt-2 flex items-baseline gap-2"><p className="text-[24px] font-semibold tabular-nums text-text-primary">{value}</p>{trend !== undefined && <span className={`flex items-center gap-0.5 text-[12px] font-medium ${trend >= 0 ? "text-emerald-600" : "text-[#E82027]"}`}>{trend >= 0 ? "↑" : "↓"}{Math.abs(trend).toFixed(1)}%</span>}</div>
    {sublabel && <p className="mt-1 text-[13px] text-text-secondary">{sublabel}</p>}
  </Card>;
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex items-end justify-between gap-4"><div><h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>{description && <p className="mt-0.5 text-[13px] text-text-secondary">{description}</p>}</div>{action && <div>{action}</div>}</div>;
}

export function ProgressBar({ value, max = 100, color = "blue", showLabel = false, size = "md" }: { value: number; max?: number; color?: "blue" | "purple" | "success" | "red"; showLabel?: boolean; size?: "sm" | "md" | "lg" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorMap = { blue: "bg-[#4451A2]", purple: "bg-[#683290]", success: "bg-emerald-600", red: "bg-[#E82027]" };
  const sizeMap = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  return <div className="flex items-center gap-3"><div className={`flex-1 overflow-hidden rounded-full bg-surface-dark ${sizeMap[size]}`}><div className={`h-full rounded-full ${colorMap[color]} progress-bar-animated`} style={{ width: `${pct}%` }} /></div>{showLabel && <span className="min-w-[3ch] text-right text-[12px] font-medium tabular-nums text-text-secondary">{Math.round(pct)}%</span>}</div>;
}

export function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string; count?: number }[]; activeTab: string; onChange: (id: string) => void }) {
  return <div className="flex items-center gap-1 border-b border-border">{tabs.map((tab) => <button key={tab.id} onClick={() => onChange(tab.id)} className={`relative px-4 py-2.5 text-[14px] font-medium transition-colors ${activeTab === tab.id ? "text-[#683290]" : "text-text-secondary hover:text-text-primary"}`}>{tab.label}{tab.count !== undefined && <span className="ml-1.5 text-[12px] text-text-muted">({tab.count})</span>}{activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#683290]" />}</button>)}</div>;
}

export function EmptyStateUI({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: { label: string; href: string } }) {
  return <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-background px-6 py-14 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-text-secondary"><Icon className="h-6 w-6" strokeWidth={1.75} /></div><p className="mt-4 text-[15px] font-medium text-text-primary">{title}</p>{description && <p className="mt-1 max-w-sm text-[13px] text-text-secondary">{description}</p>}{action && <Link href={action.href} className="mt-5 rounded-card bg-[#683290] px-4 py-2 text-[14px] font-medium text-white shadow-card transition hover:bg-[#542573]">{action.label}</Link>}</div>;
}

export function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-12 w-auto", md: "h-16 w-auto", lg: "h-20 w-auto" };
  return <img src="/novracademy-logo.png" alt="Novr Academy" className={`${sizes[size]} object-contain`} />;
}
