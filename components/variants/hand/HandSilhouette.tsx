type Props = {
  className?: string;
  fill?: string;
  /** nail SHEEN — a soft near-white highlight (LIGHTER than the cream hand)
   *  painted ON TOP of each fingertip so the nail reads as a glossy nail catching
   *  the light, never a recessed hole. It must NEVER be darker than the hand
   *  fill: a darker patch reads as a void/notch at the tip. A light sheen reads
   *  as a real nail. */
  nailFill?: string;
};

/**
 * The HAND (palm + fingers) at the FAR end of the reaching limb — variant 3
 * "Catch the idea". The FOREARM is NO LONGER part of this SVG: it is a dynamic
 * shape recomputed every frame in HERO space by Hand.tsx (corner anchor → this
 * hand's WRIST point) and drawn BEHIND this hand, so the wrist/palm always
 * overlaps it with no seam and the limb can never gap.
 *
 * This SVG draws ONLY the hand, authored pointing UP (−Y) in a 300×520 viewBox:
 *
 *     index fingertip (150,30) at the TOP  ← the reach anchor Hand.tsx pins
 *            fingers
 *            palm
 *            wrist (≈ y 300)  ← where the dynamic forearm meets it
 *
 * CONSTRUCTION THAT CANNOT GAP — the hand is ONE solid palm mass plus TWO
 * CROSSFADING finger layers on top (no rotating capsules):
 *
 *   • PALM/BASE  — a single solid rounded shape (palm + wrist knuckle). Always
 *     solid, never animated in shape. Continuous down to the wrist so the
 *     dynamic forearm (drawn behind) tucks under it with no seam.
 *   • OPEN layer — four fingers + thumb fanned from the palm top, each finger's
 *     BASE buried DEEPLY into the palm. Fingers are EVENLY spaced with clear
 *     gaps between EACH (index ≠ middle overlap). Fully visible at rest.
 *   • POINT layer — a single extended INDEX finger + a rounded "folded-knuckles"
 *     lump on the palm top (the other fingers curled away) + a tucked thumb.
 *     Hidden at rest. Its extended index is the part that jabs and whose tip
 *     lands at (150,30).
 *
 * Hand.module.css crossfades the two layers' OPACITY on `--curl` (0 open → 1
 * point) while the palm stays constant, so it reads as the hand folding into a
 * pointing finger with NO gap and nothing detaching. `--poke` translates the
 * whole POINT layer a touch up the pointing axis for the arrival jab.
 */

/** One finger as a rounded "stadium" path: base-center (bx,by), drawn toward
 *  the tip (tx,ty), with rounded ends of radius w/2. The base is meant to sit
 *  DEEP inside the palm so there is never a gap between finger and palm. */
function finger(bx: number, by: number, tx: number, ty: number, w: number) {
  const dx = tx - bx;
  const dy = ty - by;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len; // unit along base→tip
  const px = -uy;
  const py = ux; // unit perpendicular (left side)
  const r = w / 2;
  // four key points: base-left, tip-left, tip-right, base-right
  const blx = bx + px * r;
  const bly = by + py * r;
  const brx = bx - px * r;
  const bry = by - py * r;
  const tlx = tx + px * r;
  const tly = ty + py * r;
  const trx = tx - px * r;
  const trry = ty - py * r;
  // rounded cap at the tip (semicircle from tip-left to tip-right through tip+u*r)
  return (
    `M ${blx.toFixed(2)} ${bly.toFixed(2)} ` +
    `L ${tlx.toFixed(2)} ${tly.toFixed(2)} ` +
    `A ${r} ${r} 0 0 0 ${trx.toFixed(2)} ${trry.toFixed(2)} ` +
    `L ${brx.toFixed(2)} ${bry.toFixed(2)} ` +
    `Z`
  );
}

/** A single FINGERNAIL: a SMALL, SUBTLE accent inset that sits on the UPPER
 *  THIRD of the finger — clearly BEHIND the very tip — drawn ON TOP of the
 *  already-solid finger fill. It must NEVER be the extreme endpoint and must
 *  NEVER let the dark ground show through the tip, so it is pushed well back
 *  from the fingertip and kept narrow. Shares the same base→tip axis as
 *  `finger()` so it always orients with its digit.
 *
 *  Geometry: the finger's solid rounded cap occupies the last `r = w/2` of the
 *  finger. We keep the WHOLE nail strictly inside the solid shaft, starting a
 *  full cap-radius-plus back from the tip — so the rounded fingertip stays a
 *  clean, filled cream cap and the nail reads as a detail tucked just behind it,
 *  not a patch that replaces or hollows the tip. Returned as a small rounded-cap
 *  stadium (semicircle toward the tip, rounded at its base). */
