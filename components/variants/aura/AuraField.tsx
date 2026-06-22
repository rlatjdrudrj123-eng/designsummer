"use client";

import { useEffect, useRef } from "react";

/**
 * AuraField — the soft, frosted, drifting multicolor aura ground for a section.
 *
 * A Canvas 2D + rAF field of a few large, heavily-blurred radial blobs that
 * slowly drift, swell and rotate around the canvas. No libraries: the blur is
 * done with `ctx.filter = "blur(...)"` plus `globalCompositeOperation = "lighter"`
 * so overlapping blobs bloom into a luminous frosted-glass wash. The result is
 * intentionally low-frequency and dreamy — it sits BEHIND tonal display type
 * that is filled with a gradient near the ground hue, so the type half-melts
 * into it.
 *
 * `hue` (0..1) interpolates the palette between the two day moods:
 *   0 → DAY 1 mood (lime/green + violet)
 *   1 → DAY 2 mood (magenta/red + orange)
 * The hook eases the live hue toward the prop so a section change drifts the
 * whole aura rather than cutting.
 *
 * prefers-reduced-motion: paints one static frame and stops (no rAF loop).
 */

type Blob = {
  // base position (0..1 of canvas), drift phase + speed, radius (0..1 of min dim)
  bx: number;
  by: number;
  ax: number; // drift amplitude x
  ay: number; // drift amplitude y
  sx: number; // drift speed x
  sy: number; // drift speed y
  phx: number;
  phy: number;
  r: number;
  rPulse: number; // radius pulse amount
  rSpeed: number;
  // two-stop color: [day1 rgb, day2 rgb] — picked by hue mix
  c1: [number, number, number];
  c2: [number, number, number];
  alpha: number;
};

// DAY 1 palette: lime / green / violet. DAY 2 palette: magenta / red / orange.
const BLOBS: Blob[] = [
  {
    bx: 0.26, by: 0.34, ax: 0.10, ay: 0.08, sx: 0.043, sy: 0.031, phx: 0.0, phy: 1.7,
    r: 0.62, rPulse: 0.10, rSpeed: 0.05,
    c1: [150, 235, 120], c2: [255, 70, 140], alpha: 0.9,
  },
  {
    bx: 0.74, by: 0.30, ax: 0.09, ay: 0.10, sx: 0.037, sy: 0.047, phx: 2.1, phy: 0.4,
    r: 0.55, rPulse: 0.12, rSpeed: 0.061, c1: [90, 200, 110], c2: [255, 120, 60], alpha: 0.85,
  },
  {
    bx: 0.5, by: 0.72, ax: 0.12, ay: 0.07, sx: 0.029, sy: 0.039, phx: 3.4, phy: 2.6,
    r: 0.7, rPulse: 0.09, rSpeed: 0.044, c1: [150, 110, 235], c2: [220, 40, 90], alpha: 0.8,
  },
  {
    bx: 0.18, by: 0.78, ax: 0.08, ay: 0.09, sx: 0.051, sy: 0.027, phx: 1.2, phy: 4.1,
    r: 0.48, rPulse: 0.13, rSpeed: 0.07, c1: [210, 255, 150], c2: [255, 160, 90], alpha: 0.75,
  },
  {
    bx: 0.84, by: 0.74, ax: 0.07, ay: 0.08, sx: 0.045, sy: 0.035, phx: 5.0, phy: 0.9,
    r: 0.5, rPulse: 0.11, rSpeed: 0.052, c1: [120, 190, 230], c2: [255, 90, 60], alpha: 0.7,
  },
];

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function AuraField({
  hue,
  className,
}: {
  hue: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hueRef = useRef(hue);

  // keep the latest target hue available to the rAF loop without re-subscribing
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
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // live (eased) hue so a prop change drifts the whole aura rather than cuts
    let curHue = hueRef.current;

    const paint = (t: number) => {
      const minDim = Math.min(w, h);
      // soft frosted base wash so the blobs sit on a tinted, not black, ground
      const baseTop = curHue < 0.5 ? "#0c1410" : "#15080e";
      const baseBot = curHue < 0.5 ? "#0a0f14" : "#120612";
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, baseTop);
      bg.addColorStop(1, baseBot);
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // additive, heavily blurred blobs → frosted luminous aura
      ctx.globalCompositeOperation = "lighter";
      const blurPx = Math.max(40, minDim * 0.14);
      ctx.filter = `blur(${blurPx}px)`;

      for (const b of BLOBS) {
        const x =
          (b.bx + Math.sin(t * b.sx + b.phx) * b.ax) * w;
        const y =
          (b.by + Math.cos(t * b.sy + b.phy) * b.ay) * h;
        const r =
          minDim * (b.r + Math.sin(t * b.rSpeed + b.phx) * b.rPulse) * 0.8;
        const cr = Math.round(mix(b.c1[0], b.c2[0], curHue));
        const cg = Math.round(mix(b.c1[1], b.c2[1], curHue));
        const cb = Math.round(mix(b.c1[2], b.c2[2], curHue));
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${b.alpha})`);
        g.addColorStop(0.55, `rgba(${cr},${cg},${cb},${b.alpha * 0.35})`);
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
    let start = performance.now();

    if (reduce) {
      // static frame at the current target hue
      curHue = hueRef.current;
      paint(8); // a fixed, pleasing time offset
      const onResize = () => {
        resize();
        paint(8);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const frame = (now: number) => {
      const t = (now - start) / 1000;
      // ease live hue toward the target → section change drifts the aura
      curHue += (hueRef.current - curHue) * 0.04;
      paint(t);
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

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
