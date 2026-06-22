"use client";

import { useEffect, useRef, useState } from "react";

/* useScrollVelocity — the signature "kinetic" input.
 *
 * Tracks page scroll on an rAF loop and returns a SMOOTHED, normalized scroll
 * velocity in roughly [-1, 1]:
 *   • 0      → at rest
 *   • > 0    → scrolling down (faster ⇒ closer to +1)
 *   • < 0    → scrolling up
 *
 * No libraries — plain rAF + a low-pass filter so the value eases back to 0
 * when scrolling stops. Consumers (the marquee) multiply their base speed by
 * (1 + |v| * gain) and flip travel direction by sign(v), so the type visibly
 * reacts to the reader's momentum — the core of the Kinetic concept.
 *
 * Honors prefers-reduced-motion: when reduced motion is requested the hook
 * never starts its loop and returns a constant 0 so marquees stay frozen.
 */
export function useScrollVelocity(): number {
  const [velocity, setVelocity] = useState(0);
  const raf = useRef<number | null>(null);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const smoothed = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setVelocity(0);
      return;
    }

    lastY.current = window.scrollY;
    lastT.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.max(now - lastT.current, 1); // ms, avoid /0
      const y = window.scrollY;
      const dy = y - lastY.current;

      // px/ms → normalize against a "fast scroll" reference (~2 px/ms),
      // clamp to [-1, 1].
      const raw = Math.max(-1, Math.min(1, dy / dt / 2));

      // Low-pass filter: rise quickly toward input, ease back to 0 at rest.
      const target = raw;
      smoothed.current += (target - smoothed.current) * 0.18;
      if (Math.abs(smoothed.current) < 0.001) smoothed.current = 0;

      // Only re-render on meaningful change to avoid churn.
      setVelocity((prev) =>
        Math.abs(prev - smoothed.current) > 0.01 ? smoothed.current : prev
      );

      lastY.current = y;
      lastT.current = now;
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return velocity;
}
