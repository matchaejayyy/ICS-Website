"use client";

import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  ViewTransition,
  type CSSProperties,
} from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import Navbar from "./components/Navbar";
import Preloader, { EXIT } from "./components/Preloader";
import { easeOutQuart, useSmoothScroll } from "./components/useSmoothScroll";
import { hasBooted, markBooted } from "./components/site-boot";
import { THEMES, type Mode } from "./components/ui";
import { LINKS, NAV, ORG } from "./data/org";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

const HERO_MASCOT = {
  src: "/comp_stud.png",
  alt: "Computah Cat, the society mascot: a TV-headed character with an orange cat resting on top",
};

// heading lines
const HERO_LINES = (() => {
  const w = ORG.name.trim().split(/\s+/);
  if (w.length < 3) return [ORG.name, "", ""];
  return [w.slice(0, -2).join(" "), w[w.length - 2], w[w.length - 1]];
})();

// preloader morph targets (polygon %)
const PANEL_SHAPE = "0 0, 100 0, 100 100, 0 100"; // desktop
const BAND_SHAPE = "0 16, 100 0, 100 84, 0 100"; // mobile
const polygon = (shape: string) =>
  `polygon(${shape
    .split(",")
    .map((p) => p.trim().split(" ").map((n) => `${n}%`).join(" "))
    .join(",")})`;

// [left, top, size in px]
const PARTICLES: [string, string, number][] = [
  ["10%", "16%", 6], ["32%", "8%", 4], ["78%", "12%", 5], ["90%", "38%", 4],
  ["18%", "62%", 5], ["64%", "84%", 6], ["86%", "70%", 4], ["44%", "92%", 4],
];

// theme store
const THEME_KEY = "persona-theme";
const themeListeners = new Set<() => void>();
let memoryMode: Mode | null = null; // storage fallback
const readMode = (): Mode => {
  if (memoryMode) return memoryMode;
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};
const writeMode = (next: Mode) => {
  memoryMode = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // storage unavailable
  }
  themeListeners.forEach((l) => l());
};
const subscribeMode = (l: () => void) => {
  themeListeners.add(l);
  return () => {
    themeListeners.delete(l);
  };
};

// hero pin
function HeroPin({ src, tilt, className = "" }: { src: string; tilt: string; className?: string }) {
  return (
    <div className={`hero-depth hero-chip pointer-events-none absolute z-10 ${className}`} data-depth="16">
      <div className="chip-float">
        <Image
          src={src}
          alt=""
          width={176}
          height={176}
          sizes="(min-width: 1280px) 11rem, 9rem"
          className={`${tilt} size-36 max-w-none rounded-full drop-shadow-[4px_4px_0_#171024] xl:size-44`}
        />
      </div>
    </div>
  );
}