function nail(bx: number, by: number, tx: number, ty: number, w: number) {
  const dx = tx - bx;
  const dy = ty - by;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len; // unit along base→tip
  const px = -uy;
  const py = ux; // unit perpendicular (left side)
  const r = w / 2; // the finger's rounded-cap radius (the solid tip cap)
  // nail geometry — small and narrow so it's a detail, not a patch.
  const nr = w * 0.24; // nail half-width (clearly narrower than the finger)
  const nlen = w * 0.42; // nail length along the finger axis
  // PUSH the nail BACK from the very tip: leave the entire solid round cap
  // (radius r) PLUS a small margin untouched, so the fingertip stays solidly
  // filled and the nail sits on the upper third, behind the tip. The nail's
  // own forward (tip-side) end is therefore at least `r + margin` from the
  // finger tip and can never reach or hollow the endpoint.
  const tipGap = r + w * 0.22; // distance from finger tip to nail's tip-side end
  // nail tip (near, but safely behind, the fingertip) and nail base (toward knuckle)
  const ntx = tx - ux * tipGap;
  const nty = ty - uy * tipGap;
  const nbx = ntx - ux * nlen;
  const nby = nty - uy * nlen;
  const blx = nbx + px * nr;
  const bly = nby + py * nr;
  const brx = nbx - px * nr;
  const bry = nby - py * nr;
  const tlx = ntx + px * nr;
  const tly = nty + py * nr;
  const trx = ntx - px * nr;
  const trry = nty - py * nr;
  return (
    `M ${blx.toFixed(2)} ${bly.toFixed(2)} ` +
    `L ${tlx.toFixed(2)} ${tly.toFixed(2)} ` +
    `A ${nr.toFixed(2)} ${nr.toFixed(2)} 0 0 0 ${trx.toFixed(2)} ${trry.toFixed(2)} ` +
    `L ${brx.toFixed(2)} ${bry.toFixed(2)} ` +
    `Z`
  );
}

