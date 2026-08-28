import Link from "next/link";
import type { ComponentPropsWithoutRef, ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, Loader2 } from "lucide-react";

/** Shared Cybernovr values for components and consuming applications. */
export const designTokens = {
  colors: {
    white: "#FFFFFF",
    blue: "#4451A2",
    red: "#E82027",
    purple: "#683290",
    text: {
      primary: "#1A1A2E",
      secondary: "#666666",
      muted: "#767782",
    },
    border: "#E5E5E5",
    surface: "#F8F9FB",
    background: "#FFFFFF",
  },
  radius: { card: "8px", pill: "9999px" },
  shadows: {
    card: "0 1px 3px rgba(26, 26, 46, 0.08)",
    hover: "0 8px 24px rgba(26, 26, 46, 0.12)",
  },
} as const;

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: { href: string; label?: string };
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, backLink, action, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {backLink && <BackLink href={backLink.href} label={backLink.label} className="mb-3" />}
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1A1A2E] sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666666]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({ padding = "md", hover = false, className, children, ...props }: CardProps) {
  const paddingClasses = { none: "p-0", sm: "p-3", md: "p-5", lg: "p-6 sm:p-8" };
  return (
    <div
      className={cn(
        "rounded-[8px] border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(26,26,46,0.08)]",
        paddingClasses[padding],
        hover && "transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(26,26,46,0.12)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type BadgeVariant = "default" | "blue" | "red" | "purple" | "success";

export function Badge({ variant = "default", children, className }: { variant?: BadgeVariant; children: ReactNode; className?: string }) {
  const variants: Record<BadgeVariant, string> = {
    default: "border-[#E5E5E5] bg-[#F8F9FB] text-[#666666]",
    blue: "border-[#4451A2] bg-[#4451A2]/12 text-[#4451A2] font-semibold",
    red: "border-[#E82027] bg-[#E82027]/12 text-[#E82027] font-semibold",
    purple: "border-[#683290] bg-[#683290]/15 text-[#683290] font-semibold",
    success: "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold",
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", variants[variant], className)}>{children}</span>;
}

export type ButtonVariant = "primary" | "secondary" | "danger" | "purple";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href?: string;
}

export function Button({ variant = "primary", size = "md", loading = false, disabled, href, className, children, ...props }: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#683290] text-white hover:bg-[#542573]",
    secondary: "border border-[#4451A2] bg-white text-[#4451A2] hover:bg-[#4451A2]/5",
    danger: "bg-[#E82027] text-white hover:bg-[#c9181e]",
    purple: "bg-[#683290] text-white hover:bg-[#542573]",
  };
  const sizes: Record<ButtonSize, string> = { sm: "min-h-8 px-3 text-xs", md: "min-h-10 px-4 text-sm", lg: "min-h-12 px-6 text-base" };
  const buttonClassName = cn("inline-flex items-center justify-center gap-2 rounded-[8px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#683290] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} aria-disabled={disabled || loading} className={buttonClassName}>
        {loading && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      className={buttonClassName}
    >
      {loading && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

interface FieldBaseProps { label?: string; error?: string; hint?: string; className?: string; }
type InputProps = FieldBaseProps & ComponentPropsWithoutRef<"input">;
type TextareaProps = FieldBaseProps & ComponentPropsWithoutRef<"textarea">;

function fieldClasses(error?: string, className?: string) {
  return cn("w-full rounded-[8px] border bg-white px-3 py-2.5 text-sm text-[#1A1A2E] outline-none placeholder:text-[#767782] transition-colors", error ? "border-[#E82027] focus:border-[#E82027] focus:ring-2 focus:ring-[#E82027]/15" : "border-[#E5E5E5] focus:border-[#4451A2] focus:ring-2 focus:ring-[#4451A2]/15", className);
}

function FieldMessage({ label, error, hint, id }: FieldBaseProps & { id?: string }) {
  return <>{label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">{label}</label>}{error ? <p className="mt-1.5 text-xs text-[#E82027]">{error}</p> : hint && <p className="mt-1.5 text-xs text-[#767782]">{hint}</p>}</>;
}

export const Input = forwardRef(function Input({ label, error, hint, className, id, ...props }: InputProps, ref: ForwardedRef<HTMLInputElement>) {
  return <div className="w-full"><FieldMessage id={id} label={label} error={error} hint={hint} /><input ref={ref} id={id} aria-invalid={Boolean(error)} className={fieldClasses(error, className)} {...props} /></div>;
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, className, id, ...props }: TextareaProps, ref: ForwardedRef<HTMLTextAreaElement>) {
  return <div className="w-full"><FieldMessage id={id} label={label} error={error} hint={hint} /><textarea ref={ref} id={id} aria-invalid={Boolean(error)} className={cn(fieldClasses(error), "min-h-28 resize-y", className)} {...props} /></div>;
});

export interface EmptyStateProps { icon: LucideIcon; title: string; description?: string; action?: ReactNode; className?: string; }
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return <div className={cn("flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[#E5E5E5] bg-white px-6 py-14 text-center", className)}><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F9FB] text-[#683290]"><Icon aria-hidden="true" className="h-6 w-6" /></div><h2 className="mt-4 text-base font-semibold text-[#1A1A2E]">{title}</h2>{description && <p className="mt-1 max-w-md text-sm text-[#666666]">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}

export function BackLink({ href, label = "Back", className }: { href: string; label?: string; className?: string }) {
  return <Link href={href} className={cn("inline-flex items-center gap-1 text-sm font-medium text-[#683290] transition-colors hover:text-[#542573]", className)}><ChevronLeft aria-hidden="true" className="h-4 w-4" />{label}</Link>;
}

export function SectionHeader({ title, description, action, className }: { title: string; description?: string; action?: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}><div><h2 className="text-xl font-semibold text-[#1A1A2E]">{title}</h2>{description && <p className="mt-1 text-sm text-[#666666]">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>;
}

export function StatCard({ icon: Icon, label, value, color = "blue", className }: { icon: LucideIcon; label: string; value: ReactNode; color?: "blue" | "red" | "purple" | "success"; className?: string }) {
  const colors = { blue: "bg-[#4451A2] text-white", red: "bg-[#E82027] text-white", purple: "bg-[#683290] text-white", success: "bg-emerald-600 text-white" };
  return <Card hover className={cn("p-4", className)}><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-[#666666]">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-[#1A1A2E]">{value}</p></div><div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", colors[color])}><Icon aria-hidden="true" className="h-5 w-5" /></div></div></Card>;
}

export type Status = "REQUESTED" | "ACCEPTED" | "DECLINED" | "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED" | "ACTIVE" | "INACTIVE" | "DRAFT" | "PUBLISHED" | "OPEN" | "CLOSED" | string;

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const normalized = status.toUpperCase();
  const variants: Record<string, BadgeVariant> = { ACCEPTED: "success", APPROVED: "success", COMPLETED: "success", ACTIVE: "success", PUBLISHED: "success", DECLINED: "red", REJECTED: "red", CANCELLED: "red", REQUESTED: "blue", PENDING: "blue", OPEN: "blue", DRAFT: "purple", INACTIVE: "default" };
  return <Badge variant={variants[normalized] ?? "default"} className={className}>{status.replace(/_/g, " ")}</Badge>;
}

export interface SlidesManifest {
  slideImages: string[];
  slideCount: number;
  audioUrl: string | null;
  voiceoverEnabled: boolean;
  pptxUrl: string;
  sourceLessonId: string;
  generatedAt: string;
}

export function SlidesLessonViewer({ manifest }: { manifest: SlidesManifest }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {manifest.slideImages.map((url, i) => (
        <img key={i} src={url} alt={`Slide ${i + 1}`} className="max-w-full rounded-lg shadow-md" />
      ))}
      {manifest.audioUrl && (
        <audio controls className="mt-4 w-full max-w-md">
          <source src={manifest.audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
