"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { profile } from "@/data/portfolio";
import { useExperience } from "@/store/experience";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const introDone = useExperience((s) => s.introDone);
  const webglFailed = useExperience((s) => s.webglFailed);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  // Entrance of the DOM typography once the particle→chip intro completes
  useEffect(() => {
    if (!introDone || !contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-line]",
        { opacity: 0, y: 46, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.35,
          ease: "power3.out",
          stagger: 0.14,
        }
      );
      gsap.fromTo(
        "[data-hero-fade]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power2.out", stagger: 0.1, delay: 0.55 }
      );
    }, contentRef.current);
    return () => ctx.revert();
  }, [introDone]);

  // Pinned hero: the camera keeps moving behind while the copy parallaxes out
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-hero-copy]", {
        yPercent: -28,
        opacity: 0,
        filter: "blur(6px)",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=65%",
          scrub: 0.6,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });
      gsap.to("[data-scroll-cue]", {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=25%",
          scrub: true,
        },
      });
    }, section);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex h-[100svh] items-center justify-center overflow-hidden"
      aria-label="Introduction"
    >
      {/* Readability scrim (WebGL scene shines through) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(70%_42%_at_50%_42%,rgba(5,4,3,0.62),rgba(5,4,3,0)_72%)]"
        aria-hidden="true"
      />

      <div
        ref={contentRef}
        data-hero-copy
        className="relative z-[2] flex flex-col items-center px-5 text-center"
        style={{ visibility: introDone || webglFailed ? "visible" : "hidden" }}
      >
        <p data-hero-line className="mb-6 font-mono text-[10px] uppercase tracking-[0.5em] text-[#e8a33d]/90 sm:text-xs">
          {profile.role}
        </p>

        <h1 className="font-display font-extrabold leading-[0.98] tracking-tight">
          <span data-hero-line className="block text-[13vw] text-white/95 sm:text-[9vw] lg:text-[7.2rem]">
            {profile.firstName}
          </span>
          <span
            data-hero-line
            className="text-gradient-gold block text-[13vw] sm:text-[9vw] lg:text-[7.2rem]"
          >
            {profile.lastName}
          </span>
        </h1>

        <p data-hero-line className="mt-8 max-w-md text-balance text-sm leading-relaxed text-white/60 sm:max-w-lg sm:text-base">
          {profile.tagline}
        </p>

        <div data-hero-fade className="mt-10 flex items-center gap-3">
          <span className="h-px w-8 bg-[#e8a33d]/50" aria-hidden="true" />
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/50">
            {profile.university}
          </p>
          <span className="h-px w-8 bg-[#e8a33d]/50" aria-hidden="true" />
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        data-scroll-cue
        className="absolute bottom-8 left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-3"
        style={{ opacity: introDone || webglFailed ? 1 : 0, transition: "opacity 1s ease 1.2s" }}
        aria-hidden="true"
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-white/40">Scroll</p>
        <div className="relative h-12 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute left-0 top-0 h-4 w-px bg-[#e8a33d]"
            animate={{ y: [-16, 48] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
