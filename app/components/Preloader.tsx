"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { HALFTONE, PALETTE } from "./ui";

gsap.registerPlugin(useGSAP);

// logo outline strokes, traced from ICS-Transparent.png
type Side = "top" | "bottom" | "left" | "right";
const STROKES: { color: string; d: string; start: Side; dir: 1 | -1 }[] = [
  // purple -> pink arch
  {
    color: "#c2308a",
    d: "M611.0,532.3 L606.0,528.0 L598.6,520.0 L594.1,513.0 L591.0,506.0 L589.2,498.0 L586.1,477.0 L585.9,469.0 L585.0,463.0 L585.0,451.0 L584.0,444.0 L583.9,435.0 L581.8,420.0 L579.6,410.0 L573.6,392.0 L566.2,376.0 L558.0,362.0 L548.6,350.0 L537.0,337.1 L526.0,327.2 L514.0,318.4 L500.0,309.8 L487.0,303.7 L473.0,295.8 L459.0,289.4 L446.0,284.4 L431.0,280.1 L419.0,277.4 L402.0,275.0 L357.0,275.1 L338.0,278.4 L331.0,280.3 L313.0,287.3 L292.0,297.8 L273.0,308.7 L262.0,316.6 L250.0,326.2 L233.0,342.0 L217.2,359.0 L210.1,368.0 L202.3,379.0 L193.4,393.0 L184.8,408.0 L174.8,429.0 L168.0,447.0 L162.2,468.0 L158.2,492.0 L156.1,511.0 L155.4,523.0 L156.4,524.7 L158.1,526.1 L177.0,536.5 L180.0,537.0 L193.0,537.0 L215.0,534.9 L229.0,532.8 L299.0,520.2 L309.0,518.8 L312.8,517.7 L314.3,516.6 L315.1,514.9 L319.4,497.0 L323.8,485.0 L331.2,471.0 L337.2,463.0 L345.0,455.2 L352.0,449.4 L358.0,445.4 L372.0,438.4 L385.0,434.4 L395.0,434.1 L402.0,435.4 L405.0,436.5 L408.9,439.1 L415.4,447.0 L418.0,449.5 L431.0,457.1 L439.0,460.0 L441.0,460.2 L443.0,459.7 L453.9,454.8 L455.3,454.9 L455.7,455.4",
    start: "left",
    dir: 1,
  },
  // diagonal bar
  {
    color: "#d6246a",
    d: "M455.7,455.4 L454.7,458.0 L449.4,464.0 L427.8,491.0 L404.2,519.0 L335.8,603.0 L321.2,620.0 L294.8,653.0 L280.2,670.0 L225.3,738.0 L224.1,739.9 L224.1,741.6 L227.0,744.2 L241.0,751.9 L244.0,752.9 L249.0,752.9 L281.0,748.2 L442.0,726.8 L449.0,725.4 L451.8,723.7 L456.8,718.0 L490.4,676.0 L503.8,660.0 L509.4,652.0 L511.8,649.8",
    start: "bottom",
    dir: -1,
  },
  // red-orange hook
  {
    color: "#f4503f",
    d: "M511.8,649.8 L512.5,649.6 L513.2,650.3 L512.5,655.8 L513.4,657.3 L515.1,658.6 L545.0,674.1 L564.0,682.6 L583.0,689.3 L596.0,692.6 L609.0,694.9 L619.0,695.1 L625.0,696.0 L630.0,695.9 L636.0,695.0 L648.0,694.9 L657.0,693.8 L674.0,690.6 L693.0,685.6 L716.0,676.7 L725.0,672.2 L745.0,660.9 L761.0,649.6 L777.0,636.0 L790.9,622.0 L801.8,610.0 L809.6,600.0 L821.3,583.0 L829.2,570.0 L840.2,549.0 L846.6,534.0 L852.3,518.0 L857.6,501.0 L859.8,492.0 L863.8,471.0 L864.1,464.0 L865.0,458.0 L864.6,444.2 L863.6,442.7 L861.0,440.8 L843.0,431.5 L839.0,431.0 L826.0,431.0 L820.0,431.9 L813.0,432.1 L788.0,435.2 L709.1,448.6 L707.6,449.6 L706.5,451.1 L702.0,469.0 L695.2,486.0 L690.0,495.0 L683.8,504.0 L679.8,508.8 L670.0,517.8 L664.0,522.3 L655.0,528.1 L648.0,531.0 L641.0,533.1 L632.0,534.9 L623.0,535.0 L615.0,533.8 L611.0,532.3",
    start: "right",
    dir: 1,
  },
  // dot
  {
    color: "#a243ae",
    d: "M628.0,324.4 L619.0,329.0 L610.0,336.0 L603.0,345.0 L598.8,353.0 L596.1,360.0 L594.0,372.0 L594.0,378.0 L595.2,385.0 L597.8,393.0 L601.4,400.0 L605.2,405.0 L607.0,406.6 L618.0,413.2 L638.0,424.0 L643.0,425.9 L647.0,426.8 L650.0,427.0 L662.0,426.8 L671.0,424.2 L679.0,419.3 L686.0,414.0 L693.6,405.0 L699.2,394.0 L701.6,386.0 L703.0,377.0 L703.0,372.0 L701.8,364.0 L700.2,359.0 L697.2,353.0 L694.6,349.0 L688.0,342.2 L683.0,338.8 L658.0,325.3 L650.0,322.4 L647.0,322.0 L636.0,322.2 Z",
    start: "top",
    dir: 1,
  },
];

