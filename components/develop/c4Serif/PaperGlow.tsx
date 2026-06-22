"use client";

import { useEffect, useRef } from "react";
import styles from "./SerifPage.module.css";

/* PaperGlow — a calm, slow Canvas2D ambient: two large soft warm light pools
   that drift like sun through linen. Deliberately quiet (low alpha, very slow)
   to match the luxury-calm editorial tone, never loud. Honors
   prefers-reduced-motion: paints one static frame and stops. DPR-aware. */
export default function PaperGlow() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pools = [
      { x: 0.28, y: 0.32, r: 0.62, c: "255,196,140", a: 0.32, sp: 0.00006, ph: 0 },
      { x: 0.74, y: 0.66, r: 0.7, c: "240,150,120", a: 0.22, sp: 0.00004, ph: 2.1 },
    ];

    const paint = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pools) {
        const dx = reduce ? 0 : Math.sin(t * p.sp + p.ph) * 0.05;
        const dy = reduce ? 0 : Math.cos(t * p.sp * 0.8 + p.ph) * 0.04;
        const cx = (p.x + dx) * w;
        const cy = (p.y + dy) * h;
        const rad = p.r * Math.max(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${p.c},${p.a})`);
        g.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    };

    let raf = 0;
    if (reduce) {
      paint(0);
    } else {
      const loop = (t: number) => {
        paint(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      if (reduce) paint(0);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className={styles.glowCanvas} aria-hidden />;
}
