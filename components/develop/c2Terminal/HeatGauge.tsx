"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeatGauge.module.css";

/* Thermal readout gauge — a Canvas2D heat bar that rises to `target` (0..100)
 * with a faint glowing amber sweep, plus a synced rising number. rAF driven.
 * Respects prefers-reduced-motion: paints the final state once, no animation.
 *
 * Self-contained: no external libs, no shared state. */
export default function HeatGauge({
  target = 86,
  label = "CORE TEMP",
  unit = "°C",
}: {
  target?: number;
  label?: string;
  unit?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [value, setValue] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // animate the displayed number
  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const DUR = 1600;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / DUR);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  // paint the bar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let phase = 0;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const segs = 28;
      const gap = 3;
      const segW = (w - gap * (segs - 1)) / segs;
      const lit = Math.round((value / 100) * segs);

      for (let i = 0; i < segs; i++) {
        const x = i * (segW + gap);
        const on = i < lit;
        // warm gradient tuned to read on the LIGHT warm aura ground:
        // lit segments deepen red-orange → amber (saturated, dark enough to
        // contrast the cream field); unlit segments are a faint warm-ink track
        // (not white-ish amber, which vanished on the light ground).
        const heat = i / segs;
        if (on) {
          const r = Math.round(210 - heat * 30); // 210 → 180
          const g = Math.round(70 + heat * 75); // 70 → 145
          ctx.fillStyle = `rgb(${r}, ${g}, 14)`;
          ctx.shadowColor = "rgba(196,61,28,0.45)";
          ctx.shadowBlur = reduced ? 0 : 6 + (i === lit - 1 ? 6 : 0);
        } else {
          ctx.fillStyle = "rgba(42,19,5,0.12)";
          ctx.shadowBlur = 0;
        }
        ctx.fillRect(x, 0, segW, h);
      }
      ctx.shadowBlur = 0;

      // moving scan highlight on the lit region (warm, subtle on light)
      if (!reduced && lit > 0) {
        phase += 0.02;
        const litW = lit * (segW + gap);
        const sx = ((Math.sin(phase) + 1) / 2) * litW;
        const grad = ctx.createLinearGradient(sx - 30, 0, sx + 30, 0);
        grad.addColorStop(0, "rgba(255,236,200,0)");
        grad.addColorStop(0.5, "rgba(255,244,214,0.4)");
        grad.addColorStop(1, "rgba(255,236,200,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, litW, h);
        raf = requestAnimationFrame(draw);
      }
    };

    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  return (
    <div className={styles.gauge} aria-hidden="true">
      <div className={styles.gaugeHead}>
        <span className={styles.gaugeLabel}>{label}</span>
        <span className={styles.gaugeValue}>
          {value.toFixed(1)}
          <span className={styles.gaugeUnit}>{unit}</span>
        </span>
      </div>
      <canvas ref={canvasRef} className={styles.gaugeCanvas} />
    </div>
  );
}
