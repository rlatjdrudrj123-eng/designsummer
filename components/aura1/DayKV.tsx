"use client";

/* ============================================================================
 * Aura1 DayKV — per-day KEY VISUAL accent for the Lineup day-intro header.
 *
 * The client wants the HERO's actual living EFFECT here — a warm Canvas2D
 * HEAT-FIELD blob, NOT a flat SVG line drawing. So this is the same effect
 * family as the hero (components/develop/HeatBlob) and the develop
 * ConceptHeat: a low-res field of gaussian heat sources, domain-warped by
 * value-noise, sampled through a warm color ramp and upscaled smooth — driven
 * by requestAnimationFrame, with the hero's cursor "잔열" (residual heat trail).
 *
 * Per-day FORM (identical to develop ConceptHeat's D1/D2 forms):
 *   Day 1 — RIPPLE / 원 파동: a breathing core with concentric heat rings
 *           radiating outward (HEAT SOURCE / 열원).
 *   Day 2 — ARROW EXPANSION / 화살표 확장: two diagonal heat arrows (↗ ↙)
 *           expanding outward from the center (HEAT TRANSFER / 전사).
 *
 * Per-day COLOR — the shared heat-field LUT (content/heat-field.json) is a
 * single gold→red-orange ramp, NOT day-toned. So instead of that LUT this KV
 * builds its OWN warm ramp at runtime per day (so the field reads on-tone):
 *   Day 1 → warm RED ramp   (cream → --ds-red → --ds-red-deep)
 *   Day 2 → warm GOLD ramp  (cream → --ds-gold → --ds-gold-deep)
 * Both ramps fade alpha in from transparent at the cool end so the blob floats
 * (no box), matching the hero's soft-glow aesthetic.
 *
 * Math (noise / fbm / domain warp / gaussian field / low-res upscale / cursor
 * trail) mirrors components/develop/ConceptHeat.tsx so it is the SAME effect.
 *
 * prefers-reduced-motion: the field is rendered as a single static frame
 * (no ripple expansion, no arrow breathing, no cursor trail, no drift).
 * ========================================================================== */

import { useEffect, useRef } from "react";
import field from "@/content/heat-field.json";
import styles from "./DayKV.module.css";

const FREQ = field.freq;
const WARP_AMP = field.portrait.warp.amp;
const WARP_SEED = field.portrait.warp.seed;
const TRAIL_MS = 1000;
const TRAIL_MIN_DIST = 22;
const M = 0.16; // edge fade — keeps the blob floating, not boxed
const TAU = Math.PI * 2;

/* ── value-noise / fbm (identical to develop ConceptHeat & HeatBlob) ── */
function rand2(ix: number, iy: number, seed: number) {
  let n = (ix * 73856093) ^ (iy * 19349663) ^ (seed * 83492791);
  n = (n << 13) ^ n;
  return (
    1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824
  );
}
function vnoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x),
    y0 = Math.floor(y);
  const fx = x - x0,
    fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx),
    sy = fy * fy * (3 - 2 * fy);
  const n00 = rand2(x0, y0, seed),
    n10 = rand2(x0 + 1, y0, seed),
    n01 = rand2(x0, y0 + 1, seed),
    n11 = rand2(x0 + 1, y0 + 1, seed);
  const a = n00 + (n10 - n00) * sx,
    b = n01 + (n11 - n01) * sx;
  return a + (b - a) * sy;
}
function fbm(x: number, y: number, seed: number) {
  return vnoise(x, y, seed) * 0.667 + vnoise(x * 2, y * 2, seed + 101) * 0.333;
}

/* ── Per-day warm color ramp (256 × RGBA), built once.
   Stops: cool cream (transparent) → warm mid → hot deep tone (opaque).
   Day1 = RED family, Day2 = GOLD family. Alpha eases in so the field floats. */
