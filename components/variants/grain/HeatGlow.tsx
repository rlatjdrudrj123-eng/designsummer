"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Grain.module.css";

/**
 * The whole identity of this variant: heavy DARK near-black grotesque letters
 * that sit on a GRADIENT-MAP HEAT FIELD, so a soft airbrushed chromatic glow
 * (cool BLUE → MAGENTA/RED → ORANGE) bleeds OUT from behind and around every
 * letter, spilling past the letter edges.
 *
 * Implementation (Canvas2D):
 *   1. Render the text once to a mask canvas.
 *   2. Paint a diagonal blue→magenta→red→orange heat gradient, masked to that
 *      text shape, then BLUR it hard and draw it several times slightly grown —
 *      this is the colour that leaks beyond the silhouette.
 *   3. Paint the crisp dark text on top so it stays perfectly legible.
 *
 * The component measures its own box (set by CSS font-size/letter-spacing on
 * the host element) and renders the canvas to match, so the glow tracks the
 * real type scale and stays responsive. A hidden, real <span> carries the text
 * for screen readers and selection; the canvas is aria-hidden.
 *
 * Static paint (no rAF) — nothing to gate for prefers-reduced-motion.
 */

type Line = string;

export default function HeatGlow({
  lines,
  className = "",
  /** css font-size in px at render time is read from the host element */
  weight = 800,
  /** glow intensity multiplier (hero title gets the strongest) */
  intensity = 1,
  lineGap = 0.86,
  as = "div",
  id,
  label,
}: {
  lines: Line[];
  className?: string;
  weight?: number;
  intensity?: number;
  lineGap?: number;
  as?: "div" | "h1" | "h2" | "h3";
  id?: string;
  /** accessible text; defaults to joined lines */
  label?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    let painted = false;

    const render = () => {
      if (cancelled) return;
      const cs = getComputedStyle(host);
      const fontSize = parseFloat(cs.fontSize) || 80;
      const family = cs.fontFamily || "sans-serif";
      const tracking = parseFloat(cs.letterSpacing) || 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const lineHeight = fontSize * (lineGap + 0.18);

      const font = `${weight} ${fontSize}px ${family}`;
      ctx.font = font;

      // measure widest line (including tracking)
      const measure = (t: string) => {
        const base = ctx.measureText(t).width;
        return base + Math.max(0, t.length - 1) * tracking;
      };
      let maxW = 0;
      for (const ln of lines) maxW = Math.max(maxW, measure(ln));

      // padding so the blurred glow has room to bleed past the glyphs
      const pad = fontSize * 0.55 * intensity + 24;
      // guard against a 0-width measurement (e.g. font not ready / display:none
      // host): fall back to an estimate so the canvas is never sized 0 and the
      // title never silently disappears.
      const safeMaxW = maxW > 1 ? maxW : fontSize * 0.6 * Math.max(...lines.map((l) => l.length), 1);
      const cssW = Math.max(1, Math.ceil(safeMaxW + pad * 2));
      const cssH = Math.max(1, Math.ceil(lineHeight * lines.length + pad * 1.4));

      // cap pixel dimensions so an absurd measurement can't blow past canvas
      // limits and throw / produce a blank surface.
      const MAX = 8192;
      canvas.width = Math.min(MAX, Math.floor(cssW * dpr));
      canvas.height = Math.min(MAX, Math.floor(cssH * dpr));
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const drawText = (
        c: CanvasRenderingContext2D,
        fillStyle: string | CanvasGradient,
      ) => {
        c.font = font;
        c.textAlign = "left";
        c.textBaseline = "alphabetic";
        c.fillStyle = fillStyle;
        lines.forEach((ln, i) => {
          const y = pad * 0.9 + lineHeight * i + fontSize * 0.82;
          if (tracking) {
            let x = pad;
            for (const ch of ln) {
              c.fillText(ch, x, y);
              x += c.measureText(ch).width + tracking;
            }
          } else {
            c.fillText(ln, pad, y);
          }
        });
      };

      // ---- glow layer: gradient masked to the text, blurred, on offscreen ----
      const glow = document.createElement("canvas");
      glow.width = canvas.width;
      glow.height = canvas.height;
      const gctx = glow.getContext("2d");
      if (gctx) {
        gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // diagonal heat gradient: cool blue -> magenta -> red -> orange
        const grad = gctx.createLinearGradient(0, 0, cssW, cssH);
        grad.addColorStop(0, "#3a5cff");
        grad.addColorStop(0.28, "#8a3bff");
        grad.addColorStop(0.52, "#e8266a");
        grad.addColorStop(0.74, "#ff5a2e");
        grad.addColorStop(1, "#ffaa2e");
        // text shape -> then source-in the gradient over it
        drawText(gctx, "#000");
        gctx.globalCompositeOperation = "source-in";
        gctx.fillStyle = grad;
        gctx.fillRect(0, 0, cssW, cssH);
        gctx.globalCompositeOperation = "source-over";

        const supportsFilter =
          typeof (ctx as CanvasRenderingContext2D & { filter?: string })
            .filter !== "undefined";
        const baseBlur = fontSize * 0.16 * intensity;

        // draw the masked gradient several times, growing + blurring, so colour
        // spills well beyond the letter edges as a soft airbrushed halo
        const passes = [
          { blur: baseBlur * 2.4, scale: 1.14, alpha: 0.5 },
          { blur: baseBlur * 1.5, scale: 1.07, alpha: 0.7 },
          { blur: baseBlur * 0.8, scale: 1.0, alpha: 0.95 },
        ];
        for (const p of passes) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, p.alpha * intensity);
          if (supportsFilter) {
            (ctx as CanvasRenderingContext2D & { filter: string }).filter =
              `blur(${p.blur}px)`;
          }
          // scale around centre to grow the halo
          const cx = cssW / 2;
          const cy = cssH / 2;
          ctx.translate(cx, cy);
          ctx.scale(p.scale, p.scale);
          ctx.translate(-cx, -cy);
          ctx.drawImage(glow, 0, 0, cssW, cssH);
          ctx.restore();
        }
      }

      // ---- crisp dark face on top ----
      ctx.save();
      ctx.globalAlpha = 1;
      const supportsFilter =
        typeof (ctx as CanvasRenderingContext2D & { filter?: string }).filter !==
        "undefined";
      if (supportsFilter) {
        (ctx as CanvasRenderingContext2D & { filter: string }).filter = "none";
      }
      drawText(ctx, "#181410");
      ctx.restore();

      painted = true;
      setReady(true);
    };

    // Robust render scheduler. Visibility must NOT hinge on a promise that can
    // hang: we paint immediately on the next frame (with whatever font is
    // available), repaint once the webfont resolves for correct metrics, and
    // arm a timeout fallback in case `fonts.ready` never settles.
    const safeRender = () => {
      try {
        render();
      } catch {
        // even if drawing failed, reveal the canvas so the (hidden) a11y text
        // is not the only thing present and the masthead box isn't a void.
        if (!cancelled) setReady(true);
      }
    };

    // 1) paint ASAP so the title is visible without waiting on fonts
    requestAnimationFrame(() => requestAnimationFrame(safeRender));

    // 2) repaint with correct metrics when the scoped webfont is ready
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts && fonts.ready) {
      fonts.ready.then(() => {
        requestAnimationFrame(() => requestAnimationFrame(safeRender));
      });
    }

    // 3) hard fallback: if nothing painted within 1.2s (font promise hung,
    //    rAF starved), force a render so the title can never stay invisible.
    const fallback = window.setTimeout(() => {
      if (!painted && !cancelled) safeRender();
    }, 1200);

    let rt = 0;
    const onResize = () => {
      cancelAnimationFrame(rt);
      rt = requestAnimationFrame(safeRender);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rt);
    };
  }, [lines, weight, intensity, lineGap]);

  const Tag = as;
  const text = label ?? lines.join(" ");

  return (
    <Tag id={id} className={`${styles.heat} ${className}`} aria-label={text}>
      {/* measurement host: CSS sets font-size/letter-spacing, kept invisible */}
      <span ref={hostRef} className={styles.heatMeasure} aria-hidden="true">
        {lines[0]}
      </span>
      <canvas
        ref={canvasRef}
        className={`${styles.heatCanvas} ${ready ? styles.heatReady : ""}`}
        aria-hidden="true"
      />
      {/* accessible fallback text (visually hidden, real for SR/SEO) */}
      <span className={styles.heatA11y}>{text}</span>
    </Tag>
  );
}