const SEGMENT = 30;
const SPEED = 100 / 600;
const RAMP_MS = 300;
const MIN_LOOP_MS = 700;
const HOLD_MS = 120;
const MAX_WAIT_MS = 5000; // load timeout
const FILL_MS = 560; // fill per piece
const FILL_STAGGER = 70;
const FILL_W = 210; // fill stroke width
const SHEEN_FROM = 50;
const SHEEN_TO = 1140;

// exit timing (s), shared with the page intro
export const EXIT = {
  morph: 1, // backdrop -> [data-morph]
  logo: 0.9, // logo -> [data-morph-logo]
};

type Point = [number, number];
const LOGO_IMAGE_SIZE = 1025; // logo PNG size
const LOGO_CENTER: Point = [145 + 730 / 2, 265 + 500 / 2];

function findShapeTarget(vh: number) {
  for (const el of document.querySelectorAll<HTMLElement>("[data-morph]")) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom <= 0 || r.top >= vh) continue;
    const pct = el.dataset.morph!.split(",").map((p) => p.trim().split(/\s+/).map(Number) as Point);
    return { r, pct };
  }
  return null;
}

const ease = (x: number) => 1 - (1 - x) ** 3;
const easeInOut = (x: number) =>
  x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;

function startFraction(path: SVGPathElement, side: Side) {
  const total = path.getTotalLength();
  let best = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < 200; i++) {
    const { x, y } = path.getPointAtLength((total * i) / 200);
    const score =
      side === "top" ? -y : side === "bottom" ? y : side === "left" ? -x : x;
    if (score > bestScore) [best, bestScore] = [i / 2, score];
  }
  return best;
}

