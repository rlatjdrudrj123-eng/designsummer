"use client";

import { useRef, type ReactNode } from "react";
// (behind 슬롯) — 오라 레이어와 콘텐츠 사이에 렌더되는 노드(예: 커서 라이트스팟).
import PostHeroAura from "./PostHeroAura";
import styles from "./PostHeroRegion.module.css";

/**
 * PostHeroRegion — the positioned container that holds the ONE continuous
 * warm Aura ground for everything below the hero. Mirrors the Aura variant's
 * persistent `auraLayer` (variants/aura/Aura.tsx): a single field sits behind
 * the whole region (z-index 0) and every section inside is transparent so the
 * aura shows through continuously. Content sits above it (z-index 1).
 *
 * The wrapper ref is handed to PostHeroAura so the field's warmth can be driven
 * by how far this region has scrolled past the top of the viewport.
 *
 * aura (default true): when false, the PostHeroAura canvas/field is NOT rendered
 * at all — the (transparent) sections then sit on the plain white page ground.
 * The `noAura` modifier flips a flag the content reads so frosted speaker cards
 * gain a solid near-white surface (the backdrop-filter frost has nothing warm to
 * pick up on a plain ground). Everything else (warm --mood tonal text, layout,
 * interactions) is unchanged.
 */
export default function PostHeroRegion({
  children,
  aura = true,
  vivid = false,
  hue,
  behind,
}: {
  children: ReactNode;
  aura?: boolean;
  /** node rendered BETWEEN the aura layer and the content (sits behind sections). */
  behind?: ReactNode;
  /** forwarded to PostHeroAura: render a richer, more luminous warm aura. */
  vivid?: boolean;
  /**
   * forwarded to PostHeroAura: optional DAY-DRIVEN warmth override (0..1). When
   * provided the warm field eases toward this value (RED≈0 / GOLD≈1) instead of
   * the scroll-position formula. Omit to keep the original scroll-driven warmth
   * (develop tabs / `/aura`) — that path is unchanged.
   */
  hue?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={ref}
      className={`${styles.region} ${aura ? "" : styles.noAura}`}
    >
      {aura && <PostHeroAura targetRef={ref} vivid={vivid} hue={hue} />}
      {behind}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