type Stop = { p: number; r: number; g: number; b: number; a: number };
const RAMP_D1: Stop[] = [
  { p: 0.0, r: 254, g: 244, b: 223, a: 0 },
  { p: 0.18, r: 255, g: 214, b: 150, a: 200 },
  { p: 0.45, r: 255, g: 122, b: 40, a: 255 }, // toward --ds-red
  { p: 0.72, r: 255, g: 77, b: 0, a: 255 }, // --ds-red #ff4d00
  { p: 1.0, r: 224, g: 50, b: 0, a: 255 }, // --ds-red-deep #e03200
];
const RAMP_D2: Stop[] = [
  { p: 0.0, r: 254, g: 246, b: 224, a: 0 },
  { p: 0.2, r: 253, g: 230, b: 170, a: 200 },
  { p: 0.5, r: 250, g: 196, b: 80, a: 255 },
  { p: 0.75, r: 245, g: 158, b: 0, a: 255 }, // --ds-gold #f59e00
  { p: 1.0, r: 217, g: 148, b: 0, a: 255 }, // --ds-gold-deep #d99400
];
function buildLut(stops: Stop[]) {
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = stops[0],
      b = stops[stops.length - 1];
    for (let k = 0; k < stops.length - 1; k++) {
      if (t >= stops[k].p && t <= stops[k + 1].p) {
        a = stops[k];
        b = stops[k + 1];
        break;
      }
    }
    const span = b.p - a.p || 1;
    const f = (t - a.p) / span;
    const o = i * 4;
    lut[o] = a.r + (b.r - a.r) * f;
    lut[o + 1] = a.g + (b.g - a.g) * f;
    lut[o + 2] = a.b + (b.b - a.b) * f;
    lut[o + 3] = a.a + (b.a - a.a) * f;
  }
  return lut;
}

