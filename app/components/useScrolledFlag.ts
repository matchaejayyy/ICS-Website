"use client";

import { useEffect, type RefObject } from "react";

// data-scrolled flag
export function useScrolledFlag(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let scrolled = false;
    const update = () => {
      const next = scrolled ? window.scrollY > 8 : window.scrollY > 32;
      if (next === scrolled) return;
      scrolled = next;
      el.dataset.scrolled = String(next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [ref]);
}
