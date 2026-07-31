# Novr Academy — Animation Sheet

> Comprehensive micro-interaction & transition reference for the landing page, auth pages, navigation, and route transitions.

---

## Summary Table

| # | Animation | Trigger | Duration | Easing | Delay | CSS Class / Hook |
|---|-----------|---------|----------|--------|-------|------------------|
| **LANDING PAGE** |
| 1 | Hero headline fade-up | Page load | 600ms | ease-out | 0ms | `anim-fade-up anim-in` |
| 2 | Hero subheadline fade-up | Page load | 600ms | ease-out | 100ms | `anim-fade-up anim-in anim-delay-100` |
| 3 | Hero buttons fade-up | Page load | 600ms | ease-out | 200ms | `anim-fade-up anim-in anim-delay-200` |
| 4 | Feature card fade-up | Scroll into view | 400ms | out-expo | 0/150/300ms | `useInView` + `anim-fade-up` |
| 5 | Feature card hover lift | Mouse hover | 400ms | out-expo | — | `anim-card-hover` |
| 6 | Stats counter | Scroll into view | 1200ms | ease-out | 0ms | `useCounter` + `useInView` |
| 7 | CTA section fade | Scroll into view | 600ms | ease-out | 0ms | `useInView` + `anim-fade` |
| 8 | CTA button pulse | Mouse hover | 2s loop | ease-in-out | — | `animate-pulse` |
| **AUTH PAGES** |
| 9 | Left panel fade-in | Page load | 500ms | ease-out | 0ms | `anim-fade anim-in` |
| 10 | Right panel slide-in | Page load | 500ms | ease-out | 100ms | `anim-slide-right anim-in anim-delay-100` |
| 11 | Input focus ring | Input focus | 150ms | ease-out | — | `anim-input` |
| 12 | Input border transition | Input focus | 200ms | ease-out | — | `transition-colors` |
| 13 | Error message slide-down | Error state | 200ms | ease-out | — | `anim-slide-down anim-in` |
| 14 | Error shake | Form submit fail | 400ms | ease-in-out | — | `anim-shake` |
| 15 | Button hover | Mouse hover | 150ms | ease-out | — | `anim-btn-hover` |
| 16 | Button click | Mouse down | 100ms | ease-in-out | — | `anim-click` |
| 17 | Loading spinner | Loading state | 600ms loop | linear | — | `anim-spinner` |
| **NAVIGATION** |
| 18 | Sticky nav blur + shadow | Scroll > 10px | 300ms | ease-out | — | `anim-nav-scrolled` |
| 19 | Nav link underline | Mouse hover | 200ms | ease-out | — | `anim-underline` |
| 20 | Mobile menu overlay | Toggle | 200ms | ease-out | — | `anim-overlay` |
| 21 | Mobile menu drawer | Toggle | 300ms | out-expo | — | `anim-drawer` |
| **PAGE TRANSITIONS** |
| 22 | Page exit | Route change | 150ms | ease-in | — | `.page-exit` |
| 23 | Page enter | Route change | 200ms | ease-out | — | `.page-enter` |

---

## Files Created

| File | Purpose |
|------|---------|
| `lib/animations.ts` | React hooks: `useInView`, `useStaggered`, `useCounter`, `animClass` |
| `app/animations.css` | CSS keyframes, transition classes, interactive states |
| `tailwind.config.ts` | Extended with `animate-*` utilities and timing tokens |
| `app/globals.css` | Updated to import `animations.css` |

---

## Quick Reference: CSS Classes

### Scroll-Triggered (pair with `useInView` hook)

```tsx
import { useInView } from "@/lib/animations";

function Section() {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`anim-fade-up ${inView ? "anim-in" : ""}`}>
      Content
    </div>
  );
}
```

### Staggered List

```tsx
import { useStaggered } from "@/lib/animations";

function FeatureGrid({ items }) {
  const [ref, visible] = useStaggered({ count: items.length, stagger: 150 });
  return (
    <div ref={ref} className="grid grid-cols-3 gap-6">
      {items.map((item, i) => (
        <div
          key={i}
          className={`anim-fade-up ${visible[i] ? "anim-in" : ""} anim-card-hover`}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

### Counter Animation

```tsx
import { useInView, useCounter } from "@/lib/animations";

