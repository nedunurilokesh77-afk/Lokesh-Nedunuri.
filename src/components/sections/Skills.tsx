"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { skills } from "@/data/portfolio";

/**
 * Scroll drives a signal out of the LN core — five PCB traces illuminate
 * sequentially, activating each skill group as the current reaches it.
 */
export default function Skills() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const nodeRefs = useRef<Array<SVGGElement | null>>([]);
  const [active, setActive] = useState(-1);
  const progress = useRef({ p: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const n = skills.groups.length;

    const apply = (p: number) => {
      for (let i = 0; i < n; i++) {
        const tp = Math.min(1, Math.max(0, p * (n + 0.6) - i));
        const path = pathRefs.current[i];
        const node = nodeRefs.current[i];
        if (path) path.style.strokeDashoffset = String(1 - tp);
        if (node) node.style.opacity = String(tp);
      }
      const group = Math.min(n - 1, Math.floor(p * (n + 0.6) - 0.25));
      setActive(group);
    };

    if (mm.matches) {
      apply(1);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(progress.current, {
        p: 1,
        ease: "none",
        onUpdate: function () {
          apply(this.progress());
        },
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });
    }, wrapper);
    return () => ctx.revert();
  }, []);

  // Manhattan-style traces from the core to each discipline node
  const targets = [
    { x: 105, y: 130 },
    { x: 348, y: 96 },
    { x: 852, y: 96 },
    { x: 1095, y: 130 },
    { x: 600, y: 414 },
  ];

  const buildPath = (t: { x: number; y: number }) => {
    const cx = 600;
    const cy = 246;
    const dx = t.x - cx;
    const dy = t.y - cy;
    // Route horizontally first, then a clean 45° diagonal into the node
    const diag = Math.abs(dy);
    const dirX = Math.sign(dx) || 1;
    const midX = cx + dx - dirX * diag;
    return `M ${cx} ${cy} H ${midX} L ${t.x} ${t.y}`;
  };

  return (
    <div ref={wrapperRef} id="skills" className="relative h-[300vh]" aria-label="Skills">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_55%_at_50%_50%,rgba(5,4,3,0.35),rgba(5,4,3,0.9))]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 rule-glow" aria-hidden="true" />
            <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[#e8a33d]/80">
              {skills.eyebrow}
            </p>
          </div>
          <h2 className="mt-4 whitespace-pre-line font-display text-4xl font-bold leading-[1.04] tracking-tight text-white/95 sm:text-5xl">
            {skills.heading}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
            {skills.lead}
          </p>

          {/* Circuit canvas */}
          <svg
            viewBox="0 0 1200 480"
            className="mt-8 h-32 w-full sm:h-48 lg:h-56"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="trace-glow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Dim underlay routes */}
            {targets.map((t, i) => (
              <path key={`u${i}`} d={buildPath(t)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
            ))}

            {/* Energised traces */}
            {targets.map((t, i) => (
              <path
                key={`t${i}`}
                ref={(el) => {
                  pathRefs.current[i] = el;
                }}
                d={buildPath(t)}
                fill="none"
                stroke="#e8a33d"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1}
                filter="url(#trace-glow)"
              />
            ))}

            {/* Core node */}
            <g>
              <circle cx="600" cy="246" r="34" fill="#0d0b0a" stroke="#e8a33d" strokeWidth="1.5" />
              <circle cx="600" cy="246" r="46" fill="none" stroke="#e8a33d" strokeOpacity="0.25" strokeWidth="1">
                <animate attributeName="r" values="40;52;40" dur="3s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.25;0.05;0.25" dur="3s" repeatCount="indefinite" />
              </circle>
              <text
                x="600"
                y="251"
                textAnchor="middle"
                className="fill-[#ffd98a] font-mono"
                fontSize="13"
                letterSpacing="2"
              >
                LN
              </text>
            </g>

            {/* Discipline nodes */}
            {targets.map((t, i) => (
              <g
                key={`n${i}`}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                style={{ opacity: 0 }}
              >
                <circle cx={t.x} cy={t.y} r="7" fill="#e8a33d" filter="url(#trace-glow)" />
                <circle cx={t.x} cy={t.y} r="13" fill="none" stroke="#e8a33d" strokeOpacity="0.4" strokeWidth="1" />
              </g>
            ))}
          </svg>

          {/* Skill groups */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {skills.groups.map((g, i) => {
              const isActive = active >= i;
              return (
                <div
                  key={g.id}
                  className={`rounded-lg border p-4 transition-all duration-700 ${
                    isActive
                      ? "border-[#e8a33d]/45 bg-[#e8a33d]/[0.07] shadow-[0_0_28px_rgba(232,163,61,0.14)]"
                      : "border-white/8 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`font-mono text-[8px] tracking-[0.3em] ${isActive ? "text-[#e8a33d]" : "text-white/30"}`}>
                      {g.trace}
                    </p>
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                        isActive
                          ? "bg-[#ffd98a] shadow-[0_0_10px_rgba(255,217,138,0.9)]"
                          : "bg-white/15"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className={`mt-2 font-display text-[13px] font-bold transition-colors duration-500 ${isActive ? "text-white/95" : "text-white/55"}`}>
                    {g.title}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {g.items.map((item) => (
                      <li
                        key={item}
                        className={`rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-wide transition-colors duration-500 ${
                          isActive
                            ? "border-[#e8a33d]/25 text-white/70"
                            : "border-white/8 text-white/35"
                        }`}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
