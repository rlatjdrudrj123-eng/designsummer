"use client";

import { useEffect, useRef } from "react";
import styles from "./GradientBar.module.css";

/* HEATWAVE signature: a soft, blurred vertical heat-gradient column.
   blue (#2E7DF6) → magenta (#E33C9A) → hot red (#ED3B2F), with bloom edges.
   Animated as a slow vertical drift + breathing bloom via Canvas2D + rAF.

   Cursor reaction: the column leans toward the pointer's X and a soft radial
   heat glow blooms at the pointer, so moving the mouse feels like stirring heat.
   The pointer target is captured on pointermove (cheap) and eased toward each
   frame inside the existing rAF loop (no extra timers).

   Respects prefers-reduced-motion (renders a single static frame, no reaction). */

type Stop = { p: number; c: [number, number, number] };

// The three signature hues plus warm transitions, anchored top→bottom.
const BASE: Stop[] = [
  { p: 0.0, c: [46, 125, 246] }, // blue   #2E7DF6
  { p: 0.34, c: [110, 92, 220] }, // indigo blend
  { p: 0.52, c: [227, 60, 154] }, // magenta #E33C9A
  { p: 0.74, c: [237, 71, 71] }, // warm red
  { p: 1.0, c: [237, 59, 47] }, // hot red #ED3B2F
];

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ] as [number, number, number];
}

function sample(stops: Stop[], p: number): [number, number, number] {
  if (p <= stops[0].p) return stops[0].c;
  if (p >= stops[stops.length - 1].p) return stops[stops.length - 1].c;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = (p - a.p) / (b.p - a.p);
      return mix(a.c, b.c, t);
    }
  }
  return stops[stops.length - 1].c;
}

export default function GradientBar() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    // Pointer reaction state. Targets are written by the move handler (cheap),
    // and the rendered values ease toward them every frame for smoothness.
    // x/y are normalized 0..1 within the canvas; strength fades the glow in/out
    // so the bar relaxes back to center when the pointer leaves the hero.
    const target = { x: 0.5, y: 0.5, strength: 0 };
    const eased = { x: 0.5, y: 0.5, strength: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      target.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      target.y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      target.strength = 1;
    };
    const onPointerLeave = () => {
      target.strength = 0;
    };

    const draw = (time: number) => {
      // slow drift: shift the gradient phase up/down + a breathing horizontal bloom
      const drift = reduce ? 0 : Math.sin(time / 6000) * 0.06;
      const breath = reduce ? 0.5 : 0.5 + Math.sin(time / 3800) * 0.5; // 0..1

      // ease the pointer state toward its target (critically-damped feel)
      if (!reduce) {
        eased.x += (target.x - eased.x) * 0.08;
        eased.y += (target.y - eased.y) * 0.08;
        eased.strength += (target.strength - eased.strength) * 0.06;
      }

      // the column leans toward the pointer's X, capped so it never detaches
      // from the center cross-rule. Magnitude scales with the eased strength.
      const lean = reduce
        ? 0
        : (eased.x - 0.5) * w * 0.16 * eased.strength;

      ctx.clearRect(0, 0, w, h);

      // vertical multi-stop gradient (drifted)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      const N = 24;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const sp = Math.min(1, Math.max(0, t + drift));
        const [r, g, b] = sample(BASE, sp);
        grad.addColorStop(t, `rgb(${r},${g},${b})`);
      }

      // bar geometry: a soft column centered, slightly breathing in width.
      // Kept slim so the flanking date numerals sit just outside the dense
      // core and stay legible; the feathered bloom still spreads wider.
      const cx = w / 2 + lean;
      const baseWidth = w * (0.3 + breath * 0.05);
      const halfW = baseWidth / 2;

      // horizontal soft-edge mask: full color in the middle, fading to transparent at edges (bloom)
      ctx.save();
      ctx.fillStyle = grad;
      ctx.fillRect(cx - halfW, 0, baseWidth, h);

      // feather the left/right edges into white with a horizontal gradient erase
      ctx.globalCompositeOperation = "destination-in";
      const hmask = ctx.createLinearGradient(cx - halfW, 0, cx + halfW, 0);
      hmask.addColorStop(0.0, "rgba(0,0,0,0)");
      hmask.addColorStop(0.28, "rgba(0,0,0,0.65)");
      hmask.addColorStop(0.5, "rgba(0,0,0,1)");
      hmask.addColorStop(0.72, "rgba(0,0,0,0.65)");
      hmask.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = hmask;
      ctx.fillRect(cx - halfW, 0, baseWidth, h);

      // feather top/bottom so the column blooms out of the page
      const vmask = ctx.createLinearGradient(0, 0, 0, h);
      vmask.addColorStop(0.0, "rgba(0,0,0,0.35)");
      vmask.addColorStop(0.12, "rgba(0,0,0,1)");
      vmask.addColorStop(0.88, "rgba(0,0,0,1)");
      vmask.addColorStop(1.0, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vmask;
      ctx.fillRect(cx - halfW, 0, baseWidth, h);
      ctx.restore();

      // cursor heat glow: a soft additive bloom at the pointer, tinted by the
      // gradient color at that vertical position, so dragging the mouse over the
      // hero feels like stirring heat. Skipped entirely for reduced-motion.
      if (!reduce && eased.strength > 0.01) {
        const gx = eased.x * w;
        const gy = eased.y * h;
        const [r, g, b] = sample(BASE, Math.min(1, Math.max(0, eased.y + drift)));
        const radius = Math.max(w, h) * 0.22;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
        const a = 0.42 * eased.strength;
        glow.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        glow.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.35})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = glow;
        ctx.fillRect(gx - radius, gy - radius, radius * 2, radius * 2);
        ctx.restore();
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    if (reduce) {
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    if (!reduce) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className={styles.wrap} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
