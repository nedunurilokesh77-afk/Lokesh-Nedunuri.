"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { projects } from "@/data/portfolio";

/**
 * Cinematic horizontal project gallery — pinned section, scrub-driven
 * translate with per-image parallax and depth transitions.
 */
export default function Projects() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 24),
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.75,
          invalidateOnRefresh: true,
        },
      });

      const cards = gsap.utils.toArray<HTMLElement>("[data-project-card]");
      cards.forEach((card) => {
        // Depth: card rises as it enters
        gsap.fromTo(
          card,
          { scale: 0.93, opacity: 0.5, y: 30 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 95%",
              end: "left 55%",
              scrub: true,
            },
          }
        );
        // Image parallax inside frame
        const img = card.querySelector("[data-project-img]");
        if (img) {
          gsap.fromTo(
            img,
            { xPercent: -7 },
            {
              xPercent: 7,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        }
      });
    }, wrapper);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} id="projects" className="relative h-[380vh]" aria-label="Projects">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(5,4,3,0.2),rgba(5,4,3,0.88))]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col justify-center">
          {/* Header */}
          <div className="mx-auto w-full max-w-7xl px-5 pt-20 sm:px-8">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 rule-glow" aria-hidden="true" />
              <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[#e8a33d]/80">
                {projects.eyebrow}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <h2 className="whitespace-pre-line font-display text-4xl font-bold leading-[1.04] tracking-tight text-white/95 sm:text-5xl">
                {projects.heading}
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-white/50">{projects.lead}</p>
            </div>
          </div>

          {/* Horizontal track */}
          <div className="mt-8 overflow-hidden pb-16">
            <div
              ref={trackRef}
              className="flex w-max items-stretch gap-6 px-[7vw] will-change-transform"
            >
              {projects.items.map((p) => (
                <article
                  key={p.id}
                  data-project-card
                  className="glass-panel group relative flex w-[82vw] flex-none flex-col overflow-hidden rounded-xl sm:w-[30rem] lg:w-[34rem]"
                >
                  <div className="pointer-events-none absolute right-5 top-4 z-10 font-display text-6xl font-extrabold leading-none text-white/[0.07]" aria-hidden="true">
                    {p.index}
                  </div>

                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div data-project-img className="absolute inset-[-9%]">
                      <Image
                        src={p.image}
                        alt={`Illustrative concept visual for ${p.title}; project status: ${p.subtitle}`}
                        fill
                        sizes="(max-width: 640px) 85vw, 34rem"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#0d0b0a] via-transparent to-transparent"
                      aria-hidden="true"
                    />
                    <span className="absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-[0.3em] text-[#ffd98a]/80">
                      {p.subtitle}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <h3 className="font-display text-xl font-bold text-white/95">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-white/55">{p.description}</p>
                    <ul className="mt-auto flex flex-wrap gap-2 pt-2">
                      {p.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded border border-[#e8a33d]/20 bg-[#e8a33d]/[0.06] px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-[#ffd98a]/85"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}

              <div className="flex w-[40vw] flex-none items-center justify-center">
                <p className="max-w-[11rem] text-center font-mono text-[10px] uppercase leading-loose tracking-[0.3em] text-white/30">
                  End of reel — more builds on the bench ↓
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
