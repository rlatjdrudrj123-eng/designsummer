"use client";

import { useEffect, useRef } from "react";
import styles from "./AuraBg.module.css";

/**
 * AuraBg — a soft, dreamy, full-bleed WARM aura ground for the lineup.
 *
 * Brings the Aura variant's technique (variants/aura/AuraField.tsx) into the
 * develop site, but in the site's own HEAT palette: orange + amber + gold +
 * yellow, NO teal/cyan/green. A handful of large, heavily-blurred radial blobs
 * are painted to a low-res canvas with `ctx.filter = "blur(...)"` and slow rAF
 * drift, so overlapping blobs bloom into an airbrushed warm wash. The canvas
 * sits absolutely behind the lineup content (z-index 0); content sits above it.
 *
 * Because the page is a LIGHT (near-white) ground with DARK ink type, the blobs
 * are painted with normal `source-over` compositing at moderate alpha over a
 * faint warm cream wash — this keeps the aura pastel/luminous WITHOUT washing
 * out to white (which `lighter` would do on a light ground), so dark ink stays
 * perfectly legible on top. A soft top→bottom white veil (CSS) lifts the very
 * top/bottom edges so the field melts into the surrounding white sections.
 *
 * `hue` (0..1) shifts the warmth across the two days, staying entirely in the
 * warm family:
 *   0 → DAY 1 mood: deeper ORANGE / red-orange + amber (HEAT SOURCE)
 *   1 → DAY 2 mood: brighter GOLDEN-YELLOW / gold + amber (HEAT TRANSFER)
 *
 * prefers-reduced-motion: paints one static frame and stops (no rAF loop).
 */

type Blob = {
  bx: number; // base x (0..1 of canvas)
  by: number; // base y (0..1 of canvas)
  ax: number; // drift amplitude x
  ay: number; // drift amplitude y
  sx: number; // drift speed x
  sy: number; // drift speed y
  phx: number; // phase x
  phy: number; // phase y
  r: number; // base radius (0..1 of min dim)
  rPulse: number; // radius pulse amount
  rSpeed: number; // radius pulse speed
  // two-stop warm color: [day1 rgb, day2 rgb] — picked by hue mix
  c1: [number, number, number];
  c2: [number, number, number];
  alpha: number;
};

// All warm. DAY 1 (c1): red-orange / orange / amber. DAY 2 (c2): gold / golden-yellow / amber.
const BLOBS: Blob[] = [
  {
    bx: 0.24, by: 0.3, ax: 0.1, ay: 0.08, sx: 0.041, sy: 0.03, phx: 0.0, phy: 1.7,
    r: 0.6, rPulse: 0.1, rSpeed: 0.05,
    c1: [255, 110, 40], c2: [255, 196, 64], alpha: 0.5,
  },
  {
    bx: 0.78, by: 0.26, ax: 0.09, ay: 0.1, sx: 0.035, sy: 0.045, phx: 2.1, phy: 0.4,
    r: 0.54, rPulse: 0.12, rSpeed: 0.06,
    c1: [255, 150, 50], c2: [255, 214, 96], alpha: 0.46,
  },
  {
    bx: 0.52, by: 0.74, ax: 0.12, ay: 0.07, sx: 0.028, sy: 0.038, phx: 3.4, phy: 2.6,
    r: 0.68, rPulse: 0.09, rSpeed: 0.044,
    c1: [232, 74, 32], c2: [246, 168, 40], alpha: 0.44,
  },
  {
    bx: 0.16, by: 0.78, ax: 0.08, ay: 0.09, sx: 0.05, sy: 0.026, phx: 1.2, phy: 4.1,
    r: 0.46, rPulse: 0.13, rSpeed: 0.07,
    c1: [255, 178, 86], c2: [255, 226, 130], alpha: 0.42,
  },
  {
    bx: 0.86, by: 0.72, ax: 0.07, ay: 0.08, sx: 0.044, sy: 0.034, phx: 5.0, phy: 0.9,
    r: 0.5, rPulse: 0.11, rSpeed: 0.052,
    c1: [255, 132, 48], c2: [255, 204, 72], alpha: 0.4,
  },
];

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function AuraBg({
  hue,
  className,
}: {
  hue: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hueRef = useRef(hue);

  useEffect(() => {
    hueRef.current = hue;
  }, [hue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;

    // Low-res buffer: we draw at a fraction of the real pixel size and let CSS
    // scale the canvas up — combined with the heavy blur this is cheap and the
    // softness hides the upscale. (perf: no per-pixel work.)
    const SCALE = 0.34;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width * SCALE));
      h = Math.max(1, Math.round(rect.height * SCALE));
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    resize();

    let curHue = hueRef.current;

    const paint = (t: number) => {
      const minDim = Math.min(w, h);

      // faint warm CREAM base wash so the blobs sit on a soft tinted ground,
      // not pure white. Shifts subtly warmer-yellow toward DAY 2.
      const topR = Math.round(mix(255, 255, curHue));
      const topG = Math.round(mix(244, 248, curHue));
      const topB = Math.round(mix(232, 224, curHue));
      const botR = Math.round(mix(255, 255, curHue));
      const botG = Math.round(mix(236, 242, curHue));
      const botB = Math.round(mix(218, 206, curHue));
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, `rgb(${topR},${topG},${topB})`);
      bg.addColorStop(1, `rgb(${botR},${botG},${botB})`);
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // soft warm blobs. source-over (not lighter) so on a LIGHT ground they
      // deepen into pastel orange/gold instead of blowing out to white.
      const blurPx = Math.max(18, minDim * 0.16);
      ctx.filter = `blur(${blurPx}px)`;

      for (const b of BLOBS) {
        const x = (b.bx + Math.sin(t * b.sx + b.phx) * b.ax) * w;
        const y = (b.by + Math.cos(t * b.sy + b.phy) * b.ay) * h;
        const r =
          minDim * (b.r + Math.sin(t * b.rSpeed + b.phx) * b.rPulse) * 0.85;
        const cr = Math.round(mix(b.c1[0], b.c2[0], curHue));
        const cg = Math.round(mix(b.c1[1], b.c2[1], curHue));
        const cb = Math.round(mix(b.c1[2], b.c2[2], curHue));
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${b.alpha})`);
        g.addColorStop(0.5, `rgba(${cr},${cg},${cb},${b.alpha * 0.4})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, r), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    const start = performance.now();

    if (reduce) {
      curHue = hueRef.current;
      paint(8);
      const onResize = () => {
        resize();
        paint(8);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const frame = (now: number) => {
      const tt = (now - start) / 1000;
      curHue += (hueRef.current - curHue) * 0.04;
      paint(tt);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={`${styles.layer} ${className ?? ""}`} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.veil} />
    </div>
  );
}
