"use client";

import { useEffect, useRef } from "react";
import styles from "./Grain.module.css";

/**
 * Fine scattered DUST / SPECKLE grain painted onto a Canvas, the way a
 * photocopied or scanned designer-freebie poster looks: thousands of tiny dark
 * AND light specks sprinkled everywhere over the cream paper. Subtle but present
 * across the whole page.
 *
 * The texture is generated ONCE into an offscreen tile and tiled via the canvas
 * pattern, so it is cheap and static (no per-frame work). It sits fixed behind
 * all content (see .speckle in the stylesheet) and is purely decorative.
 *
 * No animation, so prefers-reduced-motion needs no special handling here.
 */
export default function Speckle() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Build a seamless speckle TILE once.
    const TILE = 220;
    const tile = document.createElement("canvas");
    tile.width = TILE;
    tile.height = TILE;
    const tctx = tile.getContext("2d");
    if (!tctx) return;

    // deterministic PRNG so SSR/CSR feel consistent and it never "boils"
    let seed = 1337;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const drawSpecks = (n: number, dark: boolean) => {
      for (let i = 0; i < n; i++) {
        const x = rnd() * TILE;
        const y = rnd() * TILE;
        const r = rnd() * 0.9 + 0.18;
        const a = rnd() * (dark ? 0.4 : 0.5) + 0.05;
        tctx.beginPath();
        tctx.fillStyle = dark
          ? `rgba(38,30,24,${a})`
          : `rgba(255,252,244,${a})`;
        tctx.arc(x, y, r, 0, Math.PI * 2);
        tctx.fill();
      }
    };
    // dark dust on top, light dust catching the "paper tooth"
    drawSpecks(2600, true);
    drawSpecks(1400, false);

    let raf = 0;
    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const pat = ctx.createPattern(tile, "repeat");
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, w, h);
      }
    };

    paint();
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className={styles.speckle} aria-hidden="true" />;
}
