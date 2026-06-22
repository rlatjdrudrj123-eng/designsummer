import type { CSSProperties } from "react";
import styles from "./Hand.module.css";

type MoteProps = {
  /** size in px */
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  /** pulse phase offset (s) — applied as negative animation-delay */
  phase?: number;
  /** core fill (the bright center) */
  fill?: string;
  /** halo/glow color (the soft outer bloom) */
  glow?: string;
  className?: string;
  /** decorative tilt of the cross-glimmer (deg) */
  rotate?: number;
};

/**
 * Glint — a single quiet point of light the hand reaches up to catch.
 * Refined from the old spiky / cross-glimmer "twinkle" (which read kitsch):
 * now just a soft round glow with one small luminous core and a faint
 * highlight. No lens-flare spikes, no cross sparkles. It should read as a
 * calm, gallery-grade point of light, not glitter.
 *
 * `rotate` is accepted (callers still pass it) but intentionally unused — the
 * glint is radially symmetric, so orientation no longer matters.
 *
 * Drawn on a 100x100 box; the parent .mote span handles position + pulse.
 */
export default function Mote({
  size,
  top,
  left,
  right,
  bottom,
  phase = 0,
  fill = "var(--hand-glint)",
  glow = "rgba(216, 165, 52, 0.4)",
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rotate = 0,
}: MoteProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    top,
    left,
    right,
    bottom,
    animationDelay: `${-phase}s`,
  };
  return (
    <span
      className={[styles.mote, className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* soft, wide outer halo — a quiet bloom, not a flare */}
        <circle cx="50" cy="50" r="34" fill={glow} opacity="0.45" />
        {/* a tighter inner glow */}
        <circle cx="50" cy="50" r="18" fill={glow} opacity="0.55" />
        {/* the small luminous core — the single point of light */}
        <circle cx="50" cy="50" r="8" fill={fill} />
        {/* a faint off-centre highlight for a touch of dimensionality */}
        <circle cx="47" cy="46" r="3" fill="rgba(255,255,255,0.85)" />
      </svg>
    </span>
  );
}
