"use client";

import { create } from "zustand";

export type QualityTier = "high" | "medium" | "low";
export type ExperiencePhase = "loading" | "intro" | "ready";

interface ExperienceState {
  /** Preloader → intro sequence → ready (nav visible, scroll unlocked) */
  phase: ExperiencePhase;
  /** 0..1 asset load progress for the preloader */
  loadProgress: number;
  /** Chosen render quality tier (detected once on mount) */
  quality: QualityTier;
  /** WebGL could not be initialised — use static fallbacks */
  webglFailed: boolean;
  /** User prefers reduced motion — skip cinematic intro */
  reducedMotion: boolean;
  /** The particle→chip intro timeline has finished */
  introDone: boolean;

  setPhase: (p: ExperiencePhase) => void;
  setLoadProgress: (v: number) => void;
  setQuality: (q: QualityTier) => void;
  setWebglFailed: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  setIntroDone: (v: boolean) => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  phase: "loading",
  loadProgress: 0,
  quality: "high",
  webglFailed: false,
  reducedMotion: false,
  introDone: false,

  setPhase: (p) => set({ phase: p }),
  setLoadProgress: (v) => set({ loadProgress: v }),
  setQuality: (q) => set({ quality: q }),
  setWebglFailed: (v) => set({ webglFailed: v }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setIntroDone: (v) => set({ introDone: v }),
}));
