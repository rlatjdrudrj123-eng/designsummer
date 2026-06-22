"use client";

import { Saira_Condensed } from "next/font/google";
import type { CSSProperties } from "react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { speakers, type Speaker } from "@/lib/content";
import { imageUrl, workImages } from "@/lib/images";
import { conference, type TimetableRow } from "@/lib/conference";
import styles from "./Hand.module.css";
import HandSilhouette from "./HandSilhouette";
import Mote from "./Mote";

/**
 * Condensed grotesque for ALL Latin/display text in this variant — the closest
 * widely-available substitute for Franklin Gothic Demi Condensed. Scoped to
 * this variant via the --hand-condensed CSS var on the root wrapper; Korean
 * copy stays on --font-kr.
 */
const condensed = Saira_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--hand-condensed",
  display: "swap",
});

/* ── speaker lookup ──────────────────────────────────────────────────────────
   The official timetable rows reference a studio by its Korean name. We resolve
   each session row to its full Speaker record (portrait, credentials, work
   thumbnails, studioEn) by matching on the studio name so timetable rows can be
   ENRICHED without duplicating any facts. */
const speakerByStudio = new Map<string, Speaker>(
  speakers.map((s) => [s.studio, s]),
);
function resolveSpeaker(row: TimetableRow): Speaker | undefined {
  if (!row.studio) return undefined;
  return speakerByStudio.get(row.studio);
}

/* =============================================================
   IDEA TARGETS — the floating "ideas" the corner hand pokes.
   Authored in hero-normalized coords (0..1 of the hero box), so they
   place responsively. Each carries a tiny tagline (short, no fabricated
   facts) that flashes on a successful poke. Kept to 4 — calm field.
   ============================================================= */
type IdeaTarget = {
  id: string;
  /** position as a fraction of the hero box (0..1) */
  x: number;
  y: number;
  /** base float size in px */
  size: number;
  /** short label shown on poke (concept beats — not stats) */
  label: string;
};

const IDEAS: IdeaTarget[] = [
  { id: "spark-1", x: 0.22, y: 0.3, size: 30, label: "Spark" },
  { id: "spark-2", x: 0.46, y: 0.2, size: 38, label: "Idea" },
  { id: "spark-3", x: 0.64, y: 0.36, size: 26, label: "Light" },
  { id: "spark-4", x: 0.36, y: 0.5, size: 22, label: "Catch" },
];

/* The index FINGERTIP's position inside the 300×520 hand+arm viewBox is (150,30),
   i.e. fraction TIP_FY = 30/520 ≈ 0.058 down from the box TOP. The limb is one
   rigid SVG authored pointing UP with the fingertip as the reach anchor:
   Hand.module.css (.handBox, --tip-fy) translates the whole box so the fingertip
   lands at the FAR END of the reach (pivotY − reach). The landing is done
   entirely in CSS via --reach, so no per-frame tip math is needed here. */

/* A poke reaction (spark) dropped at the clicked point, in hero-local px. */
export type Spark = { id: number; x: number; y: number };

/**
 * Anchored REACHING-ARM controller. Pure rAF + CSS custom props, no libraries.
 *
 * The arm's shoulder/pivot is ANCHORED at the hero's BOTTOM-RIGHT corner and
 * NEVER detaches. The arm+hand is ONE rigid SVG (forearm → wrist → palm →
 * fingers); we ROTATE it about the corner and TRANSLATE it out so the index
 * fingertip reaches the click — the forearm tail stays clipped off the corner,
 * so the limb always reads as rooted. On a click ANYWHERE in the hero we convert
 * the point to a (angle, distance) from the corner pivot and run a one-shot
 * state machine:
 *
 *   idle   → arm mostly retracted, the hand peeks in (forearm tail off-corner),
 *            gentle breathing
 *   reach  → ROTATE the whole arm about the pivot to aim at the click AND
 *            TRANSLATE the rigid limb out so the fingertip reaches the point
 *   poke   → a short index-finger jab at the target; fires the spark reaction
 *   retract→ pull the limb back in + rotate back to the resting angle
 *   idle   → breathing resumes
 *
 * Writes onto the hero element (read by Hand.module.css):
 *   --aim     arm rotation about the corner pivot, in deg (0 = resting angle)
 *   --reach   distance in px from the corner pivot to the index fingertip
 *   --curl    0..1 fold envelope for the four non-index digits (0 open, 1 fist)
 *   --poke    0..1 extra index-finger extend envelope on the jab
 *   --breath  slow idle breath offset (-1..1), only while idle
 *
 * The arm's LOCAL reach axis points straight UP (−Y) out of the pivot; --aim
 * rotates that axis to the target. So aim(deg) = targetAngleFromPivot + 90,
 * where targetAngleFromPivot = atan2(dy, dx) and (dx,dy) is the click relative
 * to the corner pivot (both ≤ 0 → up-left). At rest --aim sits at REST_AIM so
 * the retracted arm peeks in from the corner toward the hero interior.
 *
 * onImpact(point) fires once, at the contact moment.
 */
