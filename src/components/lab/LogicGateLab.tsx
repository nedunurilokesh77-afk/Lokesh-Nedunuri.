"use client";

import { useState } from "react";

const GATES = [
  { id: "AND", fn: (a: boolean, b: boolean) => a && b, expr: "A · B" },
  { id: "OR", fn: (a: boolean, b: boolean) => a || b, expr: "A + B" },
  { id: "XOR", fn: (a: boolean, b: boolean) => a !== b, expr: "A ⊕ B" },
  { id: "NAND", fn: (a: boolean, b: boolean) => !(a && b), expr: "A · B" },
] as const;

/** Logic gate sandbox — flip the inputs, watch the lamps respond. */
export function LogicGateLab() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg font-bold text-white/90">Logic Gate Sandbox</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e8a33d]/80">
          A={a ? 1 : 0} B={b ? 1 : 0}
        </p>
      </div>

      {/* Inputs */}
      <div className="flex gap-3">
        {[
          { label: "A", v: a, set: setA },
          { label: "B", v: b, set: setB },
        ].map((sw) => (
          <button
            key={sw.label}
            onClick={() => sw.set(!sw.v)}
            aria-pressed={sw.v}
            aria-label={`Toggle input ${sw.label}`}
            className={`group flex flex-1 items-center justify-between rounded-lg border px-4 py-3 transition-all duration-300 ${
              sw.v
                ? "border-[#e8a33d]/60 bg-[#e8a33d]/12 shadow-[0_0_20px_rgba(232,163,61,0.2)]"
                : "border-white/10 bg-white/[0.03] hover:border-white/25"
            }`}
          >
            <span className={`font-display text-lg font-bold ${sw.v ? "text-[#ffd98a]" : "text-white/40"}`}>
              {sw.label}
            </span>
            <span className="relative flex h-6 w-11 items-center rounded-full border border-white/15 px-0.5">
              <span
                className={`h-4.5 w-4.5 h-[18px] w-[18px] rounded-full transition-all duration-300 ${
                  sw.v
                    ? "translate-x-[22px] bg-gradient-to-br from-[#ffd98a] to-[#c4743b] shadow-[0_0_10px_rgba(255,217,138,0.8)]"
                    : "translate-x-0 bg-white/25"
                }`}
              />
            </span>
          </button>
        ))}
      </div>

      {/* Gates */}
      <div className="grid grid-cols-2 gap-3">
        {GATES.map((g) => {
          const out = g.fn(a, b);
          return (
            <div
              key={g.id}
              className={`flex items-center justify-between rounded-lg border px-3.5 py-3 transition-all duration-300 ${
                out ? "border-[#e8a33d]/40 bg-[#e8a33d]/[0.06]" : "border-white/8 bg-white/[0.02]"
              }`}
            >
              <div>
                <p className={`font-mono text-xs font-bold tracking-[0.2em] ${out ? "text-[#ffd98a]" : "text-white/45"}`}>
                  {g.id}
                </p>
                <p className="mt-0.5 font-mono text-[9px] text-white/30">{g.expr}</p>
              </div>
              <span
                className={`relative flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
                  out
                    ? "bg-[#ffd98a] shadow-[0_0_14px_rgba(255,217,138,0.9),0_0_30px_rgba(232,163,61,0.45)]"
                    : "bg-white/12"
                }`}
                role="img"
                aria-label={`${g.id} output ${out ? "high" : "low"}`}
              >
                {out && <span className="h-1.5 w-1.5 rounded-full bg-[#3a2a10]" />}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-auto font-mono text-[9px] leading-relaxed tracking-[0.14em] text-white/40">
        COMBINATIONAL LOGIC — THE ATOMS OF EVERY PROCESSOR
      </p>
    </div>
  );
}
