import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-background px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-text-secondary">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-[15px] font-medium text-text-primary">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-text-secondary">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-5 rounded-card bg-blue px-4 py-2 text-[14px] font-medium text-white shadow-card transition hover:bg-blue/90"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
