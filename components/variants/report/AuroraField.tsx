"use client";

import { useEffect, useRef } from "react";
import styles from "./AuroraField.module.css";

/* AuroraField — a soft, blurry, full-bleed IRIDESCENT AURORA GRADIENT painted
   on Canvas2D. Several large, slowly-drifting luminous radial blobs in an
   iridescent scheme, additively layered then blurred so they read as a dreamy
   airbrushed field. Bright, NOT dark. The scheme is passed in so DAY-1 and
   DAY-2 fields can shift hue. rAF animates a gentle drift; prefers-reduced-
   motion paints a single static frame. */

export type Blob = {
  /** base position in 0..1 of the canvas */
  x: number;
  y: number;
  /** base radius as a fraction of the diagonal */
  r: number;
  color: [number, number, number];
  /** drift amplitude (fraction of canvas) + per-blob phase */
  ax: number;
  ay: number;
  phase: number;
  speed: number;
};

/** A few ready-made iridescent schemes. Saturated, luminous airbrush hues —
   vivid green/teal/blue/magenta/orange like the reference, NOT pale pastels. */
export const SCHEMES: Record<string, [number, number, number][]> = {
  // vivid green -> teal -> electric blue -> magenta -> hot orange  (DAY 1 / hero)
  spectral: [
    [54, 224, 132],
    [38, 198, 214],
    [52, 122, 250],
    [150, 92, 248],
    [248, 78, 196],
    [255, 168, 64],
  ],
  // saturated orange -> hot pink -> red -> violet -> teal accent  (DAY 2)
  ember: [
    [255, 150, 56],
    [255, 78, 120],
    [240, 58, 88],
    [200, 72, 230],
    [128, 92, 248],
    [40, 206, 196],
  ],
};

function buildBlobs(scheme: [number, number, number][]): Blob[] {
  // deterministic layout (no Math.random → SSR-stable, calm composition)
  const layout: [number, number, number, number, number, number][] = [
    // x,    y,    r,    ax,    ay,    speed
    [0.18, 0.24, 0.62, 0.05, 0.04, 0.18],
    [0.82, 0.2, 0.55, 0.06, 0.05, 0.23],
    [0.7, 0.78, 0.68, 0.05, 0.06, 0.15],
    [0.28, 0.82, 0.58, 0.07, 0.04, 0.2],
    [0.52, 0.46, 0.72, 0.04, 0.05, 0.12],
    [0.92, 0.62, 0.5, 0.06, 0.05, 0.27],
  ];
  return layout.map((l, i) => ({
    x: l[0],
    y: l[1],
    r: l[2],
    ax: l[3],
    ay: l[4],
    speed: l[5],
    color: scheme[i % scheme.length],
    phase: i * 1.7,
  }));
}

export default function AuroraField({
  scheme = "spectral",
}: {
  scheme?: keyof typeof SCHEMES;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cv = canvas;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const blobs = buildBlobs(SCHEMES[scheme] ?? SCHEMES.spectral);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    const parent = cv.parentElement as HTMLElement;

    function resize() {
      const rect = parent.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function paint(t: number) {
      const diag = Math.hypot(w, h);
      // DEEP saturated base (not pastel): a darker, richer ground so the vivid
      // blobs build real depth and glow on top instead of washing to milk.
      ctx!.globalCompositeOperation = "source-over";
      const base = ctx!.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, "#0d6b52"); // deep emerald
      base.addColorStop(0.45, "#173a9c"); // deep electric blue
      base.addColorStop(0.78, "#5a248f"); // deep violet
      base.addColorStop(1, "#9c1f6e"); // deep magenta
      ctx!.fillStyle = base;
      ctx!.fillRect(0, 0, w, h);

      // Iridescent blobs in normal "source-over" at near-full alpha so the
      // colour reads vibrant and saturated; large soft falloff keeps it dreamy.
      ctx!.globalCompositeOperation = "source-over";
      for (const b of blobs) {
        const dx = reduce ? 0 : Math.sin(t * b.speed + b.phase) * b.ax;
        const dy = reduce ? 0 : Math.cos(t * b.speed * 0.8 + b.phase) * b.ay;
        const cx = (b.x + dx) * w;
        const cy = (b.y + dy) * h;
        const rad = b.r * diag * 0.72;
        const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const [r, gr, bl] = b.color;
        g.addColorStop(0, `rgba(${r},${gr},${bl},0.98)`);
        g.addColorStop(0.45, `rgba(${r},${gr},${bl},0.62)`);
        g.addColorStop(1, `rgba(${r},${gr},${bl},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx!.fill();
      }

      // an ADDITIVE glow pass pushes luminosity + saturation into the cores so
      // the field feels lit-from-within like the reference's airbrushed light.
      ctx!.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const dx = reduce ? 0 : Math.sin(t * b.speed + b.phase) * b.ax;
        const dy = reduce ? 0 : Math.cos(t * b.speed * 0.8 + b.phase) * b.ay;
        const cx = (b.x + dx) * w;
        const cy = (b.y + dy) * h;
        const rad = b.r * diag * 0.5;
        const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const [r, gr, bl] = b.color;
        g.addColorStop(0, `rgba(${r},${gr},${bl},0.55)`);
        g.addColorStop(0.5, `rgba(${r},${gr},${bl},0.18)`);
        g.addColorStop(1, `rgba(${r},${gr},${bl},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalCompositeOperation = "source-over";
    }

    function frame(now: number) {
      if (!running) return;
      paint(now / 1000);
      raf = requestAnimationFrame(frame);
    }

    resize();
    if (reduce) {
      paint(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) paint(0);
    });
    ro.observe(parent);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [scheme]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
