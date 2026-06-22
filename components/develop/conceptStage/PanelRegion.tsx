"use client";

import { useRef, type ReactNode } from "react";
import PostHeroAura from "../PostHeroAura";
import styles from "./PanelRegion.module.css";

/**
 * PanelRegion — the positioned container that holds the ONE continuous warm
 * Aura ground for everything below the hero in the IMMERSIVE PANEL concept.
 *
 * This is the conceptStage equivalent of develop/PostHeroRegion.tsx: it lays a
 * single shared PostHeroAura field (z-index 0) behind the whole below-hero
 * region and floats the (transparent) content above it (z-index 1), so the
 * cinematic full-bleed panels, the day marker, and the reused sections all sit
 * on the SAME warm continuous aura — and the warm Day1 → Day2 color drift
 * (driven by scroll travel inside PostHeroAura) carries straight through.
 *
 * We reuse the EXISTING PostHeroAura unchanged (its hue is derived from how far
 * this wrapper has scrolled past the top of the viewport), so the KV tone &
 * manner is identical to the original develop page.
 */
export default function PanelRegion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div ref={ref} className={styles.region}>
      <PostHeroAura targetRef={ref} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