function useHandControl(
  onImpact: (point: { x: number; y: number; ideaId?: string }) => void,
) {
  const heroRef = useRef<HTMLElement | null>(null);
  const handRef = useRef<HTMLDivElement | null>(null);
  const forearmRef = useRef<SVGPathElement | null>(null);
  const reduceRef = useRef(false);

  // a poke request queued from a click/tap: hero-local point + optional idea id
  const pokeReq = useRef<{ x: number; y: number; ideaId?: string } | null>(
    null,
  );
  const onImpactRef = useRef(onImpact);
  onImpactRef.current = onImpact;

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reduce = !!(
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    reduceRef.current = reduce;

    // The resting arm: a short reach, aimed up-and-to-the-left so the retracted
    // hand peeks in from the bottom-right corner. REST_AIM is measured from the
    // local UP axis (negative = tilt left), REST_REACH is the idle forearm
    // length in px. Recomputed on resize so they track the hero / box size.
    const REST_AIM = -34; // deg from up-axis → arm leans up-left at rest
    let restReach = 150;
    let pivotX = 0; // corner pivot, hero-local px
    let pivotY = 0;
    let handH = 380; // rendered hand-box height (px)
    let handW = 220; // rendered hand-box width (px)
    const measure = () => {
      const hb = handRef.current?.getBoundingClientRect();
      // the hand box is 300×520 (W×H); use its rendered HEIGHT for rest reach so
      // the hand (palm + fingers) clearly clears the corner.
      handW = hb?.width ?? 220;
      handH = hb?.height ?? handW * 1.7333;
      // pivot = the hero's bottom-right CORNER, matching the CSS .armRoot
      // transform-origin (right:0; bottom:0; origin 100% 100%) exactly so the
      // limb is always rooted at the corner.
      pivotX = hero.clientWidth;
      pivotY = hero.clientHeight;
      // idle: reach ≈ the distance from the corner up to the fingertip so the
      // whole hand (palm + fingers) peeks in past the corner.
      restReach = handH * 0.62;
    };
    measure();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    ro?.observe(hero);

    // ---- DYNAMIC FOREARM ------------------------------------------------
    // The forearm is NOT part of the hand SVG. Every frame we recompute it in
    // HERO space as a rounded quad whose FAR end is pinned to the hand's WRIST
    // (which moves with --aim/--reach) and whose NEAR end is the fixed SHOULDER
    // anchor just off the hero's bottom-right corner. Because both ends are
    // pinned, corner→wrist always connects with NO gap and telescopes/angles
    // naturally. Drawn BEHIND the hand (lower z) so the wrist/palm overlaps it.
    //
    // In the 300×520 hand viewBox the WRIST sits at y≈300 (the palm base), the
    // FINGERTIP at y=30. So along the local pointing axis the wrist is below the
    // fingertip by (300−30)/520 of the box height; the half-width of the wrist
    // is ~56/300 of the box width.
    // pin the forearm FAR end a little INSIDE the palm (y≈318, below the wrist
    // line y≈300) so the palm always overlaps the forearm crown by a margin —
    // guaranteeing no seam at the wrist at any reach.
    const WRIST_VY = 318; // forearm far-end y in the 300×520 viewBox
    const TIP_VY = 30; // fingertip y
    const WRIST_HALF_VX = 54; // wrist half-width in viewBox px
    const drawForearm = (aimDeg: number, reach: number) => {
      const path = forearmRef.current;
      if (!path) return;
      const a = (aimDeg * Math.PI) / 180; // aim from the local UP axis
      // local pointing-axis unit vector (CSS +rotate = clockwise): up at aim 0
      const ux = Math.sin(a);
      const uy = -Math.cos(a);
      // perpendicular (hand's local +x / "right" side)
      const rx = Math.cos(a);
      const ry = Math.sin(a);
      // wrist center = fingertip point pulled back along −axis by the
      // tip→wrist span (scaled to rendered px from the viewBox).
      const span = ((WRIST_VY - TIP_VY) / 520) * handH;
      const tipX = pivotX + ux * reach;
      const tipY = pivotY + uy * reach;
      const wcx = tipX - ux * span;
      const wcy = tipY - uy * span;
      const wHalf = (WRIST_HALF_VX / 300) * handW;
      // FAR end (at the wrist) corners
      const fLx = wcx + rx * wHalf;
      const fLy = wcy + ry * wHalf;
      const fRx = wcx - rx * wHalf;
      const fRy = wcy - ry * wHalf;
      // NEAR end = fixed shoulder anchor just past the corner, a fixed width.
      // Anchored a touch beyond the bottom-right corner so it always reads as
      // rooted off-edge regardless of aim.
      const nearHalf = wHalf * 1.25;
      const ax = pivotX + 26; // slightly past the right edge
      const ay = pivotY + 26; // slightly past the bottom edge
      // give the near end a width oriented along the SAME perpendicular as the
      // far end so the quad never twists into a bowtie.
      const nLx = ax + rx * nearHalf;
      const nLy = ay + ry * nearHalf;
      const nRx = ax - rx * nearHalf;
      const nRy = ay - ry * nearHalf;
      // control point pushed a touch PAST the wrist (along +axis) so the far end
      // is a gentle convex crown (the palm overlaps it anyway).
      const cx = wcx + ux * wHalf * 0.5;
      const cy = wcy + uy * wHalf * 0.5;
      // rounded quad: near-left → far-left → (crown over the wrist) → far-right
      // → near-right.
      const d =
        `M ${nLx.toFixed(1)} ${nLy.toFixed(1)} ` +
        `L ${fLx.toFixed(1)} ${fLy.toFixed(1)} ` +
        `Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${fRx.toFixed(1)} ${fRy.toFixed(1)} ` +
        `L ${nRx.toFixed(1)} ${nRy.toFixed(1)} ` +
        `Z`;
      path.setAttribute("d", d);
    };

    const setProps = (
      aim: number,
      reach: number,
      curl: number,
      poke: number,
      breath: number,
    ) => {
      hero.style.setProperty("--aim", `${aim.toFixed(2)}deg`);
      hero.style.setProperty("--reach", `${reach.toFixed(2)}px`);
      hero.style.setProperty("--curl", curl.toFixed(4));
      hero.style.setProperty("--poke", poke.toFixed(4));
      hero.style.setProperty("--breath", breath.toFixed(4));
      // forearm follows the wrist every frame, including the idle breath sway.
      drawForearm(aim + breath * 0.6, reach);
    };

    // ---- reduced motion: the arm simply rests, peeking from the corner. No
    // rAF, no reach. A click still drops a spark + flips to the point state
    // (handled by pokeAt). The forearm is redrawn on resize so it stays pinned
    // to the wrist at the rest pose.
    if (reduce) {
      const restSnap = () => setProps(REST_AIM, restReach, 0, 0, 0);
      restSnap();
      const ro2 =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              measure();
              restSnap();
            })
          : null;
      ro2?.observe(hero);
      return () => {
        ro?.disconnect();
        ro2?.disconnect();
      };
    }

    // place the arm at its resting pose immediately (avoid a 1-frame flash).
    setProps(REST_AIM, restReach, 0, 0, 0);

    let raf = 0;
    let prev = performance.now();
    const start = prev;

    // state machine
    type Phase = "idle" | "reach" | "poke" | "retract";
    let phase: Phase = "idle";
    let phaseT = 0; // seconds into the current phase

    // current eased aim/reach (so a new click hands off smoothly from wherever)
    let curAim = REST_AIM;
    let curReach = restReach;

    // the move being executed
    let fromAim = REST_AIM;
    let fromReach = restReach;
    let destAim = REST_AIM;
    let destReach = restReach;
    let targetPt = { x: 0, y: 0 }; // hero-local px the fingertip lands on
    let aimedIdea: string | undefined;
    let impactFired = false;

    const REACH_DUR = 0.4; // s — rotate + extend out to the point
    const POKE_DUR = 0.16; // s — the index jab on arrival
    const RETRACT_DUR = 0.52; // s — shorten + return to resting angle

    const easeOut = (a: number) => 1 - Math.pow(1 - a, 3);
    const easeInOut = (a: number) =>
      a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2;

    const beginReach = (tx: number, ty: number, ideaId?: string) => {
      aimedIdea = ideaId;
      targetPt = { x: tx, y: ty };
      // vector from the corner pivot to the click (up-left → both ≤ 0)
      const dx = tx - pivotX;
      const dy = ty - pivotY;
      const dist = Math.hypot(dx, dy);
      // angle of the target from the pivot; aim is measured from the UP axis,
      // so aim = atan2(dy,dx) + 90°.
      const angDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      fromAim = curAim;
      fromReach = curReach;
      destAim = angDeg + 90;
      // forearm length so the index fingertip lands on the click; clamp so the
      // arm never fully collapses below its resting peek.
      destReach = Math.max(restReach, dist);
      phase = "reach";
      phaseT = 0;
      impactFired = false;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
      prev = now;
      const t = (now - start) / 1000;
      phaseT += dt;

      // pick up a queued click only when idle (otherwise it waits its turn)
      if (phase === "idle" && pokeReq.current) {
        const { x, y, ideaId } = pokeReq.current;
        pokeReq.current = null;
        beginReach(x, y, ideaId);
      }

      let poke = 0;
      let breath = 0;
      // fold envelope for the four non-index digits (0 open … 1 curled).
      let curl = 0;

      if (phase === "idle") {
        breath = Math.sin(t * 0.62);
        // ease aim/reach back to the resting peek (a new click overrides this)
        curAim += (REST_AIM - curAim) * (1 - Math.pow(0.01, dt));
        curReach += (restReach - curReach) * (1 - Math.pow(0.01, dt));
        curl = 0; // open hand at rest
      } else if (phase === "reach") {
        const a = Math.min(1, phaseT / REACH_DUR);
        const e = easeOut(a);
        curAim = fromAim + (destAim - fromAim) * e;
        curReach = fromReach + (destReach - fromReach) * e;
        // curl the four digits toward a pointing index as the arm reaches out
        curl = easeOut(Math.min(1, a / 0.85));
        if (a >= 1) {
          curAim = destAim;
          curReach = destReach;
          phase = "poke";
          phaseT = 0;
        }
      } else if (phase === "poke") {
        const a = Math.min(1, phaseT / POKE_DUR);
        // a quick lunge to full index-extend then a snappy settle
        poke = a < 0.45 ? easeOut(a / 0.45) : 1 - easeOut((a - 0.45) / 0.55);
        curl = 1; // four digits held folded while the index jabs
        // fire the contact reaction once, at the lunge peak, at the target pt
        if (!impactFired && a >= 0.4) {
          impactFired = true;
          onImpactRef.current({
            x: targetPt.x,
            y: targetPt.y,
            ideaId: aimedIdea,
          });
        }
        if (a >= 1) {
          phase = "retract";
          phaseT = 0;
          fromAim = curAim;
          fromReach = curReach;
        }
      } else if (phase === "retract") {
        const a = Math.min(1, phaseT / RETRACT_DUR);
        const e = easeInOut(a);
        curAim = fromAim + (REST_AIM - fromAim) * e;
        curReach = fromReach + (restReach - fromReach) * e;
        // re-open the four digits on the way home: 1 → 0
        curl = 1 - easeInOut(a);
        if (a >= 1) {
          curAim = REST_AIM;
          curReach = restReach;
          phase = "idle";
          phaseT = 0;
        }
      }

      setProps(curAim, curReach, curl, poke, breath);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, []);

  /**
   * Queue a poke at a hero-local point. Returns true if a travel poke was
   * queued; false under reduced-motion (caller drops the spark instantly).
   */
  const pokeAt = useCallback((x: number, y: number, ideaId?: string) => {
    const reduce =
      reduceRef.current ||
      (typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduce) {
      // no travel/poke motion — but show the POINT state instantly (crossfade
      // is just opacity, so this is a hard switch, not animated) so the click
      // still reads as a poke. The spark fires from the caller's handleImpact.
      const hero = heroRef.current;
      if (hero) {
        hero.style.setProperty("--curl", "1");
        hero.style.setProperty("--poke", "1");
      }
      return false;
    }
    pokeReq.current = { x, y, ideaId };
    return true;
  }, []);

  return { heroRef, handRef, forearmRef, pokeAt };
}

