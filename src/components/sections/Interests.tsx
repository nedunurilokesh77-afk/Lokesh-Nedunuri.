"use client";

import { useEffect, useRef } from "react";
import {
  AudioWaveform,
  CircuitBoard,
  Cpu,
  Network,
  RadioTower,
  type LucideIcon,
} from "lucide-react";
import { gsap } from "@/lib/gsap";
import { interests } from "@/data/portfolio";
import { sectionBackgrounds } from "@/data/portfolio";
import { AmbientVideo } from "@/components/experience/AmbientVideo";

const ICONS: Record<string, LucideIcon> = {
  Cpu,
  CircuitBoard,
  AudioWaveform,
  RadioTower,
  Network,
};

export default function Interests() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Pinned horizontal journey across the board
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mm.matches) return;

    const ctx = gsap.context(() => {
      const getX = () => -(track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: getX,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      // Depth transitions per card as they cross the viewport
      const cards = gsap.utils.toArray<HTMLElement>("[data-interest-card]");
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { scale: 0.94, opacity: 0.55 },
          {
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 88%",
              end: "left 45%",
              scrub: true,
            },
          }
        );
      });
    }, wrapper);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} id="interests" className="relative h-[340vh]" aria-label="Interests">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Ambient circuit footage behind the journey */}
        <AmbientVideo
          src={sectionBackgrounds.interestsVideo}
          poster={sectionBackgrounds.interestsPoster}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#050403]/85 via-[#050403]/45 to-[#050403]/95"
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col justify-center">
          {/* Header */}
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 rule-glow" aria-hidden="true" />
              <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[#e8a33d]/80">
                {interests.eyebrow}
              </p>
            </div>
            <h2 className="mt-4 whitespace-pre-line font-display text-4xl font-bold leading-[1.04] tracking-tight text-white/95 sm:text-5xl">
              {interests.heading}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
              {interests.lead}
            </p>
          </div>

          {/* Horizontal track */}
          <div className="mt-10 overflow-hidden">
            <div ref={trackRef} className="flex w-max items-stretch gap-6 px-[6vw] will-change-transform">
              {interests.items.map((item) => {
                const Icon = ICONS[item.icon] ?? Cpu;
                return (
                  <article
                    key={item.id}
                    data-interest-card
                    className="glass-panel relative flex w-[80vw] flex-none flex-col justify-between gap-6 rounded-xl p-7 sm:w-[24rem] lg:w-[26rem]"
                  >
                    <div className="pointer-events-none absolute -right-2 -top-6 font-display text-[5.5rem] font-extrabold leading-none text-white/[0.045]" aria-hidden="true">
                      {item.index}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#e8a33d]/25 bg-[#e8a33d]/10">
                        <Icon className="h-5 w-5 text-[#e8a33d]" strokeWidth={1.6} />
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.3em] text-white/30">
                        {item.index} / 05
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white/90">{item.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/55">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-px flex-1 bg-gradient-to-r from-[#e8a33d]/40 to-transparent" aria-hidden="true" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e8a33d] shadow-[0_0_10px_rgba(232,163,61,0.8)]" aria-hidden="true" />
                    </div>
                  </article>
                );
              })}

              {/* Terminal card */}
              <div className="flex w-[60vw] flex-none items-center justify-center sm:w-[18rem]">
                <p className="max-w-[12rem] text-center font-mono text-[10px] uppercase leading-loose tracking-[0.3em] text-white/30">
                  Signal continues ↓
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
