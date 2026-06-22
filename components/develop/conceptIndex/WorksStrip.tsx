"use client";

import { useEffect, useRef } from "react";
import styles from "./IndexLineup.module.css";
import { showcaseImages } from "@/lib/images";

/**
 * WorksStrip — a small "works thumbnail strip" rendered with Canvas 2D only
 * (no <img> photo cards, no libraries) so the typographic index stays type-led
 * and the only color comes from the warm aura + tonal ink.
 *
 * When a speaker has uploaded showcase images we draw them into the canvas
 * (cover-fit tiles, rounded via clip). When there are none yet — the usual
 * pre-upload state — we draw warm tonal placeholder tiles tinted by the row's
 * resolved --accent (a numbered swatch strip), so the strip still reads as a
 * tidy archive of "works" without any external asset.
 *
 * Drawing is a single static paint (no rAF loop) re-run on resize / DPR change;
 * the expand/collapse motion itself is CSS. prefers-reduced-motion changes
 * nothing here (a static paint is already motion-free).
 */
export default function WorksStrip({
  id,
  open,
  accent,
}: {
  id: string;
  /** parent row expanded — only paint when visible to avoid wasted work */
  open: boolean;
  /** resolved warm accent (rgb string) used to tint placeholder tiles */
  accent: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgsRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const urls = showcaseImages(id);
    const TILE = 84; // logical tile size
    const GAP = 8;
    const COUNT = urls.length > 0 ? Math.min(urls.length, 5) : 5;

    const paintTile = (
      x: number,
      tw: number,
      th: number,
      i: number,
      img?: HTMLImageElement
    ) => {
      const r = 10;
      ctx.save();
      // rounded rect clip
      ctx.beginPath();
      ctx.moveTo(x + r, 0);
      ctx.arcTo(x + tw, 0, x + tw, th, r);
      ctx.arcTo(x + tw, th, x, th, r);
      ctx.arcTo(x, th, x, 0, r);
      ctx.arcTo(x, 0, x + tw, 0, r);
      ctx.closePath();
      ctx.clip();

      if (img && img.complete && img.naturalWidth > 0) {
        // cover-fit
        const s = Math.max(tw / img.naturalWidth, th / img.naturalHeight);
        const dw = img.naturalWidth * s;
        const dh = img.naturalHeight * s;
        ctx.drawImage(img, x + (tw - dw) / 2, (th - dh) / 2, dw, dh);
      } else {
        // warm tonal placeholder swatch, tinted by the row accent
        const g = ctx.createLinearGradient(x, 0, x + tw, th);
        g.addColorStop(0, withAlpha(accent, 0.16 + (i % 3) * 0.05));
        g.addColorStop(1, withAlpha(accent, 0.34 + (i % 3) * 0.05));
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, tw, th);
        // numbered hairline label
        ctx.fillStyle = withAlpha(accent, 0.85);
        ctx.font =
          "600 11px ui-sans-serif, system-ui, 'Instrument Sans', sans-serif";
        ctx.textBaseline = "top";
        ctx.fillText(String(i + 1).padStart(2, "0"), x + 8, 8);
      }
      ctx.restore();
    };

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = COUNT * TILE + (COUNT - 1) * GAP;
      const cssH = TILE;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      for (let i = 0; i < COUNT; i++) {
        const x = i * (TILE + GAP);
        paintTile(x, TILE, cssH, i, imgsRef.current[i]);
      }
    };

    // load any real images, then repaint as each arrives
    imgsRef.current = [];
    urls.slice(0, COUNT).forEach((u, i) => {
      const im = new Image();
      im.onload = draw;
      im.src = u;
      imgsRef.current[i] = im;
    });

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [id, open, accent]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.worksCanvas}
      aria-hidden="true"
    />
  );
}

/** "rgb(r,g,b)" + alpha -> "rgba(r,g,b,a)" (accent is always rgb(...) here). */
function withAlpha(rgb: string, a: number): string {
  const m = rgb.match(/rgb\(([^)]+)\)/);
  if (!m) return rgb;
  return `rgba(${m[1]}, ${a})`;
}
