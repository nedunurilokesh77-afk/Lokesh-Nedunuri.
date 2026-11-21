"use client";

import { useMemo, useState } from "react";

const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

const LED_TYPES = [
  { id: "red", label: "Red", vf: 1.8 },
  { id: "amber", label: "Amber", vf: 2.0 },
  { id: "green", label: "Green", vf: 2.1 },
  { id: "white", label: "White", vf: 3.0 },
] as const;

function formatOhms(r: number) {
  if (r >= 1e6) return `${(r / 1e6).toFixed(2)} MΩ`;
  if (r >= 1e3) return `${(r / 1e3).toFixed(r % 1000 === 0 ? 0 : 1)} kΩ`;
  return `${r.toFixed(0)} Ω`;
}

/** LED biasing calculator — pick a supply and current, get the real resistor. */
export function LEDBiasLab() {
  const [vs, setVs] = useState(5);
  const [ifMa, setIfMa] = useState(12);
  const [led, setLed] = useState<(typeof LED_TYPES)[number]["id"]>("amber");
  const vf = LED_TYPES.find((l) => l.id === led)!.vf;

  const calc = useMemo(() => {
    const headroom = vs - vf;
    if (headroom <= 0) return null;
    const rIdeal = headroom / (ifMa / 1000);
    let best = E12[0];
    let bestErr = Infinity;
    for (let d = 0; d <= 4; d++) {
      for (const base of E12) {
        const candidate = base * 10 ** d;
        const err = Math.abs(candidate - rIdeal);
        if (err < bestErr) {
          bestErr = err;
          best = candidate;
        }
      }
    }
    const iActual = (headroom / best) * 1000; // mA
    const power = (iActual / 1000) ** 2 * best; // W
    return { rIdeal, e12: best, iActual, power };
  }, [vs, vf, ifMa]);

  const brightness = calc ? Math.min(1, calc.iActual / 25) : 0;
  const overCurrent = calc ? calc.iActual > 25 : false;

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg font-bold text-white/90">LED Biasing Bench</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e8a33d]/80">
          Series resistor
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* The LED itself */}
        <div className="flex flex-col items-center gap-2">
          <span
            className="h-12 w-12 rounded-full transition-all duration-300"
            style={{
              background: calc
                ? `radial-gradient(circle at 40% 35%, #fff8e8, ${
                    led === "red" ? "#e85d3d" : led === "green" ? "#7dc46a" : led === "white" ? "#f5f0e4" : "#e8a33d"
                  } 45%, rgba(0,0,0,0.4) 90%)`
                : "radial-gradient(circle, rgba(255,255,255,0.12), rgba(0,0,0,0.4))",
              boxShadow: calc
                ? `0 0 ${(8 + brightness * 34).toFixed(0)}px rgba(232,163,61,${(0.25 + brightness * 0.65).toFixed(2)})`
                : "none",
            }}
            role="img"
            aria-label={`LED ${calc ? `glowing at ${brightness > 0.66 ? "high" : brightness > 0.33 ? "medium" : "low"} brightness` : "off"}`}
          />
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/35">
            {calc ? `${calc.iActual.toFixed(1)} mA` : "OFF"}
          </span>
        </div>

        {/* Readouts */}
        <div className="flex-1 space-y-1.5 font-mono text-[10px] tracking-[0.12em]">
          <p className="flex justify-between text-white/45">
            <span>E12 RESISTOR</span>
            <span className="text-[#ffd98a]">{calc ? formatOhms(calc.e12) : "—"}</span>
          </p>
          <p className="flex justify-between text-white/45">
            <span>IDEAL VALUE</span>
            <span className="text-white/70">{calc ? formatOhms(calc.rIdeal) : "—"}</span>
          </p>
          <p className="flex justify-between text-white/45">
            <span>RESISTOR POWER</span>
            <span className="text-white/70">{calc ? `${(calc.power * 1000).toFixed(0)} mW` : "—"}</span>
          </p>
        </div>
      </div>

      {overCurrent && (
        <p className="rounded border border-[#e85d3d]/40 bg-[#e85d3d]/10 px-3 py-2 font-mono text-[9px] tracking-[0.2em] text-[#ffb09a]">
          ⚠ OVER CURRENT — RESISTOR VALUE TOO LOW, RAISE Ω
        </p>
      )}
      {!calc && (
        <p className="rounded border border-white/15 bg-white/5 px-3 py-2 font-mono text-[9px] tracking-[0.2em] text-white/50">
          FORWARD VOLTAGE EXCEEDS SUPPLY — RAISE Vs
        </p>
      )}

      <div className="grid gap-3">
        <label className="flex flex-col gap-2">
          <span className="flex justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-white/45">
            Supply <span className="text-[#ffd98a]">{vs.toFixed(1)} V</span>
          </span>
          <input type="range" className="lab-slider" min={3} max={12} step={0.5} value={vs}
            onChange={(e) => setVs(Number(e.target.value))} aria-label="Supply voltage" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="flex justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-white/45">
            Target current <span className="text-[#ffd98a]">{ifMa} mA</span>
          </span>
          <input type="range" className="lab-slider" min={2} max={25} step={1} value={ifMa}
            onChange={(e) => setIfMa(Number(e.target.value))} aria-label="Target forward current in milliamps" />
        </label>
      </div>

      <div className="flex gap-2">
        {LED_TYPES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLed(l.id)}
            aria-pressed={led === l.id}
            className={`flex-1 rounded border px-2 py-2 font-mono text-[9px] uppercase tracking-[0.2em] transition-all duration-300 ${
              led === l.id
                ? "border-[#e8a33d]/50 bg-[#e8a33d]/10 text-[#ffd98a]"
                : "border-white/10 text-white/40 hover:border-white/25"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
