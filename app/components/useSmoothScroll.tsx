"use client";

import { useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

/** Moves immediately, then settles softly. */
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Smooth wheel scrolling, driven by GSAP's ticker so it stays in step with ScrollTrigger.
 * The ref stays null until mounted, and always with reduced motion (native scrolling).
 */
export function useSmoothScroll(): RefObject<Lenis | null> {
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    ref.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP default
      lenis.destroy();
      ref.current = null;
    };
  }, []);

  return ref;
}
