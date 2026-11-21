"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Zap, Flag } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { Reveal, SectionShell } from "@/components/experience/SectionShell";
import { hackathons } from "@/data/portfolio";

export default function Hackathons() {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Travelling signal energises the rail as the user scrolls
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-rail-fill]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 72%", end: "bottom 55%", scrub: 0.6 },
        }
      );
      gsap.fromTo(
        "[data-rail-pulse]",
        { top: "0%" },
        {
          top: "100%",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 72%", end: "bottom 55%", scrub: 0.6 },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const featured = hackathons.timeline[0];

  return (
    <div className="relative py-28 sm:py-36">
      <SectionShell id="hackathons" eyebrow={hackathons.eyebrow} heading={hackathons.heading} lead={hackathons.lead}>
        <div ref={timelineRef} className="relative mt-6">
          {/* Rail */}
          <div className="absolute bottom-2 left-[9px] top-2 w-px bg-white/8 md:left-1/2" aria-hidden="true" />
          <div
            data-rail-fill
            className="absolute bottom-2 left-[9px] top-2 w-px origin-top bg-gradient-to-b from-[#8a6a3a] via-[#e8a33d] to-[#ffd98a] shadow-[0_0_12px_rgba(232,163,61,0.6)] md:left-1/2"
            aria-hidden="true"
          />
          <div
            data-rail-pulse
            className="absolute left-[9px] h-2.5 w-2.5 -translate-x-[4px] rounded-full bg-[#ffd98a] shadow-[0_0_16px_rgba(255,217,138,0.95),0_0_36px_rgba(232,163,61,0.5)] md:left-1/2"
            aria-hidden="true"
          />

          <ol className="space-y-16">
            {/* Featured — Megathon */}
            <li className="relative md:grid md:grid-cols-2 md:gap-14">
              <span
                className="absolute left-[9px] top-8 h-3 w-3 -translate-x-[5px] rounded-full border-2 border-[#e8a33d] bg-[#0d0b0a] shadow-[0_0_14px_rgba(232,163,61,0.7)] md:left-1/2"
                aria-hidden="true"
              />
              <Reveal className="md:pt-6 md:pr-14 md:text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#e8a33d]/80">
                  {featured.org}
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold text-white/95 sm:text-4xl">
                  {featured.title}
                </h3>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#e8a33d]/35 bg-[#e8a33d]/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-[#ffd98a]">
                  <Flag className="h-3 w-3" /> {featured.tag}
                </span>
              </Reveal>

              <Reveal delay={0.12} className="mt-6 md:mt-0 md:pl-14">
                <article className="glass-panel group overflow-hidden rounded-xl">
                  <div className="relative aspect-[16/7] overflow-hidden">
                    <Image
                      src="/assets/images/pcb-detail.webp"
                      alt="Illustrative close-up of a circuit board, used as a visual for the Megathon experience"
                      fill
                      sizes="(max-width: 768px) 100vw, 42vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b0a] to-transparent" aria-hidden="true" />
                  </div>
                  <div className="p-6">
                    <p className="text-sm leading-relaxed text-white/60">{featured.description}</p>
                    <ul className="mt-4 space-y-2.5">
                      {featured.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-3 text-[13px] text-white/65">
                          <Zap className="h-3.5 w-3.5 flex-none text-[#e8a33d]" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            </li>

          </ol>
        </div>
      </SectionShell>
    </div>
  );
}