export default function DayKV({ day }: { day: 1 | 2 }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const LUT = buildLut(day === 1 ? RAMP_D1 : RAMP_D2);

    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d") as CanvasRenderingContext2D;

    let w = 0,
      h = 0,
      bw = 0,
      bh = 0,
      ar = 1;
    let img: ImageData | null = null;
    let warpX = new Float32Array(0);
    let warpY = new Float32Array(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      ar = w / h;
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      // Low-res buffer (header accent → keep it tiny & cheap), upscaled smooth.
      bw = Math.max(48, Math.min(120, Math.round(w / 2)));
      bh = Math.max(1, Math.round(bw / ar));
      buf.width = bw;
      buf.height = bh;
      img = bctx.createImageData(bw, bh);
      warpX = new Float32Array(bw * bh);
      warpY = new Float32Array(bw * bh);
      // D2 arrows must stay legible → weaker warp (edges only); D1 freer.
      const amp = day === 2 ? WARP_AMP * 0.4 : WARP_AMP;
      for (let y = 0; y < bh; y++) {
        const v = (y + 0.5) / bh;
        for (let x = 0; x < bw; x++) {
          const u = (x + 0.5) / bw;
          const i = y * bw + x;
          warpX[i] = u + amp * fbm(u * FREQ, v * FREQ, WARP_SEED);
          warpY[i] =
            v + amp * fbm(u * FREQ + 3.7, v * FREQ + 1.9, WARP_SEED + 777);
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Cursor heat source (hero's 잔열 — residual decay trail).
    type Cur = { x: number; y: number; t: number };
    const trail: Cur[] = [];
    let last: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px < 0 || py < 0 || px > w || py > h) {
        last = null;
        return;
      }
      const x = px / w;
      const y = py / h;
      if (!last || Math.hypot(x - last.x, y - last.y) > TRAIL_MIN_DIST / w) {
        trail.push({ x, y, t: performance.now() });
        if (trail.length > 24) trail.shift();
        last = { x, y };
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const start = performance.now();

    const render = (now: number) => {
      const t = now - start;

      // Per-day animated form (same structure as develop ConceptHeat).
      let core = 1;
      const rings: { R: number; st: number; sig: number }[] = [];
      const lobes: { x: number; y: number; sig: number; st: number }[] = [];

      if (day === 1) {
        // HEAT SOURCE — breathing core + concentric rings radiating outward.
        core = reduce ? 1 : 1 + 0.06 * Math.sin((t / 1500) * TAU);
        const NR = 3;
        for (let i = 0; i < NR; i++) {
          const phase = reduce ? (i + 0.5) / NR : (t / 4200 + i / NR) % 1;
          rings.push({
            R: 0.1 + phase * 0.4,
            st: 0.6 * (1 - phase) * (0.4 + phase),
            sig: 0.045,
          });
        }
      } else {
        // HEAT TRANSFER = expansion — two diagonal arrows (↗ ↙) spreading out.
        const C = 0.5;
        const k = 0.7071;
        const pulse = reduce ? 0.5 : 0.5 + 0.5 * Math.sin((t / 1300) * TAU);
        const gap = 0.045 + 0.02 * pulse;
        const L = 0.26 + 0.07 * pulse;
        const head = 0.11;
        const SIG = 0.02;
        const ST = 0.85;
        const stroke = (
          x0: number,
          y0: number,
          x1: number,
          y1: number,
          steps: number,
        ) => {
          for (let i = 0; i <= steps; i++) {
            const f = i / steps;
            lobes.push({
              x: x0 + (x1 - x0) * f,
              y: y0 + (y1 - y0) * f,
              sig: SIG,
              st: ST,
            });
          }
        };
        // ↗ (up-right) with right-angle head
        const tax = C + L * k,
          tay = C - L * k;
        stroke(C + gap * k, C - gap * k, tax, tay, 9);
        stroke(tax, tay, tax - head, tay, 4);
        stroke(tax, tay, tax, tay + head, 4);
        // ↙ (down-left) with right-angle head
        const tbx = C - L * k,
          tby = C + L * k;
        stroke(C - gap * k, C + gap * k, tbx, tby, 9);
        stroke(tbx, tby, tbx + head, tby, 4);
        stroke(tbx, tby, tbx, tby - head, 4);
      }

      // Cursor sources (residual decaying heat).
      for (let i = trail.length - 1; i >= 0; i--) {
        const age = (now - trail[i].t) / TRAIL_MS;
        if (age >= 1) {
          trail.splice(i, 1);
          continue;
        }
        lobes.push({
          x: trail[i].x,
          y: trail[i].y,
          sig: 0.085,
          st: 0.55 * (1 - age),
        });
      }

      const data = img!.data;
      for (let p = 0; p < bw * bh; p++) {
        const ux = warpX[p];
        const uy = warpY[p];
        let d = 0;

        if (day === 1) {
          const dx = (ux - 0.5) * ar;
          const dy = uy - 0.5;
          const rr = Math.sqrt(dx * dx + dy * dy);
          d = core * Math.exp(-(rr * rr) / (2 * 0.13 * 0.13)); // core
          for (let k = 0; k < rings.length; k++) {
            const g = rings[k];
            const gdx = (ux - 0.5) * ar;
            const gdy = uy - 0.5;
            const e = Math.sqrt(gdx * gdx + gdy * gdy) - g.R;
            d += g.st * Math.exp(-(e * e) / (2 * g.sig * g.sig));
          }
        }
        // arrow strokes + cursor lobes (D2 always; D1 cursor too)
        for (let k = 0; k < lobes.length; k++) {
          const s = lobes[k];
          const cx = (ux - s.x) * ar;
          const cy = uy - s.y;
          d += s.st * Math.exp(-(cx * cx + cy * cy) / (2 * s.sig * s.sig));
        }

        const u = ((p % bw) + 0.5) / bw;
        const v = (((p / bw) | 0) + 0.5) / bh;
        const win =
          Math.min(1, u / M) *
          Math.min(1, (1 - u) / M) *
          Math.min(1, v / M) *
          Math.min(1, (1 - v) / M);
        d *= win;

        const di = (d <= 0 ? 0 : d >= 1 ? 255 : (d * 255) | 0) * 4;
        const o = p * 4;
        data[o] = LUT[di];
        data[o + 1] = LUT[di + 1];
        data[o + 2] = LUT[di + 2];
        data[o + 3] = LUT[di + 3];
      }
      bctx.putImageData(img!, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);

      if (!reduce) raf = requestAnimationFrame(render);
    };

    // reduced-motion: a single static frame; otherwise drive rAF.
    if (reduce) render(start);
    else raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [day]);

  return (
    <div className={styles.kv}>
      <canvas
        ref={ref}
        className={styles.canvas}
        role="img"
        aria-label={
          day === 1
            ? "Day 1 컨셉: 열원 — 중심에서 퍼지는 동심원 열 파동"
            : "Day 2 컨셉: 전사 — 중심에서 바깥으로 확장하는 두 화살표 열"
        }
      />
    </div>
  );
}
