"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "span" | "p" | "h2" | "li";
}

/** Scroll-triggered entrance: fade + rise with cinematic easing */
export function Reveal({ children, className, delay = 0, y = 34 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1.15,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay, y]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

interface SectionShellProps {
  id: string;
  eyebrow: string;
  heading: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  /** dim the WebGL backdrop slightly more for text-heavy sections */
  scrim?: boolean;
}

/** Consistent section frame: eyebrow rule, display heading, optional lead */
export function SectionShell({ id, eyebrow, heading, lead, children, className = "", scrim = true }: SectionShellProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-shell-heading]"),
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 72%", once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`relative ${scrim ? "" : ""} ${className}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-10">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 rule-glow" aria-hidden="true" />
            <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[#e8a33d]/80">
              {eyebrow}
            </p>
            <span className="h-px flex-1 bg-white/8" aria-hidden="true" />
          </div>
        </Reveal>

        <h2
          id={`${id}-heading`}
          data-shell-heading
          className="whitespace-pre-line font-display text-4xl font-bold leading-[1.04] tracking-tight text-white/95 sm:text-5xl lg:text-6xl"
        >
          {heading}
        </h2>

        {lead ? (
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
              {lead}
            </p>
          </Reveal>
        ) : null}

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
