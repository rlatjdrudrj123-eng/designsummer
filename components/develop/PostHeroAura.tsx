"use client";

import { useEffect, useRef } from "react";
import styles from "./PostHeroAura.module.css";

/**
 * PostHeroAura — ONE continuous, dreamy WARM aura ground for the ENTIRE
 * below-hero region (DayBlock 1 → DayBlock 2 → Timetable → Directions →
 * Apply → Footer). This promotes the per-lineup AuraBg into a single page-wide
 * field so the whole rest of the page reads as one luminous Aura gradient,
 * exactly like the Aura variant's persistent `auraLayer` (variants/aura).
 *
 * Technique (Canvas 2D + rAF, no libraries — mirrors variants/aura/AuraField):
 * a handful of large, heavily-blurred radial blobs painted to a LOW-RES buffer
 * (cheap; the blur hides the upscale) that slowly drift + swell. On a LIGHT
 * ground we composite with `source-over` (not `lighter`) over a faint warm
 * cream wash so the blobs deepen into pastel orange/gold rather than blowing
 * out to white — dark warm ink stays perfectly legible on top.
 *
 * SINGLE INSTANCE for the whole region (not one canvas per section): this
 * component is mounted once by DevelopSite behind the wrapper, and the canvas
 * is `position: fixed` to the viewport so a tall scrolling page costs one
 * fixed-size buffer, not a buffer the height of the whole document.
 *
 * Warmth shift (all in the warm family — orange / amber / gold / yellow, NO
 * teal/cyan/green): the hue (0..1) is driven by SCROLL POSITION through the
 * below-hero region, eased every frame:
 *   top of region   → 0   DEEP, saturated RED-ORANGE (DAY 1 · HEAT SOURCE)
 *   lower / footer   → 1   BRIGHT, luminous GOLDEN-YELLOW (DAY 2 · HEAT TRANSFER)
 * Endpoints are pushed far apart (red-orange ↔ golden-yellow) so the warmth
 * journey is obvious, not a subtle orange→gold nudge.
 * Because the field is fixed to the viewport, scrolling re-derives the hue
 * from how far the wrapper has travelled past the top of the screen, so the
 * warmth visibly drifts orange → golden-yellow as you move down the page.
 *
 * prefers-reduced-motion: paints ONE static frame (mid-warm) and stops — no
 * rAF loop, no scroll listener driving the canvas.
 */

type Blob = {
  bx: number; // base x (0..1 of canvas)
  by: number; // base y (0..1 of canvas)
  ax: number; // drift amplitude x
  ay: number; // drift amplitude y
  sx: number; // drift speed x
  sy: number; // drift speed y
  phx: number; // phase x
  phy: number; // phase y
  r: number; // base radius (0..1 of min dim)
  rPulse: number; // radius pulse amount
  rSpeed: number; // radius pulse speed
  // EACH blob owns its OWN distinct warm hue (its own base color). This is the
  // key to a MULTI-COLORED field: at any scroll position the blobs are NOT the
  // same tone — there's a red-orange one, a coral one, an amber one, a gold one,
  // a warm-yellow one, a warm-pink/peach one, all blending at once.
  color: [number, number, number];
  // how strongly this blob follows the global warm MOOD DRIFT (0..1). The drift
  // nudges every blob a little warmer-at-top / brighter-at-bottom WITHOUT
  // collapsing them onto one shared hue — each keeps its own identity.
  drift: number;
  alpha: number;
};

