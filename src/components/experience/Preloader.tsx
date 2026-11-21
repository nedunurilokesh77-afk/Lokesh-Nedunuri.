"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/store/experience";

/**
 * Cinematic preloader: monospaced progress readout + hairline loader.
 * Hands over to the intro sequence once assets settle.
 */
export default function Preloader() {
  const loadProgress = useExperience((s) => s.loadProgress);
  const phase = useExperience((s) => s.phase);
  const webglFailed = useExperience((s) => s.webglFailed);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const setPhase = useExperience((s) => s.setPhase);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const handed = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  // Hand over: assets loaded + minimum display time honoured
  useEffect(() => {
    if (handed.current) return;
    if (loadProgress >= 1 && minTimeDone) {
      handed.current = true;
      // Small pause so the 100% readout registers before the reveal
      setTimeout(() => {
        if (webglFailed || reducedMotion) {
          useExperience.getState().setIntroDone(true);
          setPhase("ready");
        } else {
          setPhase("intro");
        }
        // Fade the overlay out after the phase switch
        setTimeout(() => setHidden(true), 900);
      }, 350);
    }
  }, [loadProgress, minTimeDone, webglFailed, reducedMotion, setPhase]);

  if (hidden) return null;

  const pct = Math.round(loadProgress * 100);
  const leaving = phase !== "loading";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050403] transition-opacity duration-700 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading portfolio"
    >
      <div className="flex flex-col items-center gap-8 px-6">
        <p className="font-mono text-[10px] tracking-[0.5em] text-[#8a6a3a] uppercase">
          Initialising experience
        </p>
        <div className="h-px w-56 overflow-hidden bg-white/10 sm:w-72">
          <div
            className="h-full bg-gradient-to-r from-[#8a6a3a] via-[#e8a33d] to-[#ffd98a] transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="font-mono text-xs tracking-[0.35em] text-[#e8a33d]/90 tabular-nums">
          {String(pct).padStart(3, "0")}%
        </p>
        <p className="max-w-xs text-center font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
          Compiling particles · Calibrating silicon · Focus locked
        </p>
      </div>
    </div>
  );
}
