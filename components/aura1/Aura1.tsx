"use client";

/* ============================================================================
 * Aura1 — the FULL warm-Aura page (identical composition to `<DevelopSite aura />`,
 * i.e. the standalone /aura page) with ONE addition: a sticky top anchor-nav bar
 * that smooth-scrolls to the Day 1 / Day 2 sections.
 *
 * Everything below the hero is the same continuous warm aura ground
 * (PostHeroRegion with aura) holding the same shared develop components, in the
 * same order. The only structural change vs DevelopSite is that DayBlock(1) and
 * DayBlock(2) are each wrapped in an anchor target (#day1 / #day2) so the nav can
 * scroll to them, and a sticky <nav> sits above the region.
 *
 * Shared develop components are imported + reused as-is — none are modified.
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import Hero from "./Hero";
import Overview from "./Overview";
import Lineup from "./Lineup";
import Timetable from "./Timetable";
import Benefits from "./Benefits";
import Directions from "./Directions";
import Faq from "./Faq";
import Footer from "./Footer";
import Apply from "./Apply";
import ScrollCue from "./ScrollCue";
import PostHeroRegion from "@/components/develop/PostHeroRegion";
import styles from "./Aura1.module.css";

/* sticky anchor-nav entries — labels per the client feedback. */
const NAV = [
  { id: "day1", label: "Day 1. 디자인의 새로운 관점", date: "8.20 목" },
  { id: "day2", label: "Day 2. 디자인 실무의 확장", date: "8.21 금" },
];

