"use client";

import { useEffect, useRef } from "react";

interface AmbientVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

/**
 * Lazy, battery-conscious ambient video:
 * muted, looping, plays only when on screen, pauses when scrolled away.
 */
export function AmbientVideo({ src, poster, className }: AmbientVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {
            /* autoplay blocked — poster remains */
          });
        } else {
          v.pause();
        }
      },
      { threshold: 0.18 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={className}
      aria-hidden="true"
    />
  );
}
