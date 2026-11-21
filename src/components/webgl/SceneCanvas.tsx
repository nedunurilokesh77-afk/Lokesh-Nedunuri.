"use client";

import { useEffect, useRef } from "react";
import { PortfolioScene } from "@/lib/three/PortfolioScene";
import { useExperience } from "@/store/experience";

/**
 * Fixed full-viewport WebGL canvas hosting the cinematic engine.
 * Detects device tier once, loads assets, then hands control to the
 * preloader → intro → ready state machine.
 */
export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<PortfolioScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let scene: PortfolioScene | null = null;

    // Detect quality tier once
    const store = useExperience.getState();
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || store.reducedMotion;
    store.setReducedMotion(reduced);

    const isMobileUA = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    const tier = isMobileUA || window.innerWidth < 768 || cores <= 4
      ? "low"
      : window.innerWidth < 1280 || cores <= 8
        ? "medium"
        : "high";
    store.setQuality(tier);

    // WebGL support check
    let webglOk = false;
    try {
      const test = document.createElement("canvas");
      webglOk = !!(test.getContext("webgl2") || test.getContext("webgl"));
    } catch {
      webglOk = false;
    }

    if (!webglOk) {
      store.setWebglFailed(true);
      store.setLoadProgress(1);
      return;
    }

    try {
      scene = new PortfolioScene(canvas, tier, reduced);
    } catch (err) {
      console.error("WebGL init failed:", err);
      store.setWebglFailed(true);
      store.setLoadProgress(1);
      return;
    }
    sceneRef.current = scene;

    // Scroll provider — polled by the engine each frame
    scene.scrollProvider = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    };

    const onPointer = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      scene?.setPointer(nx, ny);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const onResize = () => scene?.resize();
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      if (document.hidden) scene?.pause();
      else scene?.resume();
    };
    document.addEventListener("visibilitychange", onVisibility);

    scene.load((v) => {
      if (!disposed) useExperience.getState().setLoadProgress(v);
    }).then(() => {
      if (disposed) return;
      useExperience.getState().setLoadProgress(1);
      scene?.start();
    });

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Kick off the intro once the preloader hands over (phase → intro)
  const phase = useExperience((s) => s.phase);
  const introStarted = useRef(false);
  useEffect(() => {
    if (phase === "intro" && !introStarted.current) {
      introStarted.current = true;
      sceneRef.current?.startIntro(() => {
        const s = useExperience.getState();
        s.setIntroDone(true);
        s.setPhase("ready");
      });
    }
  }, [phase]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