export default function Preloader({
  onReveal,
  onComplete,
}: {
  /** screen still covered */
  onReveal?: () => void;
  /** exit finished */
  onComplete?: () => void;
}) {
  const [gone, setGone] = useState(false);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const growRefs = useRef<(SVGPathElement | null)[]>([]);
  const strokeRef = useRef<SVGGElement>(null);
  const sheenRef = useRef<SVGRectElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const pinkRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const paths = pathRefs.current.filter((p) => p !== null);
    const grows = growRefs.current.filter((p) => p !== null);
    const starts = paths.map((p, i) => startFraction(p, STROKES[i].start));

    const start = performance.now();
    let loadDone = document.readyState === "complete";
    let fontsDone = !document.fonts;
    const isLoaded = () => loadDone && fontsDone;
    document.fonts?.ready.then(() => {
      fontsDone = true;
    });
    let closeAt: number | null = null;
    let tails: number[] = [];
    let closeFrom = 0;
    let closeMs = 0;
    let fillAt: number | null = null;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout>;

    const onLoad = () => {
      loadDone = true;
    };
    window.addEventListener("load", onLoad, { once: true });

    const draw = (
      path: SVGPathElement,
      tail: number,
      len: number,
      dir: 1 | -1,
    ) => {
      const from = dir === 1 ? tail : tail - len;
      path.style.strokeDasharray = `${len} ${100 - len}`;
      path.style.strokeDashoffset = `${-from}`;
    };

    // fill
    const setFill = (i: number, f: number) => {
      grows[i].setAttribute("stroke-width", `${FILL_W * f}`);
    };

    const setSheen = (k: number) => {
      const x = SHEEN_FROM + (SHEEN_TO - SHEEN_FROM) * k;
      sheenRef.current?.setAttribute(
        "transform",
        `translate(${x} 0) skewX(-18)`,
      );
    };

    let exitTl: gsap.core.Timeline | undefined;
    let restoreLogo = () => {};

    const finish = () => {
      setGone(true);
      onComplete?.();
    };

    // exit morph
    const morph = () => {
      const root = rootRef.current!;
      const shape = shapeRef.current!;
      const svg = svgRef.current!;
      const vw = root.clientWidth;
      const vh = root.clientHeight;

      // fallback: header bottom edge
      const navBottom = document.querySelector(".site-nav")?.getBoundingClientRect().bottom ?? 0;
      const { r, pct } = findShapeTarget(vh) ?? {
        r: new DOMRect(0, navBottom, vw, 0),
        pct: [[0, 0], [100, 0], [100, 100], [0, 100]] as Point[],
      };
      const from = pct.map(([x, y]) => [x < 50 ? 0 : vw, y < 50 ? 0 : vh]);
      const to = pct.map(([x, y]) => [r.left + (x / 100) * r.width, r.top + (y / 100) * r.height]);
      const shapeProgress = { p: 0 };
      const drawShape = () => {
        const k = shapeProgress.p;
        const pts = from.map(([fx, fy], i) => `${fx + (to[i][0] - fx) * k}px ${fy + (to[i][1] - fy) * k}px`);
        shape.style.clipPath = `polygon(${pts.join(",")})`;
      };
      drawShape();

      exitTl = gsap.timeline({ onComplete: finish });
      exitTl
        .to(shapeProgress, { p: 1, duration: EXIT.morph, ease: "power3.inOut", onUpdate: drawShape }, 0)
        .to(pinkRef.current, { opacity: 1, duration: 0.6, ease: "power1.inOut" }, 0.25)
        .to(root, { opacity: 0, duration: 0.2, ease: "power1.out" }, EXIT.morph);

      const logo = document.querySelector<HTMLElement>("[data-morph-logo]");
      const lr = logo?.getBoundingClientRect();
      if (logo && lr && lr.width && lr.bottom > 0) {
        const size = Math.min(lr.width, lr.height); // object-contain square
        const k = size / LOGO_IMAGE_SIZE;
        const tx = lr.left + (lr.width - size) / 2 + LOGO_CENTER[0] * k;
        const ty = lr.top + (lr.height - size) / 2 + LOGO_CENTER[1] * k;
        const sr = svg.getBoundingClientRect();
        gsap.set(logo, { opacity: 0 });
        exitTl
          .to(svg, {
            x: tx - (sr.left + sr.width / 2),
            y: ty - (sr.top + sr.height / 2),
            scale: (730 * k) / sr.width,
            transformOrigin: "50% 50%",
            duration: EXIT.logo,
            ease: "power3.inOut",
          }, 0)
          // swap to the real logo
          .add(() => {
            gsap.set(logo, { clearProps: "opacity" });
            gsap.set(svg, { opacity: 0 });
          }, EXIT.logo);
        restoreLogo = () => gsap.set(logo, { clearProps: "opacity" });
      } else {
        exitTl.to(svg, { opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.in" }, 0);
      }
    };

    const reveal = () => {
      const root = rootRef.current;
      if (reduceMotion || !root || !shapeRef.current || !svgRef.current) {
        timer = setTimeout(() => {
          onReveal?.();
          finish();
        }, HOLD_MS);
        return;
      }
      root.style.pointerEvents = "none";
      // hand-off
      timer = setTimeout(() => {
        onReveal?.();
        frame = requestAnimationFrame(morph);
      }, HOLD_MS);
    };

    if (reduceMotion) {
      paths.forEach((p, i) => {
        draw(p, 0, 100, 1);
        setFill(i, 1);
      });
      if (strokeRef.current) strokeRef.current.style.opacity = "0";
      if (sheenRef.current) sheenRef.current.style.display = "none";
      if (svgRef.current) svgRef.current.style.opacity = "1";
      // wait for load + fonts
      const waitForLoad = () => {
        if (isLoaded() || performance.now() - start >= MAX_WAIT_MS) reveal();
        else timer = setTimeout(waitForLoad, 50);
      };
      waitForLoad();
    } else {
      const fillTotal = FILL_MS + FILL_STAGGER * (paths.length - 1);
      const tick = (now: number) => {
        const t = Math.max(0, now - start);
        const r = Math.min(1, t / RAMP_MS);
        const dist =
          t < RAMP_MS
            ? (SPEED * t * t) / (2 * RAMP_MS)
            : SPEED * (t - RAMP_MS / 2);
        const len = SEGMENT * (1 - Math.exp(-dist / SEGMENT));
        if (svgRef.current) svgRef.current.style.opacity = `${r}`;

        if (closeAt === null && (isLoaded() || t >= MAX_WAIT_MS) && t >= MIN_LOOP_MS) {
          closeAt = now;
          tails = paths.map(
            (_, i) => starts[i] + STROKES[i].dir * (dist - len),
          );
          closeFrom = len;
          closeMs = (100 - len) / SPEED;
        }

        if (closeAt === null) {
          paths.forEach((p, i) => {
            const { dir } = STROKES[i];
            const head = starts[i] + dir * dist;
            draw(p, head - dir * len, len, dir);
          });
          frame = requestAnimationFrame(tick);
          return;
        }

        const k = Math.min(1, (now - closeAt) / closeMs);
        const grown = closeFrom + (100 - closeFrom) * (1 - (1 - k) ** 2);
        paths.forEach((p, i) => draw(p, tails[i], grown, STROKES[i].dir));
        if (k < 1) {
          frame = requestAnimationFrame(tick);
          return;
        }

        fillAt ??= now;
        const ft = now - fillAt;
        paths.forEach((_, i) => {
          const f = Math.min(1, Math.max(0, (ft - i * FILL_STAGGER) / FILL_MS));
          setFill(i, ease(f));
        });
        // border fade
        if (strokeRef.current) {
          strokeRef.current.style.opacity = `${1 - easeInOut(Math.min(1, ft / (FILL_MS * 0.8)))}`;
        }
        setSheen(easeInOut(Math.min(1, ft / (fillTotal + 120))));

        if (ft < fillTotal + 120) {
          frame = requestAnimationFrame(tick);
        } else {
          if (strokeRef.current) strokeRef.current.style.opacity = "0";
          reveal();
        }
      };
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener("load", onLoad);
      exitTl?.kill();
      restoreLogo();
    };
  }, { scope: svgRef });

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Loading"
      className="preloader fixed inset-0 z-[9999] grid place-items-center overflow-hidden"
    >
      {/* no-JS fallback */}
      <noscript>
        <style>{".preloader{display:none}"}</style>
      </noscript>
      <div
        ref={shapeRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${PALETTE.aubergine} 0%, ${PALETTE.plum} 55%, ${PALETTE.berry} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 text-[#EC0867]/30"
          style={{
            backgroundImage: HALFTONE,
            backgroundSize: "16px 16px",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 50%, transparent 25%, #000 85%)",
            maskImage:
              "radial-gradient(ellipse at 50% 50%, transparent 25%, #000 85%)",
          }}
        />
        <div ref={pinkRef} className="absolute inset-0 bg-[#EC0867] opacity-0" />
      </div>
      <svg
        ref={svgRef}
        viewBox="145 265 730 500"
        style={{ opacity: 0 }}
        className="relative w-[min(40vw,190px)] overflow-visible"
        aria-hidden
      >
        <defs>
          {/* white silhouette */}
          <filter id="pl-white" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
            />
          </filter>
          <linearGradient id="pl-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <image
            id="pl-img"
            href={LOGO}
            x={145}
            y={265}
            width={730}
            height={500}
          />
          <mask
            id="pl-reveal"
            maskUnits="userSpaceOnUse"
            x="145"
            y="265"
            width="730"
            height="500"
          >
            {STROKES.map(({ d }, i) => (
              <path
                key={d}
                ref={(el) => {
                  growRefs.current[i] = el;
                }}
                d={d}
                fill="none"
                stroke="#fff"
                strokeWidth={0}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </mask>
          <mask
            id="pl-shape"
            maskUnits="userSpaceOnUse"
            x="145"
            y="265"
            width="730"
            height="500"
          >
            <use href="#pl-img" filter="url(#pl-white)" />
          </mask>
        </defs>
        <g mask="url(#pl-reveal)">
          <use href="#pl-img" />
          <g mask="url(#pl-shape)">
            <rect
              ref={sheenRef}
              x={0}
              y={255}
              width={150}
              height={520}
              fill="url(#pl-sheen)"
              transform={`translate(${SHEEN_FROM} 0) skewX(-18)`}
            />
          </g>
        </g>
        <g ref={strokeRef}>
          {STROKES.map(({ color, d }, i) => (
            <path
              key={d}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={d}
              pathLength={100}
              fill="none"
              stroke={color}
              strokeWidth={18}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0 100"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

// embedded logo
const LOGO =
  "data:image/webp;base64,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";