function IdeaSpark({
  idea,
  reactCount,
  onActivate,
}: {
  idea: IdeaTarget;
  /** number of successful pokes (0 = never caught) — bumped per poke so the
   *  one-shot CSS burst/pop/label animations REPLAY on every poke via key. */
  reactCount: number;
  onActivate: (id: string, el: HTMLElement) => void;
}) {
  const reacted = reactCount > 0;
  return (
    <button
      type="button"
      className={`${styles.idea} ${reacted ? styles.ideaReacted : ""}`}
      style={
        {
          left: `${idea.x * 100}%`,
          top: `${idea.y * 100}%`,
          ["--idea-size" as string]: `${idea.size}px`,
        } as CSSProperties
      }
      onClick={(e) => {
        // don't also bubble to the hero (which would fire a second poke)
        e.stopPropagation();
        onActivate(idea.id, e.currentTarget);
      }}
      aria-label={`아이디어 잡기 — ${idea.label}`}
      aria-pressed={reacted}
    >
      {/* the floating idea glint. Keyed on reactCount so the POP animation
          restarts on every poke (a fresh node each time). */}
      <span key={`glow-${reactCount}`} className={styles.ideaGlow} aria-hidden="true">
        <Mote size={idea.size} fill="var(--hand-glint)" />
      </span>
      {/* spark burst that fires on poke impact — keyed to replay each poke */}
      <span key={`burst-${reactCount}`} className={styles.ideaBurst} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={styles.burstRay}
            style={{ ["--ray" as string]: `${i * 60}deg` } as CSSProperties}
          />
        ))}
      </span>
      {/* the short tagline that flashes in on a successful poke */}
      <span key={`label-${reactCount}`} className={styles.ideaLabel} aria-hidden="true">
        {idea.label}
      </span>
    </button>
  );
}

