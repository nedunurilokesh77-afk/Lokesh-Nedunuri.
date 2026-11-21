"use client";

import Lenis from "lenis";

/** Module-level Lenis holder so navbar/scroll-cue can trigger smooth scrolls */
export const lenisStore: { current: Lenis | null } = { current: null };

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenisStore.current) {
    lenisStore.current.scrollTo(target, { duration: 1.4, offset: -8 });
  } else {
    target.scrollIntoView({ behavior: "smooth" });
  }
}
