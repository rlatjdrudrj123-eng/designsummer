"use client";

import { useEffect, useRef } from "react";
import styles from "./ThermalField.module.css";

/* THERMAL FIELD — a thermal-camera / heatmap photo, rendered live.

   A domain-warped multi-color scalar field is sampled into a small offscreen
   buffer (low-res for speed), mapped through a 256-entry SOFT full-spectrum LUT
   (deep blue → cyan → green → yellow → orange → red → magenta), then
   drawImage-upscaled with smoothing so the field reads as soft organic blobs —
   no hard contour lines, no glossy sheen.

   Over that field a DENSE per-pixel film grain is composited every frame so the
   image reads like a real thermal sensor's noise (photographic-noisy, not a
   clean CSS gradient). The grain itself is rendered into the low-res buffer at a
   finer resolution and blitted, keeping the per-frame cost bounded while still
   covering every visible pixel.

   Perf: field buffer is ~ width/SCALE; grain buffer is ~ width/GRAIN_SCALE. Both
   are single GPU-blits. DPR is applied only to the visible canvas. Respects
   prefers-reduced-motion by drawing one static frame and never starting rAF.
   Resize is debounced. */

const SCALE = 16; // px per field cell — bigger = cheaper + softer blobs
const GRAIN_SCALE = 2; // px per grain cell — small = fine, dense sensor noise

/** 256-entry thermal LUT, packed RGB. Soft full spectrum:
    deep blue → cyan → green → yellow → orange → red → magenta.
    Stops are spaced to keep the ramp smooth and continuous (no banding,
    no isotherm steps). */
function buildLUT(): Uint8ClampedArray {
  const stops: Array<[number, number, number, number]> = [
    [0.0, 14, 18, 72], // deep indigo
    [0.14, 26, 78, 196], // blue
    [0.3, 18, 168, 206], // cyan
    [0.45, 44, 188, 104], // green
    [0.6, 214, 206, 60], // yellow
    [0.73, 240, 142, 34], // orange
    [0.86, 228, 52, 52], // red
    [1.0, 234, 70, 178], // magenta
  ];
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) {
        a = stops[s];
        b = stops[s + 1];
        break;
      }
    }
    const span = b[0] - a[0] || 1;
    // smoothstep between stops → soft, photographic transitions
    const raw = (t - a[0]) / span;
    const f = raw * raw * (3 - 2 * raw);
    lut[i * 3] = a[1] + (b[1] - a[1]) * f;
    lut[i * 3 + 1] = a[2] + (b[2] - a[2]) * f;
    lut[i * 3 + 2] = a[3] + (b[3] - a[3]) * f;
  }
  return lut;
}

export default function ThermalField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const lut = buildLUT();

    // offscreen low-res field buffer
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d");
    if (!bctx) return;

    // offscreen grain buffer (finer than the field, still sub-resolution)
    const grain = document.createElement("canvas");
    const gctx = grain.getContext("2d");
    if (!gctx) return;

    let bw = 1;
    let bh = 1;
    let gw = 1;
    let gh = 1;
    let img: ImageData | null = null;
    let gimg: ImageData | null = null;
    let raf = 0;
    let resizeTimer = 0;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      bw = Math.max(2, Math.ceil(w / SCALE));
      bh = Math.max(2, Math.ceil(h / SCALE));
      buf.width = bw;
      buf.height = bh;
      img = bctx.createImageData(bw, bh);

      gw = Math.max(2, Math.ceil(w / GRAIN_SCALE));
      gh = Math.max(2, Math.ceil(h / GRAIN_SCALE));
      grain.width = gw;
      grain.height = gh;
      gimg = gctx.createImageData(gw, gh);
    };

    /** sample the warped scalar field at buffer cell (x,y) for time t → [0,1] */
    const field = (x: number, y: number, t: number): number => {
      const u = x / bw;
      const v = y / bh;
      // domain warp: offset the sample point by low-freq sines → organic blobs
      const wx =
        u * 3.0 +
        0.6 * Math.sin(v * 3.6 + t * 0.5) +
        0.34 * Math.sin(v * 6.9 - t * 0.24);
      const wy =
        v * 2.8 +
        0.6 * Math.cos(u * 3.3 - t * 0.44) +
        0.34 * Math.cos(u * 5.7 + t * 0.3);
      let s = 0;
      s += Math.sin(wx * 1.2 + t * 0.36);
      s += Math.sin(wy * 1.5 - t * 0.29);
      s += Math.sin((wx + wy) * 0.8 + t * 0.19);
      s += 0.6 * Math.sin((wx - wy) * 1.4 - t * 0.45);
      s += 0.5 * Math.sin(Math.hypot(wx - 1.5, wy - 1.4) * 2.0 - t * 0.62);
      return (s / 3.6) * 0.5 + 0.5;
    };

    const drawField = (t: number) => {
      if (!img) return;
      const data = img.data;
      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          let n = field(x, y, t);
          if (n < 0) n = 0;
          else if (n > 1) n = 1;
          const idx = (n * 255) | 0;
          const li = idx * 3;
          const p = (y * bw + x) * 4;
          data[p] = lut[li];
          data[p + 1] = lut[li + 1];
          data[p + 2] = lut[li + 2];
          data[p + 3] = 255;
        }
      }
      bctx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(
        buf,
        0,
        0,
        bw,
        bh,
        0,
        0,
        canvas.clientWidth || canvas.width,
        canvas.clientHeight || canvas.height,
      );
      drawGrain(t);
    };

    /* DENSE film grain — every grain-buffer cell gets a random luminance offset
       each frame, then the whole buffer is overlaid so the field looks like a
       real thermal sensor feed (heavy, photographic noise covering every pixel).
       Drawn at GRAIN_SCALE so the noise stays fine but the loop stays bounded. */
    const drawGrain = (t: number) => {
      if (!gimg) return;
      const data = gimg.data;
      const n = gw * gh;
      // fast xorshift seeded per frame so the grain shimmers
      let seed = (t * 1000) | 0 || 1;
      for (let i = 0; i < n; i++) {
        seed ^= seed << 13;
        seed ^= seed >>> 17;
        seed ^= seed << 5;
        // map to roughly [-1,1]; bias toward dark so it reads as sensor noise
        const r = ((seed >>> 0) / 4294967295) * 2 - 1;
        const lum = r < 0 ? 0 : 255; // light vs dark speck
        const a = Math.abs(r) * 150; // strong contrast (0..150 alpha)
        const p = i * 4;
        data[p] = lum;
        data[p + 1] = lum;
        data[p + 2] = lum;
        data[p + 3] = a;
      }
      gctx.putImageData(gimg, 0, 0);
      // soft-light keeps the grain riding the color rather than greying it out;
      // a second pass at low alpha adds visible specks.
      const w = canvas.clientWidth || canvas.width;
      const h = canvas.clientHeight || canvas.height;
      ctx.imageSmoothingEnabled = false;
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.55;
      ctx.drawImage(grain, 0, 0, gw, gh, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.16;
      ctx.drawImage(grain, 0, 0, gw, gh, 0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.imageSmoothingEnabled = true;
    };

    setup();

    if (reduce) {
      drawField(0);
      return () => {};
    }

    const start = performance.now();
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      drawField(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setup();
        if (reduce) drawField(0);
      }, 160);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
  );
}
