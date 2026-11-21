"use client";

import { useEffect, useRef, useState } from "react";

/**
 * RC low-pass filter explorer — drag R and C, watch the cutoff move
 * on the Bode response and see the phase lag in the time domain.
 */
export function RCFilterLab() {
  const [rk, setRk] = useState(10); // kΩ
  const [cn, setCn] = useState(100); // nF
  const responseRef = useRef<HTMLCanvasElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ fc: 0, gain: 0, phase: 0 });

  const fc = 159155 / (rk * cn); // Hz
  const fcLabel = fc >= 1000 ? `${(fc / 1000).toFixed(2)} kHz` : `${fc.toFixed(0)} Hz`;
  const TEST_F = 1200; // probe tone

  // Keep live params accessible inside the animation loop without re-subscribing
  useEffect(() => {
    const gain = 1 / Math.sqrt(1 + (TEST_F / fc) ** 2);
    const phase = -Math.atan(TEST_F / fc);
    params.current = { fc, gain, phase };
  }, [fc]);

  // Bode magnitude response (redraws on parameter change)
  useEffect(() => {
    const canvas = responseRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);
    const fMin = 10, fMax = 1e6;
    const lx = (f: number) => (Math.log10(f) - Math.log10(fMin)) / (Math.log10(fMax) - Math.log10(fMin));
    const ly = (db: number) => (db / -50) * (h - 24) + 6; // 0dB top → -50dB bottom

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "9px monospace";
    ctx.lineWidth = 1;
    [10, 100, 1000, 1e4, 1e5, 1e6].forEach((f) => {
      const x = lx(f) * (w - 36) + 30;
      ctx.beginPath();
      ctx.moveTo(x, 6);
      ctx.lineTo(x, h - 6);
      ctx.stroke();
      const label = f >= 1000 ? `${f / 1000}k` : `${f}`;
      ctx.fillText(label, x - 6, h - 12);
    });
    [0, -10, -20, -30, -40, -50].forEach((db) => {
      const y = ly(db);
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(w - 6, y);
      ctx.stroke();
      ctx.fillText(`${db}`, 4, y + 3);
    });

    // -3 dB reference
    ctx.strokeStyle = "rgba(232,163,61,0.35)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, ly(-3));
    ctx.lineTo(w - 6, ly(-3));
    ctx.stroke();
    ctx.setLineDash([]);

    // Response curve
    ctx.strokeStyle = "#e8a33d";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(232,163,61,0.6)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let px = 0; px <= w - 36; px += 2) {
      const f = 10 ** (Math.log10(fMin) + (px / (w - 36)) * (Math.log10(fMax) - Math.log10(fMin)));
      const db = -10 * Math.log10(1 + (f / fc) ** 2);
      const x = px + 30;
      const y = ly(Math.max(-50, db));
      if (px === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Cutoff marker
    const cx = lx(fc) * (w - 36) + 30;
    if (cx > 30 && cx < w - 6) {
      ctx.strokeStyle = "#ffd98a";
      ctx.beginPath();
      ctx.moveTo(cx, 6);
      ctx.lineTo(cx, h - 6);
      ctx.stroke();
    }
  }, [fc]);

  // Time-domain: input vs filtered output (animated)
  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      const amp = h * 0.32;
      const cycles = 3;

      // Input
      ctx.strokeStyle = "rgba(255,243,214,0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const ph = (x / w) * cycles * Math.PI * 2;
        const y = mid - Math.sin(ph + t * 4) * amp;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Output (attenuated + phase shifted)
      const { gain: g, phase: ph0 } = params.current;
      ctx.strokeStyle = "rgba(232,163,61,0.9)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(232,163,61,0.7)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const ph = (x / w) * cycles * Math.PI * 2;
        const y = mid - Math.sin(ph + t * 4 + ph0) * amp * g;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const TEST_F_CONST = 1200;
  const gainNow = 1 / Math.sqrt(1 + (TEST_F_CONST / fc) ** 2);
  const phaseNow = -Math.atan(TEST_F_CONST / fc);

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg font-bold text-white/90">RC Low-Pass Filter</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e8a33d]/80">
          fc ≈ {fcLabel}
        </p>
      </div>

      <canvas ref={responseRef} className="h-36 w-full rounded-md border border-white/8 bg-black/30" aria-label="Filter frequency response graph" />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="flex justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-white/45">
            Resistance <span className="text-[#ffd98a]">{rk} kΩ</span>
          </span>
          <input type="range" className="lab-slider" min={1} max={100} step={1} value={rk}
            onChange={(e) => setRk(Number(e.target.value))} aria-label="Resistance in kiloohms" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="flex justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-white/45">
            Capacitance <span className="text-[#ffd98a]">{cn} nF</span>
          </span>
          <input type="range" className="lab-slider" min={1} max={1000} step={1} value={cn}
            onChange={(e) => setCn(Number(e.target.value))} aria-label="Capacitance in nanofarads" />
        </label>
      </div>

      <canvas ref={waveRef} className="h-24 w-full rounded-md border border-white/8 bg-black/30" aria-label="Input and filtered output waveforms" />
      <p className="font-mono text-[9px] leading-relaxed tracking-[0.14em] text-white/40">
        PROBE @ {(TEST_F_CONST / 1000).toFixed(1)} kHz — GAIN {(20 * Math.log10(Math.max(gainNow, 1e-4))).toFixed(1)} dB · PHASE {((phaseNow * 180) / Math.PI).toFixed(0)}°
      </p>
    </div>
  );
}
