/**
 * Novr Academy — Animation Hooks & Utilities
 * ────────────────────────────────────────────
 * Lightweight animation system using Intersection Observer + CSS transitions.
 * No external dependencies (no Framer Motion required).
 *
 * Usage:
 *   import { useInView, useCounter, useStaggered } from "@/lib/animations";
 */

"use client";

import { useEffect, useRef, useState, useCallback, type RefObject } from "react";

/* ────────────────────────────────────────────
 * 1. useInView — trigger animation on scroll
 * ──────────────────────────────────────────── */

interface UseInViewOptions {
  /** Intersection Observer threshold (0–1). Default: 0.15 */
  threshold?: number;
  /** Root margin string. Default: "0px 0px -60px 0px" (triggers slightly before fully in view) */
  rootMargin?: string;
  /** Only trigger once. Default: true */
  once?: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.15, rootMargin = "0px 0px -60px 0px", once = true } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/* ────────────────────────────────────────────
 * 2. useStaggered — staggered reveal for lists
 * ──────────────────────────────────────────── */

interface UseStaggeredOptions {
  /** Number of items */
  count: number;
  /** Delay between each item (ms). Default: 150 */
  stagger?: number;
  /** Initial delay before first item (ms). Default: 0 */
  initialDelay?: number;
  /** Intersection Observer threshold. Default: 0.15 */
  threshold?: number;
}

export function useStaggered<T extends HTMLElement = HTMLDivElement>(
  options: UseStaggeredOptions
): [RefObject<T>, boolean[]] {
  const { count, stagger = 150, initialDelay = 0, threshold = 0.15 } = options;
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState<boolean[]>(new Array(count).fill(false));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              setVisible((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, initialDelay + i * stagger);
          }
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [count, stagger, initialDelay, threshold]);

  return [ref, visible];
}

/* ────────────────────────────────────────────
 * 3. useCounter — animated number counter
 * ──────────────────────────────────────────── */

interface UseCounterOptions {
  /** Target number to count to */
  target: number;
  /** Duration in ms. Default: 1200 */
  duration?: number;
  /** Delay before starting (ms). Default: 0 */
  delay?: number;
  /** Easing function. Default: ease-out cubic */
  easing?: (t: number) => number;
  /** Whether to start counting. Default: true (or pass trigger) */
  trigger?: boolean;
}

/** Ease-out cubic */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function useCounter(options: UseCounterOptions): number {
  const {
    target,
    duration = 1200,
    delay = 0,
    easing = easeOutCubic,
    trigger = true,
  } = options;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let frame: number;
    const timeout = setTimeout(() => {
      const start = performance.now();

      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easing(progress);
        setCount(Math.round(eased * target));

        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      }

      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [trigger, target, duration, delay, easing]);

  return count;
}

/* ────────────────────────────────────────────
 * 4. useScrollProgress — scroll-driven value
 * ──────────────────────────────────────────── */

export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(): [
  RefObject<T>,
  number
] {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return [ref, progress];
}

/* ────────────────────────────────────────────
 * 5. Utility: CSS class helpers
 * ──────────────────────────────────────────── */

/**
 * Returns animation CSS classes based on visibility state.
 * Use with the CSS classes defined in animations.css.
 *
 * @example
 *   const [ref, inView] = useInView();
 *   <div ref={ref} className={animClass("fade-up", inView)}>
 */
export function animClass(
  animation: string,
  isVisible: boolean,
  options?: { delay?: number; duration?: number }
): string {
  const delay = options?.delay ? ` anim-delay-${options.delay}` : "";
  const duration = options?.duration ? ` anim-duration-${options.duration}` : "";
  return `anim-${animation}${isVisible ? " anim-in" : " anim-out"}${delay}${duration}`;
}
