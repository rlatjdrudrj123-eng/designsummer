"use client";

import { useEffect, useRef } from "react";
import styles from "./Grain.module.css";

/**
 * The reference poster's HERO VISUAL: a big, heavily-BLURRED / airbrushed
 * multi-point GRADIENT STAR. Colour is a HEAT-MAP gradient — an outer BLUE ring
 * fading inward through RED → ORANGE → YELLOW to a near-WHITE core. Edges are
 * soft and glowing; there are no hard outlines, so it reads as a dreamy
 * chromatic airbrush smudge rather than a crisp icon.
 *
 * Drawn on Canvas2D: a radial heat gradient is clipped to an N-point star path,
 * then the whole thing is blurred (canvas filter, with a layered re-draw
 * fallback) so even the silhouette stays soft. A slow rAF rotation gives it a
 * gentle living drift; this is disabled when prefers-reduced-motion is set.
 *
 * Decorative only — always aria-hidden.
 */
export default function GradientStar({
  className = "",
  points = 8,
  spin = true,
}: {
  className?: string;
  /** spike count of the star burst */
  points?: number;
  /** allow slow idle rotation (off for small reused accents) */
  spin?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let size = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      size = Math.max(rect.width, rect.height) || 300;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
    };

    const supportsFilter =
      typeof (ctx as CanvasRenderingContext2D & { filter?: string }).filter !==
      "undefined";

    const draw = (rot: number) => {
      const px = size * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, px, px);
      const c = px / 2;
      const outer = px * 0.46;
      const inner = px * 0.16;

      // soft heat-map backing bloom (blue ring → orange → white core)
      const bloom = ctx.createRadialGradient(c, c, 0, c, c, outer * 1.15);
      bloom.addColorStop(0, "rgba(255,255,245,0.95)");
      bloom.addColorStop(0.18, "rgba(255,231,150,0.85)");
      bloom.addColorStop(0.42, "rgba(255,138,46,0.7)");
      bloom.addColorStop(0.68, "rgba(232,46,58,0.55)");
      bloom.addColorStop(0.86, "rgba(86,82,230,0.4)");
      bloom.addColorStop(1, "rgba(43,61,240,0)");
      ctx.save();
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(c, c, outer * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // the star burst, filled with the same heat gradient, softly blurred
      const blur = px * 0.045;
      ctx.save();
      if (supportsFilter) {
        (ctx as CanvasRenderingContext2D & { filter: string }).filter =
          `blur(${blur}px)`;
      }
      ctx.translate(c, c);
      ctx.rotate(rot);
      ctx.beginPath();
      const step = Math.PI / points;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = i * step - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, outer);
      grad.addColorStop(0, "#fffef2");
      grad.addColorStop(0.16, "#ffe796");
      grad.addColorStop(0.36, "#ff8a2e");
      grad.addColorStop(0.6, "#e82e3a");
      grad.addColorStop(0.82, "#7a4ff0");
      grad.addColorStop(1, "#2b3df0");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    };

    resize();
    if (reduce || !spin) {
      draw(0);
    } else {
      let r = 0;
      const loop = () => {
        r += 0.0016;
        draw(r);
        raf = requestAnimationFrame(loop);
      };
      loop();
    }

    const onResize = () => {
      resize();
      draw(0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [points, spin]);

  return <canvas ref={ref} className={`${styles.star} ${className}`} aria-hidden="true" />;
}
