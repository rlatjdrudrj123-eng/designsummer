"use client";

import { useEffect, useRef } from "react";
import styles from "./Halftone.module.css";

type Props = {
  /** dot ink color, rgba/hex */
  color?: string;
  /** dot grid spacing in px */
  spacing?: number;
  /** max dot radius as fraction of spacing (0..0.5) */
  scale?: number;
  /** gradient direction: dots grow toward this side */
  from?: "top" | "bottom" | "left" | "right" | "radial";
  className?: string;
};

/* A static (single-paint) halftone dot field rendered to Canvas2D.
 * Dot radius is modulated by a gradient so the field reads as a printed
 * tone ramp. No animation loop — paints once and on resize. This honours
 * prefers-reduced-motion automatically (nothing moves) while giving the
 * tactile riso-print tone the concept needs. Decorative only (aria-hidden).
 */
export default function Halftone({
  color = "rgba(20,30,90,0.9)",
  spacing = 9,
  scale = 0.46,
  from = "bottom",
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const paint = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;

      const maxR = spacing * scale;
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.hypot(cx, cy) || 1;

      for (let y = spacing / 2; y < h; y += spacing) {
        for (let x = spacing / 2; x < w; x += spacing) {
          let t: number; // 0..1 tone
          switch (from) {
            case "top":
              t = 1 - y / h;
              break;
            case "bottom":
              t = y / h;
              break;
            case "left":
              t = 1 - x / w;
              break;
            case "right":
              t = x / w;
              break;
            default: // radial
              t = 1 - Math.hypot(x - cx, y - cy) / maxDist;
          }
          t = Math.max(0, Math.min(1, t));
          const r = maxR * t;
          if (r < 0.35) continue;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };

    schedule();
    const ro = new ResizeObserver(schedule);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color, spacing, scale, from]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`${styles.canvas} ${className ?? ""}`}
    />
  );
}