/**
 * Speaker index column for the hero — purely informational (no hover→hand
 * coupling; the hand interaction lives in the idea-poke field). Reads the
 * official timetable so the lineup count/names always match the program.
 */
function IndexCol({
  day,
  date,
  rows,
}: {
  day: number;
  date: string;
  rows: TimetableRow[];
}) {
  const sessions = rows.filter((r) => (r.kind ?? "session") === "session");
  return (
    <div className={styles.indexCol}>
      <div className={styles.indexHead}>
        <span className={styles.dayno}>DAY {day}</span>
        <span>{date}</span>
      </div>
      <ul className={styles.indexList}>
        {sessions.map((r, i) => {
          const sp = resolveSpeaker(r);
          return (
            <li key={r.studio ?? i} className={styles.indexItem}>
              {sp?.studioEn ?? r.studio}
              <span className={styles.idxNum} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* A single detailed timetable row. Registration & break rows render as quiet
   marker rows; session rows are ENRICHED with the matched speaker's portrait
   and credentials pulled from @/lib/content + @/lib/images. */
function ProgramRow({ row }: { row: TimetableRow }) {
  const kind = row.kind ?? "session";

  if (kind === "reg" || kind === "break") {
    return (
      <div className={`${styles.ttRow} ${styles.ttRowMeta}`}>
        <div className={styles.ttTime}>{row.time}</div>
        <div className={styles.ttMetaLabel}>
          <span className={styles.ttKindTag}>
            {kind === "reg" ? "등록" : "휴식"}
          </span>
          {row.title}
        </div>
      </div>
    );
  }

  const sp = resolveSpeaker(row);
  const portrait = sp ? imageUrl(`speaker-${sp.id}`) : null;
  const works = sp ? workImages(sp.id) : [];
  const creds = sp?.credentials ?? [];

  return (
    <div className={`${styles.ttRow} ${styles.ttRowSession}`}>
      <div className={styles.ttTime}>{row.time}</div>
      <div className={styles.ttSession}>
        <div className={styles.ttSessionHead}>
          {portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.ttPortrait}
              src={portrait}
              alt={`${row.studio} ${sp?.name ?? ""}`}
              loading="lazy"
            />
          ) : (
            <div className={styles.ttPortraitPh} aria-hidden="true">
              {(sp?.studioEn ?? row.studio ?? "·").charAt(0).toUpperCase()}
            </div>
          )}
          <div className={styles.ttSessionMeta}>
            <span className={styles.ttStudio}>{row.studio}</span>
            {sp?.studioEn && (
              <span className={styles.ttStudioEn}>{sp.studioEn}</span>
            )}
            <span className={styles.ttSpeaker}>{row.speaker}</span>
          </div>
        </div>
        <b className={styles.ttTitle}>{row.title}</b>
        {row.desc && <p className={styles.ttDesc}>{row.desc}</p>}
        {creds.length > 0 && (
          <ul className={styles.ttCreds}>
            {creds.slice(0, 3).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
        {works.length > 0 && (
          <div
            className={styles.ttWorks}
            role="group"
            aria-label={`${row.studio} 대표작`}
          >
            {works.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                className={styles.ttWork}
                src={src}
                alt={`${row.studio} 대표작 ${i + 1}`}
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Hand() {
  const { hero, about, audience, timetable, benefits, info, faq } = conference;

  // which ideas have reacted (lit up). A poke re-fires the reaction, so we
  // bump a counter to retrigger the CSS burst animation.
  const [reacted, setReacted] = useState<Record<string, number>>({});
  // transient spark marks dropped at each poke's contact point (hero-local px)
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkId = useRef(0);

  // FAQ accordion: which item is open (single-open). CSS/JS only.
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const dropSpark = useCallback((x: number, y: number) => {
    const id = ++sparkId.current;
    setSparks((s) => [...s, { id, x, y }]);
    // self-clean after the CSS burst finishes
    window.setTimeout(() => {
      setSparks((s) => s.filter((sp) => sp.id !== id));
    }, 700);
  }, []);

  // contact reaction: drop a spark at the poked point + pop any aimed idea
  const handleImpact = useCallback(
    (point: { x: number; y: number; ideaId?: string }) => {
      const ideaId = point.ideaId;
      if (ideaId) {
        // an idea was hit — it fires its own pop + burst; no extra spark mark
        setReacted((m) => ({ ...m, [ideaId]: (m[ideaId] ?? 0) + 1 }));
      } else {
        // empty space — leave a small spark mark at the contact point
        dropSpark(point.x, point.y);
      }
    },
    [dropSpark],
  );

  const { heroRef, handRef, forearmRef, pokeAt } = useHandControl(handleImpact);

  // hero-local point from any pointer event
  const localPoint = useCallback((clientX: number, clientY: number) => {
    const el = heroRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }, [heroRef]);

  // CLICK ANYWHERE in the hero → send the hand to that point and poke it.
  const handleHeroPoke = useCallback(
    (clientX: number, clientY: number, ideaId?: string) => {
      const p = localPoint(clientX, clientY);
      if (!p) return;
      const queued = pokeAt(p.x, p.y, ideaId);
      // reduced-motion (no travel): react instantly at the point
      if (!queued) handleImpact({ x: p.x, y: p.y, ideaId });
    },
    [localPoint, pokeAt, handleImpact],
  );

  const onHeroClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      // don't fire the travelling poke when the user is interacting with a CTA
      // or other control inside the hero (buttons handle their own action).
      if ((e.target as HTMLElement).closest("a,button")) return;
      handleHeroPoke(e.clientX, e.clientY);
    },
    [handleHeroPoke],
  );

  // an idea target was clicked: aim the hand at the idea's center so the jab
  // pops it (the idea button stops the click from double-firing the hero).
  const activateIdea = useCallback(
    (id: string, el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      handleHeroPoke(r.left + r.width / 2, r.top + r.height / 2, id);
    },
    [handleHeroPoke],
  );

  return (
    <div className={`${styles.wrap} ${condensed.variable}`}>
      {/* ===================== HERO =====================
           Clicking ANYWHERE in the hero (except controls) sends the hand
           travelling to that point and pokes it (see useHandControl). The idea
           targets below stopPropagation and aim the poke at themselves. */}
      <header className={styles.hero} ref={heroRef} onClick={onHeroClick}>
        {/* wordmark — top, biased right */}
        <div className={styles.wordmark}>
          K<em>·</em>print
        </div>

        {/* editorial meta rail — the official badge rides the top rule */}
        <div className={styles.metaRail} aria-hidden="true">
          <span className={styles.metaCode}>
            DS <em>/ 2026</em>
          </span>
          <span className={styles.metaTags}>
            <span>{hero.badge}</span>
          </span>
        </div>

        {/* far-left vertical edge marker (desktop only) */}
        <div className={styles.edgeMark} aria-hidden="true">
          <span>Design Summer — Ilsan · 2026</span>
        </div>

        {/* ---- IDEA FIELD : the floating, pokeable ideas ---- */}
        <div className={styles.ideaField}>
          {IDEAS.map((idea) => (
            <IdeaSpark
              key={idea.id}
              idea={idea}
              reactCount={reacted[idea.id] ?? 0}
              onActivate={activateIdea}
            />
          ))}
        </div>

        {/* ---- spark marks — a quick burst left at each poke's contact point.
             Positioned in hero-local px by the rAF impact callback. ---- */}
        <div className={styles.sparkLayer} aria-hidden="true">
          {sparks.map((sp) => (
            <span
              key={sp.id}
              className={styles.spark}
              style={{ left: `${sp.x}px`, top: `${sp.y}px` }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={styles.sparkRay}
                  style={{ ["--ray" as string]: `${i * 60}deg` } as CSSProperties}
                />
              ))}
            </span>
          ))}
        </div>

        {/* ---- DYNAMIC FOREARM — a hero-space SVG path recomputed every frame
             by useHandControl (drawForearm): NEAR end pinned just off the
             bottom-right corner, FAR end pinned to the hand's WRIST. Drawn here
             FIRST (lower in the stack) so the hand's palm/wrist overlaps it with
             no seam; it telescopes/angles to always connect corner→wrist. ---- */}
        <svg
          className={styles.forearmSvg}
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path ref={forearmRef} className={styles.forearmPath} d="" />
        </svg>

        {/* ---- the reaching HAND — its shoulder/pivot ANCHORED at the
             bottom-right corner; it never detaches. ---- */}
        <div className={styles.armRoot} aria-hidden="true">
          <div className={styles.handBox} ref={handRef}>
            <HandSilhouette />
          </div>
        </div>

        {/* hint line — how to play */}
        <p className={styles.hint} aria-hidden="true">
          Click anywhere — <span>catch an idea</span>
        </p>

        {/* ===== HERO LEFT COLUMN =====
            One bottom-left flow column so the pieces stack with guaranteed
            spacing and never overlap each other, the index column, or the
            corner hand. Order: tagline → title → subtitle → desc → facts → the
            two per-day CTAs. Width is capped clear of the right index column. */}
        <div className={styles.heroLeft}>
          {/* CATCH tagline — above the title */}
          <p className={styles.tagline}>
            <span className={styles.catch}>Catch</span> the{" "}
            <span className={styles.spk}>idea</span>
          </p>

          {/* big display title — single line, Title Case.
              KEEP the "Design Summer Ilsan" one-line treatment (Ilsan accent). */}
          <h1 className={styles.display} aria-label="Design Summer Ilsan">
            <span className={styles.titleMain}>Design Summer</span>{" "}
            <span className={styles.titleIlsan}>Ilsan</span>
          </h1>

          {/* hero copy block — subtitle, desc, date+time, venue, TWO per-day
              CTAs, all in the same flow column under the title. */}
          <div className={styles.heroIntro}>
            <p className={styles.heroSubtitle}>{hero.subtitle}</p>
            <p className={styles.heroDesc}>{hero.desc}</p>
            <div className={styles.heroFacts}>
              <span className={styles.heroFactDate}>{hero.date}</span>
              <span className={styles.heroFactVenue}>{hero.venue}</span>
            </div>
            <div className={styles.heroCtas}>
              {hero.register.map((r) => (
                <a
                  key={r.day}
                  className={`${styles.heroCta} ${
                    r.day === 1 ? styles.heroCtaD1 : styles.heroCtaD2
                  }`}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.label} <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* speaker index columns — MID-RIGHT, built from the official program */}
        <div className={styles.indexStack}>
          <div className={styles.index}>
            <IndexCol
              day={1}
              date={timetable.day1.date}
              rows={timetable.day1.rows}
            />
          </div>
          <div className={styles.index}>
            <IndexCol
              day={2}
              date={timetable.day2.date}
              rows={timetable.day2.rows}
            />
          </div>
        </div>
      </header>

      {/* ===================== ABOUT (행사 개요) ===================== */}
      <section className={`${styles.section} ${styles.intro}`} aria-labelledby="hand-about">
        <div className={styles.inner}>
          <span className={styles.kicker}>About · 행사 개요</span>
          <h2 id="hand-about" className={styles.introLead}>
            <span className={styles.catch}>Catch</span> the{" "}
            <span className={styles.spk}>idea</span>
          </h2>
          <p className={styles.introBody}>{about.intro}</p>

          <div className={styles.conceptRow}>
            {about.days.map((d, i) => (
              <div
                key={d.day}
                className={`${styles.conceptCard} ${i === 1 ? styles.alt : ""}`}
              >
                <div className={styles.conceptEn}>DAY {d.day}</div>
                <div className={styles.conceptDate}>{d.date}</div>
                <div className={styles.conceptTitle}>{d.title}</div>
                <p className={styles.conceptBody}>{d.body}</p>
              </div>
            ))}
          </div>

          {/* the note: per-day registration explainer */}
          <p className={styles.aboutNote}>{hero.note}</p>
        </div>
      </section>

      {/* ===================== 추천 대상 (TARGET AUDIENCE) ===================== */}
      <section className={`${styles.section} ${styles.audience}`} aria-labelledby="hand-aud">
        <div className={styles.inner}>
          <span className={styles.kicker}>Who · 추천 대상</span>
          <h2 id="hand-aud" className={styles.lineupTitle}>
            이런 분께 권합니다
          </h2>
          <div className={styles.audGrid}>
            <div className={styles.audCard}>
              <div className={styles.audDay}>DAY 1</div>
              <h3 className={styles.audHeading}>{audience.day1.heading}</h3>
              <ul className={styles.audList}>
                {audience.day1.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.audCard} ${styles.alt}`}>
              <div className={styles.audDay}>DAY 2</div>
              <h3 className={styles.audHeading}>{audience.day2.heading}</h3>
              <ul className={styles.audList}>
                {audience.day2.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TIMETABLE (상세 프로그램) ===================== */}
      <section className={`${styles.section} ${styles.timetable}`} aria-labelledby="hand-tt">
        <div className={styles.inner}>
          <span className={styles.kicker}>Schedule · 상세 프로그램</span>
          <h2 id="hand-tt" className={`${styles.lineupTitle} ${styles.lineupTitleDark}`}>
            Timetable
          </h2>
          <div className={styles.ttGrid}>
            {[timetable.day1, timetable.day2].map((d) => (
              <div key={d.day} className={styles.ttCol}>
                <h3>Day {d.day}</h3>
                <div className={styles.ttColDate}>
                  {d.date} · {d.title}
                </div>
                <div className={styles.ttRows}>
                  {d.rows.map((row, i) => (
                    <ProgramRow key={`${d.day}-${i}`} row={row} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 참가 혜택 (BENEFITS) ===================== */}
      <section className={`${styles.section} ${styles.benefits}`} aria-labelledby="hand-ben">
        <div className={styles.inner}>
          <span className={styles.kicker}>Benefits · 참가 혜택</span>
          <h2 id="hand-ben" className={`${styles.lineupTitle} ${styles.sparkTitle}`}>
            Catch more
            <span className={styles.titleStar} aria-hidden="true">
              <Mote size={44} fill="var(--hand-glint)" rotate={10} />
            </span>
          </h2>
          <div className={styles.benGroups}>
            {benefits.groups.map((g, gi) => (
              <div key={gi} className={styles.benGroup}>
                <h3 className={styles.benHeading}>{g.heading}</h3>
                <div className={styles.benItems}>
                  {g.items.map((it, ii) => (
                    <div key={ii} className={styles.benItem}>
                      <b className={styles.benItemTitle}>{it.title}</b>
                      <p className={styles.benItemBody}>{it.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 안내·오시는 길 (INFO & VENUE) ===================== */}
      <section className={`${styles.section} ${styles.venue}`} aria-labelledby="hand-info">
        <div className={styles.inner}>
          <span className={styles.kicker}>Info · 안내 및 오시는 길</span>
          <div className={styles.venueGrid}>
            <div className={styles.venueBig} id="hand-info">
              <span className={styles.yr}>2026</span>
              08.20 – 21
            </div>
            <div className={styles.venueFacts}>
              <div className={styles.fact}>
                <span className={styles.factK}>Host · 주최</span>
                <span className={styles.factV}>{info.host}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factK}>Capacity · 정원</span>
                <span className={styles.factV}>{info.capacity}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factK}>Price · 참가비</span>
                <span className={styles.factV}>{info.price}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factK}>Address · 오시는 길</span>
                <span className={styles.factV}>{info.address}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factK}>Parking · 주차</span>
                <span className={styles.factV}>{info.parking}</span>
              </div>
            </div>
          </div>

          {/* per-day registration CTAs repeated near the bottom */}
          <div className={styles.venueCtas}>
            {hero.register.map((r) => (
              <a
                key={r.day}
                className={`${styles.heroCta} ${
                  r.day === 1 ? styles.heroCtaD1 : styles.heroCtaD2
                }`}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.label} <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className={`${styles.section} ${styles.faq}`} aria-labelledby="hand-faq">
        <div className={styles.inner}>
          <span className={styles.kicker}>FAQ · 자주 묻는 질문</span>
          <h2 id="hand-faq" className={`${styles.lineupTitle} ${styles.lineupTitleDark}`}>
            Questions
          </h2>
          <div className={styles.faqList}>
            {faq.map((item, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  className={`${styles.faqItem} ${open ? styles.faqOpen : ""}`}
                >
                  <button
                    type="button"
                    className={styles.faqQ}
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    <span className={styles.faqQText}>{item.q}</span>
                    <span className={styles.faqMark} aria-hidden="true">
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  {open && <p className={styles.faqA}>{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerMark}>
            Design Summer <em>Ilsan</em>
          </div>
          <div className={styles.footerMeta}>
            <div>{info.host}</div>
            <div>{hero.venue}</div>
            <div>{hero.date}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