// A lush, MULTI-HUED warm-sunset palette. Every blob is a DIFFERENT warm color
// (no two share a tone), all within the WARM family — reds, orange, coral,
// rose/warm-pink, peach, amber, gold, warm-yellow. NO teal/cyan/green/cool blue.
// Because each blob carries its own `color`, every single frame shows several
// hues blending into an iridescent wash, instead of one global interpolated tone.
//
// Per-blob base hues (the simultaneous variety is the point):
//   1) deep red-orange   #ff3d00
//   2) coral / warm-rose  #ff6a4d
//   3) warm pink / peach  #ff8aa0
//   4) amber             #ff9e1f
//   5) gold              #ffc400
//   6) warm yellow       #ffd84a
//   7) burnt scarlet     #e8350f
//   8) apricot / peach   #ffb070
const BLOBS: Blob[] = [
  // top band — leans deeper / redder
  {
    bx: 0.22, by: 0.24, ax: 0.1, ay: 0.08, sx: 0.041, sy: 0.03, phx: 0.0, phy: 1.7,
    r: 0.6, rPulse: 0.1, rSpeed: 0.05,
    color: [255, 61, 0], drift: 0.85, alpha: 0.5, // deep red-orange
  },
  {
    bx: 0.74, by: 0.2, ax: 0.09, ay: 0.1, sx: 0.035, sy: 0.045, phx: 2.1, phy: 0.4,
    r: 0.52, rPulse: 0.12, rSpeed: 0.06,
    color: [255, 106, 77], drift: 0.6, alpha: 0.46, // coral / warm-rose
  },
  {
    bx: 0.5, by: 0.34, ax: 0.11, ay: 0.07, sx: 0.03, sy: 0.04, phx: 4.2, phy: 3.3,
    r: 0.46, rPulse: 0.11, rSpeed: 0.048,
    color: [232, 53, 15], drift: 0.9, alpha: 0.44, // burnt scarlet
  },
  // mid band — coral / pink / amber mingling
  {
    bx: 0.14, by: 0.52, ax: 0.08, ay: 0.09, sx: 0.05, sy: 0.026, phx: 1.2, phy: 4.1,
    r: 0.5, rPulse: 0.13, rSpeed: 0.07,
    color: [255, 138, 160], drift: 0.4, alpha: 0.4, // warm pink / peach
  },
  {
    bx: 0.88, by: 0.5, ax: 0.07, ay: 0.08, sx: 0.044, sy: 0.034, phx: 5.0, phy: 0.9,
    r: 0.48, rPulse: 0.11, rSpeed: 0.052,
    color: [255, 158, 31], drift: 0.5, alpha: 0.46, // amber
  },
  {
    bx: 0.4, by: 0.62, ax: 0.1, ay: 0.08, sx: 0.038, sy: 0.03, phx: 2.7, phy: 5.2,
    r: 0.56, rPulse: 0.1, rSpeed: 0.046,
    color: [255, 176, 112], drift: 0.55, alpha: 0.42, // apricot / peach
  },
  // bottom band — leans brighter / golden-yellow
  {
    bx: 0.7, by: 0.78, ax: 0.09, ay: 0.07, sx: 0.028, sy: 0.038, phx: 3.4, phy: 2.6,
    r: 0.6, rPulse: 0.09, rSpeed: 0.044,
    color: [255, 150, 38], drift: 0.7, alpha: 0.48, // amber-orange (was gold — 노란기 제거)
  },
  {
    bx: 0.2, by: 0.82, ax: 0.08, ay: 0.08, sx: 0.046, sy: 0.03, phx: 0.7, phy: 1.1,
    r: 0.54, rPulse: 0.12, rSpeed: 0.058,
    color: [255, 166, 66], drift: 0.8, alpha: 0.46, // warm amber (was warm yellow — 노란기 제거)
  },
];

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp255(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

export default function PostHeroAura({
  /** ref to the below-hero wrapper whose scroll travel drives the warmth */
  targetRef,
  /**
   * vivid (default false): when true, the warm field reads as a RICHER, more
   * luminous aura — blob alphas are raised, the cream base wash is deepened +
   * saturated, the per-blob warm colors are pushed toward their saturated cores,
   * and the bloom (blur) is slightly stronger. The DEFAULT (false) path is
   * byte-identical to before so `/aura` and the develop tabs are unaffected.
   */
  vivid = false,
  /**
   * hue (optional, 0..1): a DAY-DRIVEN warmth override. When provided, the live
   * `curHue` eases toward THIS value every frame instead of the scroll-position
   * formula — so a parent (Aura1) can drive the whole field RED (~0, DAY 1 ·
   * HEAT SOURCE) while Day 1 is dominant and GOLD (~1, DAY 2 · HEAT TRANSFER)
   * once Day 2 is dominant, with the transition landing at the Day1->Day2
   * boundary rather than at the very bottom of the page. When UNDEFINED
   * (develop tabs, `/aura`) the warmth is derived from scroll exactly as before
   * -> that path stays byte-identical.
   */
  hue,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  vivid?: boolean;
  hue?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Keep the latest day-driven `hue` in a ref so the rAF loop can read it WITHOUT
  // listing `hue` in the effect deps (a frequently-eased prop there would tear
  // down + rebuild the loop every frame). The ref is synced in its own effect.
  const hueRef = useRef<number | undefined>(hue);
  hueRef.current = hue;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // VIVID tuning. All zero / 1.0 in the default (non-vivid) path so that path
    // is byte-identical to before. When vivid:
    //   - WASH_DEEPEN pulls the cream base wash darker + more saturated (less
    //     blue, less green headroom) so the ground reads as warm aura, not paper.
    //   - ALPHA_BOOST raises every blob's alpha (capped) for higher contrast.
    //   - CORE_SAT pushes each blob's color toward its own saturated core
    //     (deepen green/blue gaps from 255) for a richer, more luminous hue.
    //   - BLUR_BOOST widens the bloom a touch.
    const ALPHA_BOOST = vivid ? 1.42 : 1.0;
    const CORE_SAT = vivid ? 0.34 : 0.0;
    const BLUR_BOOST = vivid ? 1.18 : 1.0;

    let w = 0;
    let h = 0;

    // Low-res buffer: draw at a fraction of pixel size; CSS upscales. The heavy
    // blur hides the upscale and keeps this cheap. The canvas is viewport-fixed,
    // so this buffer stays small even though the page is very tall.
    const SCALE = 0.34;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width * SCALE));
      h = Math.max(1, Math.round(rect.height * SCALE));
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    resize();

    // hue target from scroll position through the below-hero region.
    // 0 = region just entering at the top of the viewport (deep orange),
    // 1 = region fully scrolled (golden-yellow). Mapped to a warm band [0.12, 0.9].
    // Full 0..1 range: drive the endpoints all the way so the field reaches the
    // deep red-orange at the top and the bright golden-yellow at the bottom.
    const HUE_LO = 0.0;
    const HUE_HI = 1.0;
    const targetHue = () => {
      const el = targetRef.current;
      if (!el) return HUE_LO;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress: 0 when the wrapper top sits at the viewport bottom (region just
      // below hero), 1 once the wrapper has travelled a full region-height past.
      const travelled = vh - r.top;
      const total = r.height + vh;
      const p = travelled / total;
      const clamped = p < 0 ? 0 : p > 1 ? 1 : p;
      return HUE_LO + clamped * (HUE_HI - HUE_LO);
    };

    let curHue = targetHue();

    const paint = (t: number) => {
      const minDim = Math.min(w, h);

      // Warm base wash. This now travels STRONGLY with the hue: at the top
      // (curHue→0) a warm peachy RED-ORANGE tint; at the bottom (curHue→1) a
      // luminous GOLDEN-YELLOW tint. The wash itself carries the journey so the
      // shift is obvious even between the (blurred) blobs. Greens climb and blue
      // drops as the hue rises → red-orange ground becomes yellow ground.
      // In the vivid path the base wash is DEEPENED + SATURATED: red stays at
      // max while green/blue are pulled further down from 255, so the cream
      // ground becomes a richer warm orange/gold wash instead of near-paper.
      const topR = Math.round(mix(255, 255, curHue));
      const topG = Math.round(mix(224, 248, curHue) - (vivid ? 26 : 0));
      const topB = Math.round(mix(205, 188, curHue) - (vivid ? 40 : 0));
      const botR = Math.round(mix(255, 255, curHue));
      const botG = Math.round(mix(210, 238, curHue) - (vivid ? 22 : 0));
      const botB = Math.round(mix(186, 158, curHue) - (vivid ? 36 : 0));
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, `rgb(${clamp255(topR)},${clamp255(topG)},${clamp255(topB)})`);
      bg.addColorStop(1, `rgb(${clamp255(botR)},${clamp255(botG)},${clamp255(botB)})`);
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // soft warm blobs. source-over (not lighter) so on a LIGHT ground they
      // deepen into pastel orange/gold instead of blowing out to white.
      const blurPx = Math.max(18, minDim * 0.16) * BLUR_BOOST;
      ctx.filter = `blur(${blurPx}px)`;

      // Global warm MOOD DRIFT: a small signed nudge from scroll. At the top of
      // the region (curHue→0) it tips each blob a touch REDDER/deeper; at the
      // bottom (curHue→1) a touch BRIGHTER/golden. This is applied PER-BLOB on
      // top of that blob's OWN hue and scaled by its `drift`, so the palette as
      // a whole rotates warmer→brighter down the page WITHOUT all blobs
      // collapsing to one shared tone — every frame stays multi-colored.
      const driftT = curHue - 0.5; // -0.5 (top, redder) .. +0.5 (bottom, golder)
      for (const b of BLOBS) {
        // VIVID edge-bias (organic, no veil): instead of painting a flat light
        // band over the center, we MOVE the layout so the rich/saturated warmth
        // lives at the LEFT and RIGHT edges and the CENTER column stays sparse —
        // letting the middle settle into the calm warm-cream base so centered
        // dark text reads cleanly. Each blob is pushed toward whichever edge it
        // already leans (bx<0.5 → left third, bx≥0.5 → right third); the closer a
        // blob sits to the centerline the further it's nudged outward, and any
        // blob that still lands near the center is DAMPED (lower alpha + softer
        // saturation) so it can't muddy the readable center. The heavy existing
        // blur fuses the two edge clusters into one continuous organic field.
        // DEFAULT (non-vivid) leaves bx, alpha and saturation untouched → the
        // default layout/behavior stays byte-identical.
        let bx = b.bx;
        let edgeCalm = 1; // 1 = full strength (edges); <1 damps center blobs
        if (vivid) {
          const toEdge = b.bx < 0.5 ? 0.18 : 0.82; // left third / right third anchor
          // proximity to the centerline (0 at edges, 1 at dead center)
          const central = 1 - Math.min(1, Math.abs(b.bx - 0.5) / 0.5);
          // pull harder the more central the blob is → vacate the middle
          bx = mix(b.bx, toEdge, 0.55 + 0.35 * central);
          // damp whatever warmth remains near the center so it stays calm/light
          edgeCalm = 1 - 0.55 * central;
        }
        const x = (bx + Math.sin(t * b.sx + b.phx) * b.ax) * w;
        const y = (b.by + Math.cos(t * b.sy + b.phy) * b.ay) * h;
        const r =
          minDim * (b.r + Math.sin(t * b.rSpeed + b.phx) * b.rPulse) * 0.85;
        // start from this blob's OWN warm color, then apply the shared drift:
        //   redder/deeper at top  → lower green & blue
        //   brighter/golden at bottom → raise green a little, drop blue a little
        const d = driftT * b.drift;
        // In the vivid path each blob is pushed toward its OWN saturated core:
        // red holds near max while green/blue are pulled further from 255 by
        // CORE_SAT, deepening the hue without leaving the warm family.
        // center blobs (vivid only) get a SOFTER saturation pull so the middle
        // stays low-saturation/calm; edge blobs keep the full vivid core. In the
        // default path CORE_SAT is 0 and edgeCalm is 1 → identical to before.
        const coreSat = CORE_SAT * edgeCalm;
        const cr = Math.round(clamp255(b.color[0] + d * 6)); // already near-max red; barely moves
        const cg = Math.round(
          clamp255((b.color[1] + d * 70) - (255 - b.color[1]) * coreSat)
        ); // green climbs toward gold at the bottom
        const cb = Math.round(
          clamp255((b.color[2] - d * 36) - (255 - b.color[2]) * coreSat)
        ); // blue eases off (warmer / less pink) lower
        // edgeCalm is 1 in the default path → a0 unchanged; vivid damps any blob
        // that still sits near the center so the readable middle stays light.
        const a0 = Math.min(0.92, b.alpha * ALPHA_BOOST * edgeCalm);
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${a0})`);
        g.addColorStop(0.5, `rgba(${cr},${cg},${cb},${a0 * 0.4})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, r), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    const start = performance.now();

    if (reduce) {
      // one static, mid-warm frame; no rAF, no scroll listener.
      curHue = (HUE_LO + HUE_HI) / 2;
      paint(8);
      const onResize = () => {
        resize();
        paint(8);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const frame = (now: number) => {
      const tt = (now - start) / 1000;
      // ease the live hue toward its target → warmth drifts smoothly.
      // If a DAY-DRIVEN `hue` override is supplied (Aura1), ease toward THAT
      // (clamped to 0..1) so the field tracks the dominant day; otherwise fall
      // back to the original scroll-position formula (develop/`/aura`).
      const h = hueRef.current;
      const goal =
        h == null ? targetHue() : h < 0 ? 0 : h > 1 ? 1 : h;
      curHue += (goal - curHue) * 0.06;
      paint(tt);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [targetRef, vivid]);

  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.veil} />
      </div>
    </div>
  );
}
