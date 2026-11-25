"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type Lenis from "lenis";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";

import { useScrolledFlag } from "./useScrolledFlag";
import { HALFTONE, type Mode } from "./ui";
import { LINKS, NAV, ORG } from "../data/org";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// desktop section links
function NavLinks({ active, go }: { active: string; go: (id: string) => void }) {
  return (
    <ul className="hidden items-center gap-8 lg:flex">
      {NAV.map((n) => {
        const on = active === n.id;
        return (
          <li key={n.id} className="nav-item relative">
            <a
              href={`#${n.id}`}
              onClick={(event) => {
                event.preventDefault();
                go(n.id);
              }}
              aria-current={on ? "location" : undefined}
              className={`inline-flex min-h-11 items-center font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase tracking-[0.25em] transition-colors hover:text-[var(--accent-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EC0867] ${on ? "text-[#FFF6EF]" : "text-[#FFF6EF]/50"}`}
            >
              <span className="-mr-[0.25em]">{n.label}</span>
            </a>
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute left-1/2 top-[calc(50%+0.75rem)] size-1.5 -translate-x-1/2 rounded-full bg-[#EC0867] transition-transform duration-300 ${on ? "scale-100" : "scale-0"}`}
            />
          </li>
        );
      })}
    </ul>
  );
}

export default function Navbar({
  headerRef,
  lenisRef,
  active,
  mode,
  onNavigate,
  onToggleMode,
}: {
  headerRef: RefObject<HTMLElement | null>;
  lenisRef: RefObject<Lenis | null>;
  active: string;
  mode: Mode;
  onNavigate: (id: string) => void;
  onToggleMode: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const menuWasOpen = useRef(false);
  const bodyOverflowRef = useRef("");

  useScrolledFlag(headerRef);

  const { contextSafe } = useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    },
    { scope: headerRef }
  );

  const spinThemeIcon = contextSafe(() => {
    gsap.fromTo(
      ".theme-icon",
      { rotation: -90, scale: 0.6 },
      { rotation: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
    );
  });

  useGSAP(
    () => {
      const menu = menuRef.current;
      if (!menu) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (menuOpen) {
        menuWasOpen.current = true;
        gsap.set(menu, { visibility: "visible" });
        if (reduceMotion) {
          gsap.set(menu, { xPercent: 0 });
          gsap.set(".mobile-link", { clearProps: "transform,opacity" });
          return;
        }
        gsap.fromTo(menu, { xPercent: 100 }, { xPercent: 0, duration: 0.34, ease: "power3.out" });
        gsap.from(".mobile-link", {
          x: 40,
          opacity: 0,
          duration: 0.3,
          stagger: 0.045,
          delay: 0.08,
          ease: "power2.out",
        });
      } else if (menuWasOpen.current) {
        if (reduceMotion) {
          gsap.set(menu, { xPercent: 100, visibility: "hidden" });
          menuWasOpen.current = false;
          return;
        }
        gsap.to(menu, {
          xPercent: 100,
          duration: 0.28,
          ease: "power3.inOut",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
            menuWasOpen.current = false;
          },
        });
      } else {
        gsap.set(menu, { xPercent: 100 });
      }
    },
    { dependencies: [menuOpen], scope: menuRef }
  );

  // menu open: scroll lock, Escape, desktop resize
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    bodyOverflowRef.current = previousOverflow;
    document.body.style.overflow = "hidden";
    const lenis = lenisRef.current;
    lenis?.stop();

    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      menuToggleRef.current?.focus({ preventScroll: true });
    };
    mq.addEventListener("change", onMq);
    window.addEventListener("keydown", onKey);

    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [menuOpen, lenisRef]);

  const go = (id: string) => {
    // unlock scroll before navigating
    if (menuOpen) {
      document.body.style.overflow = bodyOverflowRef.current;
      menuToggleRef.current?.focus({ preventScroll: true });
      lenisRef.current?.start();
      setMenuOpen(false);
    }
    onNavigate(id);
  };

  const toggleMode = () => {
    onToggleMode();
    spinThemeIcon();
  };

  return (
    <>
      <header
        ref={headerRef}
        style={{ viewTransitionName: "site-header" }}
        className="site-nav group/nav sticky top-0 z-50 border-b-2 border-[#FFF6EF]/15 bg-[#171024]/95 text-[#FFF6EF] transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out data-[scrolled=true]:bg-[#171024]/80 data-[scrolled=true]:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] data-[scrolled=true]:backdrop-blur-md data-[scrolled=true]:backdrop-saturate-150"
      >
        <nav className="site-container grid h-16 grid-cols-[1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr]" aria-label="Primary">
          <button
            onClick={() => go("home")}
            aria-label={`${ORG.handle} home`}
            className="nav-logo group flex min-h-11 justify-self-start origin-left items-center gap-2 transition-transform duration-300 ease-out group-data-[scrolled=true]/nav:scale-90 sm:gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFF6EF]"
          >
            <span className="inline-flex items-center text-xl leading-none sm:text-[1.7rem] font-normal font-[family-name:var(--font-hero)] uppercase tracking-[0.03em] text-[#FFF6EF] transition-opacity duration-200 group-hover:opacity-85">
              <span className="inline-flex items-center gap-2 leading-none sm:gap-3">
                <Image
                  src="/ics-trans-logo.png"
                  alt=""
                  width={64}
                  height={64}
                  priority
                  data-morph-logo=""
                  className="h-8 w-auto sm:h-12 object-contain"
                />
                <span className="nav-handle">{ORG.handle}</span>
              </span>
            </span>
          </button>

          <NavLinks active={active} go={go} />

          <div className="nav-actions flex items-center gap-2 justify-self-end">
            <button
              onClick={toggleMode}
              aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
              className="grid h-11 w-11 place-items-center text-[#FFF6EF] transition-all duration-200 ease-out hover:bg-[#FFF6EF]/10 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF6EF]"
            >
              <span className="theme-icon inline-flex">
                {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </span>
            </button>
            <a
              href={LINKS.join}
              target="_blank"
              rel="noreferrer"
              className="hidden min-h-9 items-center gap-2 bg-[#EC0867] px-3 font-[family-name:var(--font-body)] text-xs font-extrabold uppercase tracking-[0.08em] text-[#FFF6EF] transition-colors hover:bg-[#D9075D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF6EF] sm:inline-flex"
            >
              ICSLink <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <button
              ref={menuToggleRef}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="grid h-11 w-11 place-items-center bg-[#EC0867] text-[#FFF6EF] lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF6EF]"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
        <div
          aria-hidden="true"
          className="scroll-progress absolute inset-x-0 -bottom-1 h-1 origin-left bg-[#FFF6EF]"
          style={{ transform: "scaleX(0)" }}
        />
      </header>

      {/* mobile menu */}
      <nav
        ref={menuRef}
        id="mobile-menu"
        className="invisible fixed inset-x-0 bottom-0 top-[calc(4rem+2px)] z-40 overflow-y-auto bg-[#EC0867] lg:hidden"
        aria-label="Mobile section navigation"
        aria-hidden={!menuOpen}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-[#A82D65]/60"
          style={{ backgroundImage: HALFTONE, backgroundSize: "14px 14px" }}
        />
        <ul className="relative flex min-h-full flex-col justify-center gap-3 px-5 py-8 sm:gap-4 sm:px-8">
          {NAV.map((n) => (
            <li key={n.id} className="mobile-link">
              <a
                href={`#${n.id}`}
                tabIndex={menuOpen ? 0 : -1}
                onClick={(event) => {
                  event.preventDefault();
                  go(n.id);
                }}
                aria-current={active === n.id ? "location" : undefined}
                className={`flex w-full max-w-sm items-baseline gap-3 px-5 py-3 text-left font-[family-name:var(--font-hero)] text-4xl uppercase text-[#FFF6EF] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFF6EF] ${active === n.id ? "bg-[#171024]" : "bg-[#171024]/85"}`}
              >
                <span aria-hidden="true" className="text-[#EC0867]">{"{"}</span>
                {n.label}
              </a>
            </li>
          ))}
          <li className="mobile-link">
            <a
              href={LINKS.join}
              target="_blank"
              rel="noreferrer"
              tabIndex={menuOpen ? 0 : -1}
              className="inline-flex min-h-11 items-center gap-3 bg-[#171024] px-5 py-3 font-[family-name:var(--font-body)] text-sm font-extrabold uppercase tracking-[0.08em] text-[#FFF6EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFF6EF]"
            >
              ICSLink <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
