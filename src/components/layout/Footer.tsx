"use client";

import { ArrowUp } from "lucide-react";
import { profile } from "@/data/portfolio";
import { scrollToSection } from "@/lib/lenis";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-white/5 bg-[#070605]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 pb-10 sm:flex-row sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded border border-[#e8a33d]/30 bg-[#e8a33d]/10 font-display text-xs font-bold text-[#e8a33d]">
            LN
          </span>
          <div className="leading-tight">
            <p className="font-display text-xs font-semibold text-white/80">
              {profile.name}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/35">
              {profile.role}
            </p>
          </div>
        </div>

        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 text-center">
          © {new Date().getFullYear()} — Crafted with precision · Exploring technology
        </p>

        <button
          onClick={() => scrollToSection("hero")}
          className="group flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 font-mono text-[9px] uppercase tracking-[0.3em] text-white/50 transition-all duration-300 hover:border-[#e8a33d]/50 hover:text-[#ffd98a]"
          aria-label="Back to top"
        >
          Reboot
          <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </footer>
  );
}
