"use client";

import { useEffect } from "react";
import Image from "next/image";
import SceneCanvas from "@/components/webgl/SceneCanvas";
import Preloader from "@/components/experience/Preloader";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Interests from "@/components/sections/Interests";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Hackathons from "@/components/sections/Hackathons";
import Lab from "@/components/sections/Lab";
import Contact from "@/components/sections/Contact";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useExperience } from "@/store/experience";
import { heroFallbackImage } from "@/data/portfolio";
import { ScrollTrigger } from "@/lib/gsap";
import { lenisStore } from "@/lib/lenis";

export default function Home() {
  const phase = useExperience((s) => s.phase);
  const webglFailed = useExperience((s) => s.webglFailed);

  useSmoothScroll();

  // Reduced-motion detection
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    useExperience.getState().setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) =>
      useExperience.getState().setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lock scroll during loading & intro; unlock + refresh triggers once ready
  useEffect(() => {
    if (phase === "ready") {
      document.body.style.overflow = "";
      lenisStore.current?.start();
      // Let pinned layouts settle now that real scroll is possible
      requestAnimationFrame(() => ScrollTrigger.refresh());
      const t = setTimeout(() => ScrollTrigger.refresh(), 600);
      return () => clearTimeout(t);
    }
    document.body.style.overflow = "hidden";
    lenisStore.current?.stop();
  }, [phase]);

  // Recalculate pinned sections once assets are decoded
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Cinematic WebGL layer (fixed, behind content) */}
      <SceneCanvas />

      {/* Static fallback when WebGL is unavailable */}
      {webglFailed && (
        <div className="fixed inset-0 z-0" aria-hidden="true">
          <Image
            src={heroFallbackImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050403]/60 via-[#050403]/80 to-[#050403]" />
        </div>
      )}

      {/* Film grain + vignette */}
      <div className="grain-overlay" aria-hidden="true" />
      <div className="vignette-overlay" aria-hidden="true" />

      <Preloader />
      <Navbar />

      <main className="relative z-10 flex-1">
        <Hero />
        <About />
        <Interests />
        <Skills />
        <Projects />
        <Hackathons />
        <Lab />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