function StatCard({ label, target, suffix = "" }) {
  const [ref, inView] = useInView();
  const count = useCounter({ target, trigger: inView, duration: 1200 });
  return (
    <div ref={ref} className="anim-fade-up anim-in">
      <span className="text-4xl font-bold">{count}{suffix}</span>
      <p>{label}</p>
    </div>
  );
}
```

### Always-On Interactive States (no JS)

```html
<!-- Card with hover lift -->
<div class="anim-card-hover rounded-card bg-white shadow-card p-6">
  Card content
</div>

<!-- Button with hover + click feedback -->
<button class="anim-btn-hover anim-click rounded-card bg-blue text-white px-6 py-2.5">
  Click me
</button>

<!-- Nav link with underline animation -->
<a href="#" class="anim-underline text-text-secondary hover:text-text-primary">
  Features
</a>

<!-- Input with focus ring -->
<input class="anim-input rounded-card border border-border px-3 py-2" />

<!-- Error message with animation -->
<div class="anim-slide-down anim-in rounded-card bg-red-light px-3 py-2 text-red">
  Invalid email or password.
</div>

<!-- Loading spinner -->
<span class="anim-spinner"></span>
```

### Delay Classes

```
anim-delay-0     →   0ms
anim-delay-100   → 100ms
anim-delay-150   → 150ms
anim-delay-200   → 200ms
anim-delay-300   → 300ms
anim-delay-400   → 400ms
anim-delay-500   → 500ms
anim-delay-600   → 600ms
anim-delay-800   → 800ms
anim-delay-1000  → 1000ms
```

### Duration Classes

```
anim-duration-150  → 150ms
anim-duration-200  → 200ms
anim-duration-300  → 300ms
anim-duration-400  → 400ms
anim-duration-500  → 500ms
anim-duration-600  → 600ms
```

---

## Implementation Guide by Page

### 1. Landing Page — Hero Section

```tsx
"use client";
import { useInView } from "@/lib/animations";

export function HeroSection() {
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="...">
      <h1
        className={`anim-fade-up ${inView ? "anim-in" : ""}`}
      >
        Learning and community, in one place.
      </h1>
      <p
        className={`anim-fade-up anim-delay-100 ${inView ? "anim-in" : ""}`}
      >
        Courses, certificates, mentorship...
      </p>
      <div
        className={`anim-fade-up anim-delay-200 ${inView ? "anim-in" : ""}`}
      >
        <button className="anim-btn-hover anim-click ...">Get Started</button>
      </div>
    </section>
  );
}
```

### 2. Landing Page — Feature Cards

```tsx
"use client";
import { useStaggered } from "@/lib/animations";

const features = [
  { title: "Structured Courses", ... },
  { title: "Live Mentorship", ... },
  { title: "Verified Certificates", ... },
];