export default function Page() {
  const [loaded, setLoaded] = useState(hasBooted);
  const [preloaderGone, setPreloaderGone] = useState(hasBooted);
  const [active, setActive] = useState<string>("home");
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "dark" as Mode);

  const lenisRef = useSmoothScroll();

  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroTlRef = useRef<gsap.core.Timeline | null>(null);
  const scrollLockRef = useRef(false);
  const scrollTokenRef = useRef(0);
  const syncActiveRef = useRef<() => void>(() => { });

  useEffect(markBooted, []);

  // hero mouse parallax
  useEffect(() => {
    const hero = rootRef.current?.querySelector<HTMLElement>("#home");
    const off = window.matchMedia(
      "(prefers-reduced-motion: reduce), (pointer: coarse), (max-width: 767px)"
    ).matches;
    if (!hero || off) return;

    const opts = { duration: 0.8, ease: "power3.out" };
    const items = gsap.utils.toArray<HTMLElement>(".hero-depth", hero).map((el) => ({
      el,
      d: Number(el.dataset.depth ?? 10),
      x: gsap.quickTo(el, "x", opts),
      y: gsap.quickTo(el, "y", opts),
    }));

    const move = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      items.forEach((i) => {
        i.x(-nx * i.d * 2);
        i.y(-ny * i.d * 2);
      });
    };
    const leave = () =>
      items.forEach((i) => {
        i.x(0);
        i.y(0);
      });

    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", leave);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(items.map((i) => i.el), "x,y");
    };
  }, []);

  // preloader hand-off
  useEffect(() => {
    if (!loaded) {
      const lenis = lenisRef.current;
      lenis?.stop();
      return () => lenis?.start();
    }

    ScrollTrigger.refresh();
    lenisRef.current?.resize();
    heroTlRef.current?.play(0);
  }, [loaded, lenisRef]);

  const scrollToSection = (id: string, updateHistory = true) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (updateHistory && window.location.hash !== `#${id}`) {
      History.prototype.replaceState.call(window.history, window.history.state, "", `#${id}`);
    }

    const offset = headerRef.current?.getBoundingClientRect().height ?? 0;
    const top = Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0);
    gsap.killTweensOf(window, "scrollTo");

    // scroll-spy lock
    const token = ++scrollTokenRef.current;
    const release = () => {
      if (scrollTokenRef.current !== token) return;
      scrollLockRef.current = false;
      syncActiveRef.current();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, top);
      scrollLockRef.current = false;
      return;
    }

    scrollLockRef.current = true;
    const distance = Math.abs(top - window.scrollY);
    const duration = gsap.utils.clamp(0.6, 1.2, 0.5 + distance / 4000);

    const lenis = lenisRef.current;
    if (lenis) {
      const onWheel = () => stop();
      const onKey = (e: KeyboardEvent) => {
        if (SCROLL_KEYS.has(e.key)) stop();
      };
      const stop = () => {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onWheel);
        window.removeEventListener("keydown", onKey);
        release();
      };
      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("touchstart", onWheel, { passive: true });
      window.addEventListener("keydown", onKey);
      lenis.scrollTo(top, { duration, easing: easeOutQuart, lock: false, onComplete: stop });
      return;
    }

    gsap.to(window, {
      duration,
      scrollTo: { y: top, autoKill: true, onAutoKill: release },
      ease: "power3.out",
      overwrite: "auto",
      onComplete: release,
      onInterrupt: release,
    });
  };

  const go = (id: string) => {
    setActive(id);
    scrollToSection(id);
  };

  const { contextSafe } = useGSAP(
    (_ctx, safe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const small = window.matchMedia("(max-width: 767px)").matches;

      // idle loops
      const loops: gsap.core.Animation[] = [];

      const startMascotLoop = safe!(() => {
        loops.push(
          gsap.fromTo(
            ".mascot-float",
            { y: 0, rotation: -0.6 },
            { y: -8, rotation: 0.6, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 }
          )
        );
      });

      const startAmbientLoops = safe!(() => {
        loops.push(
          gsap.to(".chip-float", {
            y: (i: number) => (i % 2 ? -6 : 6),
            rotation: (i: number) => (i % 2 ? 0.8 : -0.8),
            duration: () => gsap.utils.random(3, 4),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: { each: 0.4, from: "random" },
          }),
          gsap.to(".particle", {
            y: -10,
            x: (i: number) => (i % 2 ? 4 : -4),
            opacity: 0.4,
            duration: () => gsap.utils.random(3, 5),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: { each: 0.2, from: "random" },
          }),
          gsap.to(".hero-glow", { scale: 1.06, opacity: 0.8, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 })
        );
      });

      // hero intro
      const intro = !!document.querySelector(".preloader");
      const at = (t: number) => (intro ? t : Math.max(0, t - 0.35));
      const heroTimeline = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .add(startAmbientLoops, 0);
      if (intro) {
        heroTimeline
          .from(".nav-item", { y: -8, opacity: 0, duration: 0.5, stagger: 0.05, clearProps: "transform,opacity" }, 0.3)
          .from(
            ".nav-actions > *",
            { y: -8, opacity: 0, duration: 0.5, stagger: 0.06, clearProps: "transform,opacity" },
            0.5
          )
          .from(".nav-handle", { x: -10, opacity: 0, duration: 0.5 }, EXIT.logo - 0.1);
      } else {
        heroTimeline.from(".hero-panel", { xPercent: 8, opacity: 0, duration: 0.9 }, 0);
      }
      heroTimeline
        .from(".hero-code", { opacity: 0, duration: 1.2, ease: "power2.out" }, at(0.25))
        .from(".hero-tag", { y: 10, opacity: 0, duration: 0.6 }, at(0.35))
        .from(".hero-copy h1", { x: -24, opacity: 0, duration: 0.9 }, at(0.42))
        .from(".hero-card", { y: 16, opacity: 0, duration: 0.7 }, at(0.56))
        .from(
          ".hero-cta > *",
          { y: 14, opacity: 0, duration: 0.6, stagger: 0.08, clearProps: "transform,opacity" },
          at(0.66)
        )
        .from(".mascot-enter", { y: 20, scale: 0.97, opacity: 0, duration: 0.9 }, at(EXIT.morph))
        .from(".hero-decor", { opacity: 0, duration: 1, ease: "power2.out" }, at(EXIT.morph))
        .from(".hero-chip", { y: 8, opacity: 0, scale: 0.92, duration: 0.7, stagger: 0.1 }, at(EXIT.morph + 0.1))
        .add(startMascotLoop, at(EXIT.morph + 0.6));
      heroTlRef.current = heroTimeline;

      ScrollTrigger.create({
        trigger: "#home",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => loops.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });

      const hero = { trigger: "#home", start: "top top", end: "bottom top", scrub: true };
      if (!small) {
        gsap.to(".hero-copy", { y: -20, ease: "none", scrollTrigger: hero });
        gsap.to(".mascot-drift", { yPercent: -4, scale: 0.98, ease: "none", scrollTrigger: hero });
      }

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: rootRef }
  );

  const mascotIn = contextSafe(() => {
    gsap.to(".mascot-enter", { scale: 1.03, duration: 0.4, ease: "power2.out", overwrite: "auto" });
  });
  const mascotOut = contextSafe(() => {
    gsap.to(".mascot-enter", { scale: 1, duration: 0.5, ease: "power2.out", overwrite: "auto" });
  });
  const mascotPop = contextSafe(() => {
    gsap.fromTo(
      ".mascot-enter",
      { scale: 0.96, rotation: -2 },
      { scale: 1.03, rotation: 0, duration: 0.6, ease: "back.out(1.2)", overwrite: "auto" }
    );
  });

  const restoreSection = useEffectEvent(() => {
    let id = "home";
    try {
      id = decodeURIComponent(window.location.hash.slice(1)) || "home";
    } catch {
      return; // malformed hash
    }
    if (!NAV.some((section) => section.id === id)) return;
    setActive(id);
    scrollToSection(id, false);
  });

  // hash restore
  useEffect(() => {
    if (!loaded) return;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const onPopState = () => restoreSection();
    if (window.location.hash) requestAnimationFrame(() => restoreSection());
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.history.scrollRestoration = previousRestoration;
    };
  }, [loaded]);

  // scroll-spy
  useEffect(() => {
    const sections = NAV.map(({ id }) => document.getElementById(id));
    // last existing section
    const last = sections.findLastIndex((el) => el !== null);
    if (last < 0) return;
    let lastY = -1;
    let lastH = -1;

    const compute = () => {
      const navH = Math.round(headerRef.current?.getBoundingClientRect().height ?? 68);
      const vh = window.innerHeight;
      const line = navH + vh * 0.35;
      const tops = sections.map((el) => (el ? el.getBoundingClientRect().top : Infinity));
      let i = 0;
      tops.forEach((top, k) => {
        if (top <= line) i = k;
      });
      const next = tops[i + 1];
      if (i < last && Number.isFinite(next)) {
        const span = Math.min(vh * 0.45, next - tops[i]);
        if (span > 0 && 1 - (next - line) / span >= 0.5) i += 1;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        i = last;
      }
      if (!scrollLockRef.current) setActive(NAV[i].id);
    };
    syncActiveRef.current = () => {
      lastY = -1;
    };

    const tick = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      if (y === lastY && h === lastH) return;
      compute();
      lastY = y;
      lastH = h;
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      syncActiveRef.current = () => { };
    };
  }, []);

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "nav-neutral" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "nav-neutral" }}
      update="none"
      default="nav-neutral"
    >
      <div
        ref={rootRef}
        style={THEMES[mode] as CSSProperties}
        className="min-h-screen overflow-x-clip bg-[var(--bg)] font-[family-name:var(--font-body)] antialiased text-[var(--fg)] transition-colors duration-500"
      >
        {!preloaderGone ? (
          <Preloader
            onReveal={() => flushSync(() => setLoaded(true))}
            onComplete={() => setPreloaderGone(true)}
          />
        ) : null}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-[#FFF6EF] focus:px-4 focus:py-2 focus:font-extrabold font-[family-name:var(--font-body)] focus:text-[#171024]"
        >
          Skip to content
        </a>

        <Navbar
          headerRef={headerRef}
          lenisRef={lenisRef}
          active={active}
          mode={mode}
          onNavigate={go}
          onToggleMode={() => writeMode(mode === "dark" ? "light" : "dark")}
        />

        <main id="main" tabIndex={-1} className="focus:outline-none">
          <section
            id="home"
            className="relative overflow-hidden scroll-mt-[4.25rem] bg-[#171024] md:h-[min(calc(100svh-4.25rem),68rem)]"
            style={{
              "--hero-gutter": "max(2.5rem, calc((100vw - 96rem) / 2))",
              "--mascot": "min(clamp(280px, 40vw, 620px), 90%, calc(100svh - 9rem))",
            } as CSSProperties}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 md:hidden"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,246,239,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,246,239,0.045) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 75%)",
                maskImage: "linear-gradient(180deg, #000 0%, transparent 75%)",
              }}
            />

            {/* hero frame */}
            <div
              className="site-container relative z-10 flex flex-col max-md:gap-5 max-md:px-6 max-md:pb-12 max-md:pt-6 md:grid md:h-full md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]"
              style={{ maxWidth: "96rem" }}
            >
              <span
                aria-hidden="true"
                className="hero-code pointer-events-none absolute max-md:hidden -bottom-[0.18em] -left-[0.04em] select-none font-[family-name:var(--font-hero)] text-[min(38vw,46rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,246,239,0.08)]"
              >
                ICS
              </span>

              <div className="hero-copy max-md:contents md:relative md:z-20 md:flex md:flex-col md:justify-center md:py-6">
                <p className="hero-tag font-[family-name:var(--font-mono)] text-[13px] font-medium tracking-[0.08em] text-[#FF4D94] max-md:order-1 max-md:text-center">
                  {ORG.school}
                </p>

                <div className="max-md:order-2 md:contents">
                  <h1
                    aria-label={ORG.name}
                    className="text-center font-[family-name:var(--font-hero)] text-[length:min(calc((100vw_-_6.5rem)/5),4.75rem)] uppercase leading-[0.92] text-[#FFF6EF] md:mt-3 md:text-left md:text-[clamp(3rem,min(8vw,16vh),9rem)] md:leading-[0.9]"
                  >
                    <span className="block">
                      <span aria-hidden="true" className="text-[#EC0867]">{"{"}</span>{" "}
                      {HERO_LINES[0]}
                    </span>
                    <span className="block md:pl-[0.7em]">{HERO_LINES[1]}</span>
                    <span className="block md:pl-[1.4em]">
                      {HERO_LINES[2]}
                      <span
                        aria-hidden="true"
                        className="caret ml-[0.12em] inline-block h-[0.8em] w-[0.28em] translate-y-[0.06em] bg-[#EC0867]"
                      />
                      <span aria-hidden="true" className="ml-[0.15em] text-[#EC0867]">{"}"}</span>
                    </span>
                  </h1>
                </div>

                <div className="hero-card max-md:order-5 max-md:border-l-[3px] max-md:border-[#EC0867] max-md:pl-4 md:mt-5 md:ml-[10%]">
                  <p className="max-w-[34ch] text-base leading-[1.6] text-[rgba(255,245,240,0.75)] md:text-lg">
                    {ORG.shortDescription}
                  </p>
                </div>

                <div className="hero-cta grid grid-cols-2 gap-3 whitespace-nowrap max-md:order-6 md:mt-6 md:flex md:ml-[10%] md:flex-row md:items-center md:gap-8">
                  <a href={LINKS.join} target="_blank" rel="noopener noreferrer" className="ics-cta ics-cta--solid">
                    <span className="ics-cta__face">
                      <span>Join ICS</span>
                      <ArrowUpRight size={22} className="ics-cta__icon" aria-hidden="true" />
                    </span>
                  </a>
                  <a href={LINKS.events} target="_blank" rel="noopener noreferrer" className="ics-cta ics-cta--ghost">
                    <span className="ics-cta__face">
                      <span>Events</span>
                      <ArrowDown size={22} className="ics-cta__icon" aria-hidden="true" />
                    </span>
                  </a>
                </div>
              </div>

              {/* mascot column */}
              <div className="relative max-md:order-3 md:flex md:h-full md:items-center">
                <div
                  aria-hidden="true"
                  data-morph={PANEL_SHAPE}
                  className="hero-panel pointer-events-none absolute inset-y-0 left-[calc(var(--mascot)/2)] right-[calc(-1*var(--hero-gutter))] hidden bg-[#EC0867] md:block"
                />

                <div aria-hidden="true" className="hero-decor pointer-events-none absolute inset-0 hidden md:block">
                  <div
                    className="absolute left-[calc(var(--mascot)/2)] top-1/2 size-[64rem] -translate-x-1/2 -translate-y-1/2"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(23,16,36,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(23,16,36,0.10) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                      WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 70%)",
                      maskImage: "radial-gradient(circle, #000 0%, transparent 70%)",
                    }}
                  />
                  <div className="absolute left-[calc(var(--mascot)/2)] top-1/2 aspect-square w-[calc(var(--mascot)*1.15)] -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="hero-glow h-full w-full rounded-full opacity-60"
                      style={{ background: "radial-gradient(circle, rgba(255,246,239,0.38), rgba(237,111,120,0.18) 40%, transparent 68%)" }}
                    />
                  </div>
                  <div className="absolute -bottom-10 left-0 size-56 rounded-full bg-[#4A214C]/40 blur-3xl" />

                  <span
                    className="hero-depth absolute -top-[2%] -right-[14%] select-none font-[family-name:var(--font-hero)] text-[clamp(8rem,17vw,16rem)] leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,246,239,0.22)]"
                    data-depth="10"
                  >
                    {"</>"}
                  </span>
                  <span
                    className="hero-depth absolute bottom-[2%] left-[6%] select-none font-[family-name:var(--font-hero)] text-[clamp(7rem,14vw,13rem)] leading-none text-[#171024]/10"
                    data-depth="6"
                  >
                    {"{}"}
                  </span>
                  <span
                    className="hero-depth absolute -right-[10%] bottom-[3%] select-none font-[family-name:var(--font-hero)] text-[clamp(5rem,10vw,9rem)] leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,246,239,0.2)]"
                    data-depth="8"
                  >
                    01
                  </span>

                  {PARTICLES.map(([left, top, s], i) => (
                    <span
                      key={i}
                      className={`particle absolute opacity-70 ${i % 3 === 0 ? "bg-[#171024]" : "bg-[#FFF6EF]"}`}
                      style={{ left, top, width: s, height: s }}
                    />
                  ))}
                </div>

                <div aria-hidden="true" className="pointer-events-none absolute bottom-[3%] left-1/2 top-[26%] w-screen -translate-x-1/2 md:hidden">
                  <div
                    className="absolute inset-0 translate-x-3 translate-y-2 bg-[#4A214C]"
                    style={{ clipPath: polygon(BAND_SHAPE) }}
                  />
                  <div
                    data-morph={BAND_SHAPE}
                    className="absolute inset-0 bg-[#EC0867]"
                    style={{ clipPath: polygon(BAND_SHAPE) }}
                  />
                </div>
                <div
                  onPointerEnter={mascotIn}
                  onPointerLeave={mascotOut}
                  onClick={mascotPop}
                  className="relative z-0 mx-auto aspect-square w-[min(92%,24rem,32svh)] cursor-pointer md:mx-0 md:w-[var(--mascot)]"
                >
                  <div className="hero-depth h-full w-full" data-depth="7">
                    <div className="mascot-enter relative h-full w-full">
                      <div className="mascot-drift h-full w-full">
                        <div className="mascot-float relative h-full w-full">
                          <Image
                            src={HERO_MASCOT.src}
                            alt={HERO_MASCOT.alt}
                            fill
                            priority
                            sizes="(min-width: 768px) 38vw, 100vw"
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* pins */}
                  <HeroPin src="/PIN2.png" tilt="-rotate-6" className="-top-[10%] -left-[4%] hidden lg:block" />
                  <HeroPin src="/MascotPin-Cat.png" tilt="rotate-6" className="left-[78%] top-[6%] hidden lg:block" />
                  <HeroPin src="/MascotPin-Student.png" tilt="rotate-3" className="left-[68%] top-[72%] hidden lg:block" />
                </div>
              </div>

              <div
                aria-hidden="true"
                className="flex items-center justify-between border-t border-[#FFF6EF]/15 pt-3 font-[family-name:var(--font-mono)] text-[12px] tracking-[0.2em] text-[#FFF6EF]/60 max-md:order-4 md:hidden"
              >
                <span>{"<ics />"}</span>
                <span>{ORG.term}</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ViewTransition>
  );
}
