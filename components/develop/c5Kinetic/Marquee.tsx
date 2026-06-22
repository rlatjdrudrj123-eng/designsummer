"use client";

import { type CSSProperties } from "react";
import { useScrollVelocity } from "./useScrollVelocity";
import styles from "./Kinetic.module.css";

/* Marquee — the ONE signature kinetic motion accent of this concept.
 *
 * A seamless, infinite horizontal ticker built with pure CSS animation (no
 * libraries). The track is rendered TWICE back-to-back and translated by -50%,
 * so the loop is gapless. Speed and travel direction are modulated live by the
 * reader's scroll velocity (useScrollVelocity): scrolling down nudges it one
 * way and speeds it up, scrolling up reverses + slows it — so the type reacts
 * to momentum. At rest it drifts at a calm base speed.
 *
 * Tasteful by default: on a transparent ground (the warm aura shows through),
 * hairline top/bottom rules, restrained type — NOT a loud full-width color
 * band. prefers-reduced-motion freezes it (animation + velocity both stop).
 */
export default function Marquee({
  items,
  baseDuration = 36,
  direction = 1,
  separator = "·",
  className,
  ariaLabel,
}: {
  items: readonly string[];
  /** base loop seconds at rest (lower = faster) */
  baseDuration?: number;
  /** 1 = leftward, -1 = rightward */
  direction?: 1 | -1;
  separator?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const v = useScrollVelocity();

  // Scroll momentum: speed up with |v|, and let strong scroll bias direction.
  const speedFactor = 1 + Math.abs(v) * 2.2; // up to ~3.2× faster
  const duration = baseDuration / speedFactor;
  // Sign of travel: base direction, flipped when scrolling up hard enough.
  const dirSign = v < -0.04 ? -direction : direction;
  // Map travel sign → CSS animation-direction. direction 1 (leftward) = normal.
  const play = dirSign === 1 ? "normal" : "reverse";

  // One rendered copy of the sequence.
  const track = (key: string) => (
    <div className={styles.marqueeSeq} key={key} aria-hidden={key !== "a"}>
      {items.map((it, i) => (
        <span className={styles.marqueeItem} key={`${key}-${i}`}>
          <span className={styles.marqueeText}>{it}</span>
          <span className={styles.marqueeSep} aria-hidden>
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`${styles.marquee} ${className ?? ""}`}
      role="presentation"
      aria-label={ariaLabel}
    >
      <div
        className={styles.marqueeTrack}
        style={
          {
            "--mq-duration": `${duration}s`,
            "--mq-play": play,
          } as CSSProperties
        }
      >
        {track("a")}
        {track("b")}
      </div>
    </div>
  );
}