export default function Aura1() {
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /* ── CURSOR LIGHT-SPOT (역발상) ─────────────────────────────────────────────
   * A soft WHITE radial glow follows the pointer over the below-hero content and
   * LIGHTENS the warm aura locally (mix-blend-mode: soft-light), so the content
   * under the cursor pops / reads more clearly. The spot is a single fixed,
   * pointer-events:none element transform-translated to the cursor; the move is
   * rAF-throttled so we never thrash layout. It is only active while the pointer
   * is over the post-hero region (mouse enter/leave on the wrapper), and is fully
   * disabled on touch (pointer: coarse) and prefers-reduced-motion — both guarded
   * in CSS (the .spot is display:none) AND here (no listeners attached). */
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const spotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const body = bodyRef.current;
    const spot = spotRef.current;
    if (!body || !spot || typeof window === "undefined") return;
    if (typeof window.matchMedia !== "function") return;

    // Guard: skip entirely on touch (no fine pointer) or reduced-motion.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    let queued = false;

    const paint = () => {
      queued = false;
      // translate from the spot's own centre (offsets handled in CSS via -50%).
      spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(paint);
      }
    };
    const onEnter = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      paint();
      spot.dataset.on = "1";
    };
    const onLeave = () => {
      spot.dataset.on = "0";
    };

    body.addEventListener("mousemove", onMove, { passive: true });
    body.addEventListener("mouseenter", onEnter);
    body.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      body.removeEventListener("mousemove", onMove);
      body.removeEventListener("mouseenter", onEnter);
      body.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  /* ── DAY-DRIVEN AURA HUE ───────────────────────────────────────────────────
   * The warm background must read RED while DAY 1 (and everything above it) is
   * the dominant part of the page, then shift to GOLD once DAY 2 (and below) is
   * dominant — the transition landing around the Day1→Day2 boundary, not at the
   * very bottom. We watch the #day1 / #day2 anchor sections with an
   * IntersectionObserver and derive a TARGET hue (0 = red / Day1, 1 = gold /
   * Day2): once Day 2's section has crossed up past the vertical midpoint of the
   * viewport it becomes dominant. The target is eased every frame so the colour
   * drifts smoothly, and the eased value is passed to PostHeroRegion → the warm
   * field tracks the day instead of the old bottom-of-page scroll formula.
   * Honours prefers-reduced-motion: no rAF easing, the hue snaps to the target. */
  const [hue, setHue] = useState(0);
  const targetHueRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const day1 = document.getElementById("day1");
    const day2 = document.getElementById("day2");
    if (!day1 || !day2) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Compute the target hue from the live geometry of the two anchors.
    // Day 2 is "dominant" once the midpoint between Day1's top and Day2's top has
    // scrolled above the viewport's vertical centre — i.e. the reader has moved
    // from the Day1 region into the Day2 region. We map a short band around that
    // boundary to a smooth 0→1 ramp so the red↔gold hand-off feels gradual.
    const computeTarget = () => {
      const vh = window.innerHeight || 1;
      const center = vh * 0.5;
      const t1 = day1.getBoundingClientRect().top;
      const t2 = day2.getBoundingClientRect().top;
      // boundary = where Day 2 begins; ramp over the gap between the two days so
      // the colour eases across the Day1→Day2 seam rather than flipping.
      const span = Math.max(1, t2 - t1);
      // progress of the viewport centre through [Day1 top .. Day2 top]
      const p = (center - t1) / span;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    };

    const apply = () => {
      targetHueRef.current = computeTarget();
      if (reduce) setHue(targetHueRef.current);
    };

    // IntersectionObserver wakes the calc whenever either day enters/leaves or
    // crosses threshold steps; a scroll listener keeps it live in between.
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(apply, { threshold: thresholds })
        : null;
    io?.observe(day1);
    io?.observe(day2);

    const onScroll = () => apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    apply();

    if (reduce) {
      return () => {
        io?.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    // ease the displayed hue toward the target each frame for a smooth drift.
    let raf = 0;
    const tick = () => {
      setHue((cur) => {
        const next = cur + (targetHueRef.current - cur) * 0.08;
        return Math.abs(next - cur) < 0.0005 ? targetHueRef.current : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Show the (fixed) nav once the hero has scrolled past the top of the viewport.
  // While the hero is in view the nav is hidden and occupies no band — the hero
  // connects directly into the first content section.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Smooth-scroll anchor handler. Honours prefers-reduced-motion (instant jump).
  const onNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const target = document.getElementById(id);
      if (!target) return;
      const reduce =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
      history.replaceState(null, "", `#${id}`);
    },
    []
  );

  return (
    <main>
      <Hero />

      {/* sentinel: when it leaves the viewport top, the nav frosts/pins */}
      <div ref={sentinelRef} className={styles.navSentinel} aria-hidden="true" />

      {/* ── STICKY ANCHOR NAV (the only new element vs the /aura page) ─────── */}
      <nav
        className={`${styles.nav} ${stuck ? styles.navStuck : ""}`}
        aria-label="컨퍼런스 일자 내비게이션"
      >
        <div className={styles.navInner}>
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={styles.navLink}
              onClick={(e) => onNavClick(e, item.id)}
            >
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.navDate}>({item.date})</span>
            </a>
          ))}
        </div>
      </nav>

      {/* ── AURA REGION — same warm ground + same develop sections as /aura,
          plus a DAY-DRIVEN hue: RED while Day 1 dominates, GOLD once Day 2 does.
          Wrapped in bodyRef so the cursor light-spot is scoped to the below-hero
          area only (not the hero). */}
      <div ref={bodyRef} className={styles.body}>
        {/* cursor light-spot — soft white radial that LIGHTENS the warm ground
            under the pointer (soft-light blend). Fixed, pointer-events:none;
            display:none on touch / reduced-motion (see CSS). */}
        <div ref={spotRef} className={styles.spot} data-on="0" aria-hidden="true" />

        <PostHeroRegion aura vivid hue={hue}>
          <Overview />
          <Timetable />
          <div id="day1" className={styles.dayAnchor}>
            <Lineup day={1} />
          </div>
          <div id="day2" className={styles.dayAnchor}>
            <Lineup day={2} />
          </div>
          <Benefits />
          <Directions />
          <Faq />
          <Apply />
          <Footer />
        </PostHeroRegion>
      </div>

      <ScrollCue />
    </main>
  );
}
