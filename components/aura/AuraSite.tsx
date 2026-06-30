"use client";

/* ============================================================================
 * AuraSite — the MAIN `/` page.
 *
 * Keeps the MAIN Hero (components/aura/Hero) UNCHANGED, then mirrors Aura1's
 * below-hero experience: the VIVID warm aura region (PostHeroRegion aura vivid)
 * carrying a DAY-DRIVEN hue (Day1 RED → Day2 GOLD as the reader scrolls) plus a
 * cursor light-spot, wrapping the PHOTO-FREE content sections forked into
 * components/aura/, in order:
 *
 *   Overview → Timetable → Day 1 (#day1) → Day 2 (#day2)
 *            → Benefits → Directions → Faq → Footer
 *
 * Ported from components/aura1/Aura1.tsx (the day-hue IntersectionObserver +
 * the cursor light-spot), MINUS the sticky anchor nav. Speakers in the Day
 * sections come from auraSpeakersByDay (admin-editable) — see Lineup.tsx.
 *
 * /aura1 and /develop and the main Hero are NOT touched.
 * ========================================================================== */

import { useEffect, useRef, useState } from "react";
import Hero from "./Hero";
import Overview from "./Overview";
import Timetable from "./Timetable";
import EventInfo from "./EventInfo";
import Lineup from "./Lineup";
import Benefits from "./Benefits";
import AnimalTest from "./AnimalTest";
import TempTest from "./TempTest";
import Directions from "./Directions";
import Faq from "./Faq";
import ScrollCue from "./ScrollCue";
import FloatingBar from "./FloatingBar";
import PostHeroRegion from "@/components/develop/PostHeroRegion";
import { type Speaker } from "@/lib/content";
import { type ImageMap } from "@/lib/images";
import styles from "./AuraSite.module.css";

export default function AuraSite({
  day1Speakers,
  day2Speakers,
  imageManifest,
}: {
  day1Speakers: Speaker[];
  day2Speakers: Speaker[];
  imageManifest: ImageMap;
}) {
  /* ── CURSOR LIGHT-SPOT (역발상) ─────────────────────────────────────────────
   * A soft warm-cream radial follows the pointer over the below-hero content and
   * gently LIGHTENS the busy warm aura locally so text reads cleaner. A single
   * fixed, pointer-events:none element transform-translated to the cursor; the
   * move is rAF-throttled. Only active while the pointer is over the post-hero
   * region; fully disabled on touch (pointer: coarse) and prefers-reduced-motion
   * — guarded in CSS (.spot is display:none) AND here (no listeners attached). */
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
   * The warm background reads RED while DAY 1 (and above) is dominant, then
   * shifts to GOLD once DAY 2 (and below) is dominant — the transition landing
   * around the Day1→Day2 boundary. We watch the #day1 / #day2 anchor sections
   * and derive a TARGET hue (0 = red / Day1, 1 = gold / Day2); the target is
   * eased every frame so the colour drifts smoothly, and the eased value is
   * passed to PostHeroRegion → the warm field tracks the day.
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

    const computeTarget = () => {
      const vh = window.innerHeight || 1;
      const center = vh * 0.5;
      const t1 = day1.getBoundingClientRect().top;
      const t2 = day2.getBoundingClientRect().top;
      const span = Math.max(1, t2 - t1);
      const p = (center - t1) / span;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    };

    const apply = () => {
      targetHueRef.current = computeTarget();
      if (reduce) setHue(targetHueRef.current);
    };

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

  return (
    <main>
      <FloatingBar />
      <Hero />

      {/* ── VIVID WARM AURA REGION — one continuous warm ground for everything
          below the hero, with a DAY-DRIVEN hue (RED while Day 1 dominates, GOLD
          once Day 2 does). Wrapped in bodyRef so the cursor light-spot is scoped
          to the below-hero area only (not the hero). */}
      <div ref={bodyRef} className={styles.body}>
        {/* cursor light-spot — warm glow that LIGHTENS the warm ground under the
            pointer. Rendered via PostHeroRegion's `behind` slot so it sits
            BETWEEN the aura and the content (behind the text, not washing over
            it). Fixed, pointer-events:none; display:none on touch/reduced-motion. */}
        <PostHeroRegion
          aura
          vivid
          /* hue 를 오렌지 범위로 캡(×0.3) — Day1→Day2 도 주황 가족 안(레드오렌지→앰버)
             에서만 이동하고 노란색까지 가지 않게(노란 배경 = 가독성↓, 키컬러는 주황). */
          hue={hue * 0.3}
          behind={
            <div
              ref={spotRef}
              className={styles.spot}
              data-on="0"
              aria-hidden="true"
            />
          }
        >
          <Overview />
          <Timetable sp1List={day1Speakers} sp2List={day2Speakers} />
          <EventInfo />
          <div id="day1" className={styles.dayAnchor}>
            <Lineup day={1} speakers={day1Speakers} imageManifest={imageManifest} />
          </div>
          <div id="day2" className={styles.dayAnchor}>
            <Lineup day={2} speakers={day2Speakers} imageManifest={imageManifest} />
          </div>
          {/* 동물상 바이럴 테스트 — Benefits 위. */}
          <AnimalTest />
          <Benefits />
          {/* 온도 테스트 — 일단 숨김(클라이언트 요청). 나중에 다시 노출. */}
          {/* <TempTest /> */}
          {/* FAQ 를 오시는 길 위로(클라이언트 요청). */}
          <Faq />
          <Directions />
        </PostHeroRegion>
      </div>

      <ScrollCue />
    </main>
  );
}
