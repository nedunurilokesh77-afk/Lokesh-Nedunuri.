"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, profile } from "@/data/portfolio";
import { scrollToSection } from "@/lib/lenis";
import { useExperience } from "@/store/experience";

export default function Navbar() {
  const introDone = useExperience((s) => s.introDone);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    // Let the sheet close before scrolling on mobile
    setTimeout(() => scrollToSection(id), open ? 180 : 0);
  };

  return (
    <motion.header
      initial={false}
      animate={{
        y: introDone ? 0 : -72,
        opacity: introDone ? 1 : 0,
      }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "glass-panel border-b border-white/5" : "bg-transparent"
      }`}
    >
      {/* Scroll progress hairline */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-[#8a6a3a] via-[#e8a33d] to-[#ffd98a]"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
        aria-label="Primary"
      >
        <button
          onClick={() => go("hero")}
          className="group flex items-center gap-3"
          aria-label="Back to top"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#e8a33d]/30 bg-[#e8a33d]/10 font-display text-sm font-bold tracking-tight text-[#e8a33d] transition-all duration-300 group-hover:border-[#e8a33d]/60 group-hover:shadow-[0_0_18px_rgba(232,163,61,0.35)]">
            LN
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-[13px] font-semibold tracking-wide text-white/90">
              {profile.name}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">
              ECE · VIT-AP
            </span>
          </span>
        </button>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => go(l.id)}
                className="rounded px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 transition-colors duration-300 hover:text-[#ffd98a]"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e8a33d] shadow-[0_0_8px_rgba(232,163,61,0.9)]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
            Systems nominal
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-white/80 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={`overflow-hidden border-t border-white/5 transition-[max-height,opacity] duration-500 lg:hidden ${
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="glass-panel flex flex-col gap-1 px-5 py-4">
          {navLinks.map((l, i) => (
            <li key={l.id}>
              <button
                onClick={() => go(l.id)}
                className="flex w-full items-center justify-between rounded px-3 py-3 text-left transition-colors hover:bg-white/5"
              >
                <span className="font-display text-sm text-white/85">{l.label}</span>
                <span className="font-mono text-[9px] tracking-[0.3em] text-[#e8a33d]/60">
                  0{i + 1}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.header>
  );
}
