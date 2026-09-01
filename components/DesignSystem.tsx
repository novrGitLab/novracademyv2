"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ForwardedRef, ReactNode } from "react";
import { forwardRef, useState, useRef, useEffect } from "react";
import { ChevronLeft, Loader2, Sparkles } from "lucide-react";

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

export interface EmptyStateProps { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string; }
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return <div className={cn("flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[#E5E5E5] bg-white px-6 py-14 text-center", className)}><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F9FB] text-[#683290]">{icon ?? <Sparkles aria-hidden="true" className="h-6 w-6" />}</div><h2 className="mt-4 text-base font-semibold text-[#1A1A2E]">{title}</h2>{description && <p className="mt-1 max-w-md text-sm text-[#666666]">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}

export function BackLink({ href, label = "Back", className }: { href: string; label?: string; className?: string }) {
  return <Link href={href} className={cn("inline-flex items-center gap-1 text-sm font-medium text-[#683290] transition-colors hover:text-[#542573]", className)}><ChevronLeft aria-hidden="true" className="h-4 w-4" />{label}</Link>;
}

export function SectionHeader({ title, description, action, className }: { title: string; description?: string; action?: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}><div><h2 className="text-xl font-semibold text-[#1A1A2E]">{title}</h2>{description && <p className="mt-1 text-sm text-[#666666]">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>;
}

export function StatCard({ icon, label, value, color = "blue", className }: { icon?: ReactNode; label: string; value: ReactNode; color?: "blue" | "red" | "purple" | "success"; className?: string }) {
  const colors = { blue: "bg-[#4451A2] text-white", red: "bg-[#E82027] text-white", purple: "bg-[#683290] text-white", success: "bg-emerald-600 text-white" };
  return <Card hover className={cn("p-4", className)}><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-[#666666]">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-[#1A1A2E]">{value}</p></div>{icon && <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", colors[color])}>{icon}</div>}</div></Card>;
}

export type Status = "REQUESTED" | "ACCEPTED" | "DECLINED" | "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED" | "ACTIVE" | "INACTIVE" | "DRAFT" | "PUBLISHED" | "OPEN" | "CLOSED" | string;

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const normalized = status.toUpperCase();
  const variants: Record<string, BadgeVariant> = { ACCEPTED: "success", APPROVED: "success", COMPLETED: "success", ACTIVE: "success", PUBLISHED: "success", DECLINED: "red", REJECTED: "red", CANCELLED: "red", REQUESTED: "blue", PENDING: "blue", OPEN: "blue", DRAFT: "purple", INACTIVE: "default" };
  return <Badge variant={variants[normalized] ?? "default"} className={className}>{status.replace(/_/g, " ")}</Badge>;
}

export interface SlideItem {
  type: "bg" | "text" | "image";
  color?: string;
  src?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  text?: string;
  fontSize?: number;
  bold?: boolean;
  align?: string;
}

export interface SlideContent {
  index: number;
  items: SlideItem[];
}

export interface SlidesManifest {
  slideImages: string[];
  slideCount: number;
  audioUrl: string | null;
  voiceoverEnabled: boolean;
  pptxUrl: string;
  sourceLessonId: string;
  generatedAt: string;
  slidesData?: SlideContent[];
  slideW?: number;
  slideH?: number;
  mode?: "raster" | "composited";
  slideTimings?: Array<{ index: number; start: number; end: number }>;
  remoteDeckId?: string;
}

export function SlidesLessonViewer({ manifest, className = "" }: { manifest: SlidesManifest; className?: string }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);
  const [zoom, setZoom] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasContent = manifest.slidesData && manifest.slidesData.length > 0;
  const mode = manifest.mode ?? (hasContent ? "composited" : "raster");
  const slideW = manifest.slideW ?? 12192000;
  const slideH = manifest.slideH ?? 6858000;
  const timings = manifest.slideTimings ?? [];
  const total = manifest.slideCount || (mode === "composited" ? manifest.slidesData?.length ?? 0 : manifest.slideImages.length);
  const hasAudio = Boolean(manifest.audioUrl);

  function goPrev() { setCurrent((c) => Math.max(0, c - 1)); }
  function goNext() { setCurrent((c) => Math.min(total - 1, c + 1)); }
  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  // Slideshow / fullscreen: request browser fullscreen on the stage. When
  // active, the stage fills the screen on a black backdrop and the standard
  // prev/next + keyboard controls keep working. Esc exits via the browser.
  async function togglePresent() {
    const stage = stageRef.current;
    if (!stage) return;
    try {
      if (presenting) {
        await (document.exitFullscreen?.() ?? Promise.resolve());
      } else {
        await stage.requestFullscreen?.();
      }
    } catch {
      // Fullscreen API unsupported/denied — keep the inline player usable.
    }
  }

  useEffect(() => {
    const onFsChange = () => {
      const fs = Boolean(document.fullscreenElement);
      setPresenting(fs);
      if (!fs) setZoom(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Auto-advance: when enabled and there's no narration (or narration is
  // paused), advance every 6s so the deck runs hands-free in fullscreen.
  // Pauses when the user manually navigates to stay in sync with intent.
  useEffect(() => {
    if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = null; }
    if (!autoplay || hasAudio && playing) return;
    autoTimer.current = setTimeout(() => {
      setCurrent((c) => {
        if (c >= total - 1) {
          setAutoplay(false);
          return c;
        }
        return c + 1;
      });
    }, 6000);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [autoplay, playing, hasAudio, current, total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      else if (e.key === "Escape") { setZoom(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, timings]);

  // Touch swipe (mobile): horizontal swipe navigates slides.
  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(dx) < 48) return;
      if (dx < 0) goNext(); else goPrev();
    },
  };

  const progressPct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Full-bleed stage */}
      <div
        ref={stageRef}
        {...touchHandlers}
        className={`relative w-full overflow-hidden rounded-card border border-border bg-black shadow-[0_4px_20px_rgba(26,26,46,0.15)] ${
          presenting ? "flex items-center justify-center !rounded-none !border-0" : ""
        }`}
        style={{ aspectRatio: "16/9" }}
      >
        {/* Raster mode: pre-rendered slide PNGs */}
        {mode === "raster" && manifest.slideImages.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`Slide ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            onClick={i === current ? () => setZoom((z) => !z) : undefined}
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
            style={{
              opacity: i === current ? 1 : 0,
              pointerEvents: i === current ? "auto" : "none",
              transform: i === current && zoom ? "scale(1.6)" : "scale(1)",
              cursor: i === current ? "zoom-in" : "default",
            }}
          />
        ))}

        {/* Composited mode: positioned text + images on a 16:9 canvas */}
        {mode === "composited" && hasContent && manifest.slidesData!.map((slide, si) => (
          <div
            key={si}
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: si === current ? 1 : 0, pointerEvents: si === current ? "auto" : "none" }}
          >
            {slide.items.map((item, ii) => {
              if (item.type === "bg" && item.color) {
                return (
                  <div key={ii} className="absolute inset-0" style={{ background: item.color }} />
                );
              }
              if (item.type === "text" && item.text && item.x != null && item.y != null) {
                const vw = ((item.fontSize ?? 18) / 72) * 13.333333;
                return (
                  <div
                    key={ii}
                    className="absolute"
                    style={{
                      left: `${(item.x / slideW) * 100}%`,
                      top: `${(item.y / slideH) * 100}%`,
                      width: `${((item.w ?? 0) / slideW) * 100}%`,
                      height: `${((item.h ?? 0) / slideH) * 100}%`,
                      fontSize: `min(${vw}vw, ${(item.fontSize ?? 18) * 1.4}px)`,
                      lineHeight: "1.15",
                      fontWeight: item.bold ? 700 : 400,
                      textAlign: (item.align as "left" | "center" | "right") || "left",
                      color: item.color || undefined,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {item.text}
                  </div>
                );
              }
              if (item.type === "image" && item.src && item.x != null && item.y != null) {
                return (
                  <div
                    key={ii}
                    className="absolute overflow-hidden"
                    style={{
                      left: `${(item.x / slideW) * 100}%`,
                      top: `${(item.y / slideH) * 100}%`,
                      width: `${((item.w ?? 0) / slideW) * 100}%`,
                      height: `${((item.h ?? 0) / slideH) * 100}%`,
                    }}
                  >
                    <img src={item.src} alt="" className="h-full w-full object-cover" draggable={false} />
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}

        {/* Navigation arrows */}
        {total > 1 && (
          <>
            <button onClick={goPrev} disabled={current === 0}
              className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white transition hover:bg-black/80 disabled:opacity-0 disabled:pointer-events-none"
              aria-label="Previous slide">&#8249;</button>
            <button onClick={goNext} disabled={current === total - 1}
              className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white transition hover:bg-black/80 disabled:opacity-0 disabled:pointer-events-none"
              aria-label="Next slide">&#8250;</button>
          </>
        )}

        {/* Slide counter */}
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-medium tabular-nums text-white backdrop-blur-sm">
          {current + 1} / {total}
        </div>

        {/* Progress bar */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-white/10">
          <div className="h-full bg-[#683290] transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>

        {zoom && (
          <div className="absolute right-3 top-3 z-20 rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            Zoomed — click slide to reset
          </div>
        )}

        {/* Dots */}
        {total <= 10 && total > 1 && (
          <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2 w-2 rounded-full transition ${i === current ? "bg-white scale-110" : "bg-white/40"}`}
                aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {showThumbs && total > 1 && (
        <div className="flex w-full max-w-3xl gap-2 overflow-x-auto pb-1">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`relative h-14 w-24 shrink-0 overflow-hidden rounded border transition ${
                i === current ? "border-[#683290] ring-2 ring-[#683290]/40" : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              {mode === "raster" ? (
                <img src={manifest.slideImages[i]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface text-[10px] font-medium text-text-secondary">
                  {i + 1}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Controls + audio */}
      <div className="flex w-full max-w-3xl flex-col items-center gap-3">
        {manifest.audioUrl ? (
          <div className="flex w-full items-center gap-3 rounded-card border border-border bg-white px-3 py-2 shadow-card">
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#683290] text-white transition hover:bg-[#542573]"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <audio
              ref={audioRef}
              preload="auto"
              className="w-full"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onTimeUpdate={() => {
                const t = audioRef.current?.currentTime ?? 0;
                if (timings.length) {
                  const idx = timings.findIndex((s) => t >= s.start && t < s.end);
                  if (idx >= 0) setCurrent(idx);
                } else {
                  const duration = audioRef.current?.duration ?? 0;
                  if (duration <= 0) return;
                  const slideIdx = Math.min(Math.floor((t / duration) * total), total - 1);
                  setCurrent(slideIdx);
                }
              }}
            >
              <source src={manifest.audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[13px] text-text-secondary">
            <button onClick={goPrev} disabled={current === 0} className="rounded-card border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary transition hover:bg-surface disabled:opacity-30">← Prev</button>
            <span className="px-2 text-[13px] tabular-nums text-text-primary">{current + 1} / {total}</span>
            <button onClick={goNext} disabled={current === total - 1} className="rounded-card border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary transition hover:bg-surface disabled:opacity-30">Next →</button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={togglePresent}
            className="inline-flex items-center gap-1.5 rounded-card border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary transition hover:bg-surface"
            aria-label={presenting ? "Exit fullscreen" : "Present slideshow (fullscreen)"}
          >
            {presenting ? "Exit fullscreen" : "Present"}
          </button>
          {total > 1 && (
            <>
              <button
                onClick={() => setAutoplay((a) => !a)}
                disabled={hasAudio && playing}
                className={`inline-flex items-center gap-1.5 rounded-card border px-3 py-1.5 text-[13px] font-medium transition ${
                  autoplay
                    ? "border-[#683290] bg-[#683290] text-white"
                    : "border-border text-text-primary hover:bg-surface"
                }`}
                aria-label="Toggle auto-advance"
              >
                {autoplay ? "Autoplay on" : "Autoplay"}
              </button>
              <button
                onClick={() => setShowThumbs((s) => !s)}
                className={`inline-flex items-center gap-1.5 rounded-card border px-3 py-1.5 text-[13px] font-medium transition ${
                  showThumbs
                    ? "border-[#683290] bg-[#683290] text-white"
                    : "border-border text-text-primary hover:bg-surface"
                }`}
                aria-label="Toggle slide thumbnails"
              >
                Thumbnails
              </button>
            </>
          )}
          {manifest.pptxUrl && (
            <a href={manifest.pptxUrl} target="_blank" rel="noopener noreferrer"
              className="text-[13px] font-medium text-[#4451A2] hover:underline">Download PowerPoint</a>
          )}
        </div>
      </div>
    </div>
  );
}
