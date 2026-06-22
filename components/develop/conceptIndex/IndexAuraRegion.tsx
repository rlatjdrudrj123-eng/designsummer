"use client";

import { useRef, type ReactNode } from "react";
import PostHeroAura from "../PostHeroAura";
import styles from "./IndexAuraRegion.module.css";

/**
 * IndexAuraRegion — region wrapper for the ConceptIndex concept page.
 *
 * Equivalent to components/develop/PostHeroRegion.tsx (read-only, not edited):
 * it lays down ONE continuous warm Aura ground (the shared, unchanged
 * PostHeroAura field) behind everything below the hero, and floats the
 * (transparent) content above it. The wrapper ref is handed to PostHeroAura so
 * the warm Day1 -> Day2 hue drift is driven by how far this region has scrolled
 * past the top of the viewport — identical tone & manner to the original
 * develop page.
 */
export default function IndexAuraRegion({
  children,
}: {
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div ref={ref} className={styles.region}>
      <PostHeroAura targetRef={ref} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