export function FeatureGrid() {
  const [ref, visible] = useStaggered({
    count: features.length,
    stagger: 150,
  });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((f, i) => (
        <div
          key={i}
          className={`anim-fade-up ${visible[i] ? "anim-in" : ""} anim-card-hover rounded-card bg-white shadow-card p-6`}
        >
          <h3>{f.title}</h3>
          <p>{f.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Landing Page — Stats Counter

```tsx
"use client";
import { useInView, useCounter } from "@/lib/animations";

function StatCard({ label, target, suffix = "" }: {
  label: string;
  target: number;
  suffix?: string;
}) {
  const [ref, inView] = useInView();
  const count = useCounter({ target, trigger: inView, duration: 1200 });

  return (
    <div ref={ref} className="text-center">
      <span className="text-5xl font-bold text-blue">
        {count.toLocaleString()}{suffix}
      </span>
      <p className="mt-2 text-text-secondary">{label}</p>
    </div>
  );
}

export function StatsSection() {
  const [ref, inView] = useInView();

  return (
    <div ref={ref} className={`anim-fade-up ${inView ? "anim-in" : ""}`}>
      <div className="grid grid-cols-3 gap-8">
        <StatCard label="Active Learners" target={2500} suffix="+" />
        <StatCard label="Courses" target={48} />
        <StatCard label="Completion Rate" target={94} suffix="%" />
      </div>
    </div>
  );
}
```

### 4. Auth Page — Split Layout

```tsx
"use client";
import { useInView } from "@/lib/animations";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [leftRef, leftInView] = useInView({ threshold: 0.1 });
  const [rightRef, rightInView] = useInView({ threshold: 0.1 });

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left panel — fade in */}
      <div
        ref={leftRef}
        className={`anim-fade ${leftInView ? "anim-in" : ""} bg-gradient-brand ...`}
      >
        Branding content
      </div>

      {/* Right panel — slide in from right */}
      <div
        ref={rightRef}
        className={`anim-slide-right anim-delay-100 ${rightInView ? "anim-in" : ""} ...`}
      >
        {children}
      </div>
    </main>
  );
}
```

### 5. Auth Page — Form with Error Handling

```tsx
"use client";
import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // ... validation
    if (result?.error) {
      setError("Invalid email or password.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input className="anim-input rounded-card border border-border ..." />

      {error && (
        <div
          className={`anim-slide-down anim-in rounded-card bg-red-light px-3 py-2 text-red text-[13px] ${shake ? "anim-shake" : ""}`}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="anim-btn-hover anim-click w-full rounded-card bg-blue ..."
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="anim-spinner" />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
```

### 6. Sticky Navigation

```tsx
"use client";
import { useEffect, useState } from "react";

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-border/50 ${
        scrolled ? "anim-nav-scrolled" : "bg-transparent"
      }`}
    >
      <a href="#features" className="anim-underline ...">Features</a>
      <a href="#pricing" className="anim-underline ...">Pricing</a>
    </nav>
  );
}
```

### 7. Mobile Menu

```tsx
"use client";
import { useState } from "react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      <div
        className={`anim-overlay fixed inset-0 z-40 bg-black/50 ${open ? "anim-in" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`anim-drawer fixed right-0 top-0 z-50 h-full w-72 bg-white shadow-pop ${
          open ? "anim-in" : ""
        }`}
      >
        Menu content
      </div>
    </>
  );
}
```

---

## Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| `blue` | `#2563EB` | Primary brand, links, focus rings |
| `purple` | `#7C3AED` | Secondary brand, gradient end |
| `gradient-brand` | `135deg blue→purple` | Auth panel, hero backgrounds |
| `rounded-card` | `8px` | Card & input border radius |
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.08)` | Default card shadow |
| `shadow-card-hover` | `0 8px 24px -8px rgba(17,24,39,0.12)` | Hover state shadow |
| `shadow-pop` | `0 20px 48px -16px rgba(17,24,39,0.22)` | Elevated elements |

---

## Accessibility

All animations respect `prefers-reduced-motion: reduce`:

- **Scroll animations**: Elements appear instantly (no slide/fade)
- **Hover effects**: No transform/translate changes
- **Spinners**: Reduced to slower rotation
- **Page transitions**: Instant swap, no animation
- **Shake**: Disabled (error still visible)

No additional configuration needed — the `@media (prefers-reduced-motion: reduce)` block in `animations.css` handles this automatically.

---

## Easing Curves

| Name | Value | Use For |
|------|-------|---------|
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | General entrances, fades |
| `out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Cards, snappy movements |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.6, 1)` | Shake, looping animations |
| `linear` | `linear` | Spinner rotation |

---

## Performance Notes

- All animations use `transform` and `opacity` only → GPU-composited, no layout thrash
- `will-change` is NOT set statically (browser optimizes on demand)
- Intersection Observer is used instead of scroll listeners for scroll-triggered animations
- `useInView` disconnects after first trigger (when `once: true`) to free resources
- CSS transitions handle hover/focus states (no JS overhead)

---

## Migration: Current Login Page

The existing `app/login/page.tsx` already uses `transition` classes on inputs and buttons. To add the full animation system:

1. Add `"use client"` (already present)
2. Import `useInView` from `@/lib/animations`
3. Wrap left panel with `anim-fade` + `useInView`
4. Wrap right panel with `anim-slide-right` + `useInView`
5. Add `anim-input` to input fields (replaces manual `transition`)
6. Add `anim-btn-hover anim-click` to buttons
7. Wrap error message with `anim-slide-down anim-in` + `anim-shake`

The changes are additive — existing classes continue to work.
