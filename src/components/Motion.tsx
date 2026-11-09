"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Scroll-triggered reveal. Renders immediately for users who prefer reduced motion. */
export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Animated statistic. The final value is server-rendered, then counts up when scrolled into view. */
export function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!inView || !el || reduce) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString("en-US");
      },
    });
    return () => controls.stop();
  }, [inView, value, reduce]);
  return (
    <span className="tabular-nums">
      <span ref={ref}>{value.toLocaleString("en-US")}</span>
      {suffix}
    </span>
  );
}

/** Parallax layer. mode="hero" moves with the page from the top; mode="section" drifts while passing through the viewport. */
export function Parallax({ children, className = "relative", amount = 18, mode = "section" }: { children: ReactNode; className?: string; amount?: number; mode?: "hero" | "section" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: mode === "hero" ? ["start start", "end start"] : ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], mode === "hero" ? ["0%", `${amount}%`] : [`-${amount / 2}%`, `${amount / 2}%`]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="absolute inset-x-0 -inset-y-[12%] will-change-transform" style={{ y: reduce ? 0 : y }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Pointer-driven 3D tilt for cards (mouse only; touch and reduced-motion users get a static card). */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 160, damping: 18 });
  const sy = useSpring(ry, { stiffness: 160, damping: 18 });
  const reduce = useReducedMotion();
  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
  }
  return (
    <motion.div
      className={className}
      style={{ rotateX: sx, rotateY: sy, transformPerspective: 1000, transformStyle: "preserve-3d" }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

// The very first page load is rendered without a transition so server-rendered content is visible
// immediately (good for LCP and for visitors without JavaScript); later navigations animate.
let firstLoad = true;

/** Page transition used by the public template: content rises in beneath a gold progress line. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const skip = useRef(firstLoad).current;
  useEffect(() => {
    firstLoad = false;
  }, []);
  if (reduce || skip) return <>{children}</>;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gold"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ scaleX: { duration: 0.7, ease: EASE }, opacity: { duration: 0.4, delay: 0.6 } }}
      />
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
        {children}
      </motion.div>
    </>
  );
}
