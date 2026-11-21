"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { Reveal, SectionShell } from "@/components/experience/SectionShell";
import { about } from "@/data/portfolio";

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Image parallax — the photograph drifts as the section scrolls
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-parallax-img]",
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.7 },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative py-28 sm:py-36">
      <SectionShell id="about" eyebrow={about.eyebrow} heading={about.heading}>
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.85fr] lg:gap-16">
          {/* Narrative */}
          <div className="flex flex-col justify-between gap-10">
            <div className="space-y-6">
              {about.paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p className="text-[15px] leading-[1.85] text-white/60 sm:text-base">{p}</p>
                </Reveal>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 sm:grid-cols-4">
              {about.stats.map((s, i) => (
                <Reveal key={s.label} delay={0.1 + i * 0.07} className="bg-[#0d0b0a]">
                  <div className="flex h-full flex-col justify-center gap-2 p-5">
                    <p className="font-display text-sm font-bold text-[#e8a33d]">{s.value}</p>
                    <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-white/40">
                      {s.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Portrait composition */}
          <Reveal delay={0.15}>
            <figure className="group relative">
              <div
                className="absolute -inset-3 rounded-xl border border-[#e8a33d]/15 transition-colors duration-500 group-hover:border-[#e8a33d]/35"
                aria-hidden="true"
              />
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                <div data-parallax-img className="absolute inset-[-8%]">
                  <Image
                    src={about.image}
                    alt="Illustrative close-up of an electronics workbench and circuit board under warm task lighting"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#050403]/75 via-transparent to-transparent"
                  aria-hidden="true"
                />
                <figcaption className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <span className="h-px w-6 rule-glow" aria-hidden="true" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/55">
                    {about.imageCaption}
                  </span>
                </figcaption>
              </div>
            </figure>
          </Reveal>
        </div>
      </SectionShell>
    </div>
  );
}
