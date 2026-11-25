"use client";

import { useEffect, type RefObject } from "react";

/** Sets `data-scrolled` on the element; the two thresholds keep it from flickering near the top. */
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