export default function HandSilhouette({
  className,
  fill = "var(--hand-hand)",
  nailFill = "var(--hand-nail, #fffdf6)",
}: Props) {
  // INDEX TIP — the reach anchor pinned onto clicks by Hand.tsx. Shared by BOTH
  // the open-layer index and the point-layer index so the silhouette's lead
  // finger lands on the same point in either state.
  const TIPX = 150;
  const TIPY = 30;

  // OPEN-layer fingers: bases buried deep into the palm (palm top edge ≈ y 150),
  // bases at y≈198 so each finger overlaps the palm by ~48px (never a gap).
  // Tips FAN OUT EVENLY left→right with clear gaps between EACH finger so the
  // index never touches the middle. Middle is longest, pinky shortest.
  const openFingers = [
    // INDEX — leftmost, lead pointer; tip near the reach anchor
    { bx: 112, by: 198, tx: 148, ty: TIPY, w: 29 },
    // MIDDLE — longest, tip clearly right of the index
    { bx: 148, by: 200, tx: 186, ty: 24, w: 31 },
    // RING — shorter, fans further right
    { bx: 182, by: 200, tx: 218, ty: 60, w: 29 },
    // PINKY — shortest, outermost. Its BASE is pulled IN and DOWN so it buries
    // into the palm mass exactly like the other digits (no gap / not detached):
    // base center at x≈198 sits well inside the palm's right edge (palm rect
    // spans x100–212), and at y≈208 it overlaps the palm top deeply. Only the
    // tip fans outward to keep the even fan, so the pinky reads connected.
    { bx: 198, by: 208, tx: 246, ty: 104, w: 25 },
  ];

  // POINT-layer: a single extended index (same tip anchor) rising from deep in
  // the palm; the other fingers are represented by a rounded knuckle lump on the
  // palm top, and the thumb is tucked against the palm.
  const pointIndex = { bx: 120, by: 212, tx: TIPX, ty: TIPY, w: 33 };

  return (
    <svg
      className={className}
      viewBox="0 0 300 520"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      role="presentation"
    >
      {/* ============================================================
          PALM / BASE — ONE solid rounded mass (palm + wrist knuckle). Always
          fully visible, never animated in shape. Its bottom (≈ y 300..330) is
          the WRIST: the dynamic forearm (drawn behind, in Hand.tsx) meets it
          here and is overlapped by this mass, so there is never a seam.
          ============================================================ */}
      <g className="palmBase">
        {/* wrist knuckle → palm, one continuous rounded slab */}
        <rect x="100" y="150" width="112" height="180" rx="52" ry="52" fill={fill} />
        {/* widen the lower palm/heel so it reads as a solid hand base over the
            forearm and the wrist never looks pinched */}
        <rect x="96" y="226" width="120" height="96" rx="48" ry="48" fill={fill} />
      </g>

      {/* ============================================================
          OPEN LAYER — four EVENLY-SPACED fingers + thumb, fully visible at rest.
          Fades OUT as --curl → 1 (Hand.module.css). Painted thumb→index so the
          index sits on top. Bases are buried in the palm (no gap to the palm).
          ============================================================ */}
      <g className="openLayer">
        {/* THUMB — angled off the palm's lower-left side */}
        <path d={finger(110, 250, 52, 196, 34)} fill={fill} />
        {/* PINKY → INDEX (index painted last = on top) */}
        <path d={finger(openFingers[3].bx, openFingers[3].by, openFingers[3].tx, openFingers[3].ty, openFingers[3].w)} fill={fill} />
        <path d={finger(openFingers[2].bx, openFingers[2].by, openFingers[2].tx, openFingers[2].ty, openFingers[2].w)} fill={fill} />
        <path d={finger(openFingers[1].bx, openFingers[1].by, openFingers[1].tx, openFingers[1].ty, openFingers[1].w)} fill={fill} />
        <path d={finger(openFingers[0].bx, openFingers[0].by, openFingers[0].tx, openFingers[0].ty, openFingers[0].w)} fill={fill} />
        {/* FINGERNAILS — one near the tip of each digit (thumb + 4 fingers),
            a soft near-white SHEEN (lighter than the cream hand) so they read as
            a glossy nail catching light, never a recessed hole. Painted after
            the fingers so they sit on top; inside .openLayer so they crossfade
            with their fingers exactly. */}
        <path d={nail(110, 250, 52, 196, 34)} fill={nailFill} />
        <path d={nail(openFingers[3].bx, openFingers[3].by, openFingers[3].tx, openFingers[3].ty, openFingers[3].w)} fill={nailFill} />
        <path d={nail(openFingers[2].bx, openFingers[2].by, openFingers[2].tx, openFingers[2].ty, openFingers[2].w)} fill={nailFill} />
        <path d={nail(openFingers[1].bx, openFingers[1].by, openFingers[1].tx, openFingers[1].ty, openFingers[1].w)} fill={nailFill} />
        <path d={nail(openFingers[0].bx, openFingers[0].by, openFingers[0].tx, openFingers[0].ty, openFingers[0].w)} fill={nailFill} />
      </g>

      {/* ============================================================
          POINT LAYER — a single extended INDEX + a rounded "folded-knuckles"
          lump (the other fingers curled away) + a tucked thumb stub. Hidden at
          rest, fades IN as --curl → 1. The extended index is the jab/poke part
          and its tip lands at the (150,30) anchor.
          ============================================================ */}
      <g className="pointLayer">
        {/* folded-knuckles lump integrated into the palm top — reads as the
            curled fingers tucked away. Sits to the RIGHT of the extended index. */}
        <rect x="150" y="160" width="80" height="74" rx="36" ry="36" fill={fill} />
        {/* thumb sticking OUT to the side — together with the index-on-the-left
            this reads as a POINTING hand (not a single centered finger). */}
        <path d={finger(150, 250, 214, 214, 34)} fill={fill} />
        {/* the extended INDEX — the pointer/poker, tip at the reach anchor */}
        <path
          d={finger(pointIndex.bx, pointIndex.by, pointIndex.tx, pointIndex.ty, pointIndex.w)}
          fill={fill}
        />
        {/* FINGERNAIL on the extended index — inside .pointLayer so it
            crossfades + jabs (--poke) with the pointing finger. */}
        <path
          d={nail(pointIndex.bx, pointIndex.by, pointIndex.tx, pointIndex.ty, pointIndex.w)}
          fill={nailFill}
        />
      </g>
    </svg>
  );
}
