import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const colorStyles = {
  blue: { bg: "bg-blue-light", text: "text-blue" },
  purple: { bg: "bg-purple-light", text: "text-purple" },
  red: { bg: "bg-red-light", text: "text-red" },
  success: { bg: "bg-success-light", text: "text-success" },
};

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  color = "blue",
  trend,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
  color?: keyof typeof colorStyles;
  /** Positive/negative percentage or delta to render as a trend chip, e.g. +12.4 */
  trend?: number;
}) {
  const c = colorStyles[color];
  return (
    <div className="rounded-card border border-border bg-background p-4 shadow-card transition hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-text-secondary">{label}</p>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${c.bg} ${c.text}`}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-[24px] font-semibold tabular-nums text-text-primary">{value}</p>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-[12px] font-medium ${
              trend >= 0 ? "text-success" : "text-red"
            }`}
          >
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      {sublabel && <p className="mt-1 text-[13px] text-text-secondary">{sublabel}</p>}
    </div>
  );
}
