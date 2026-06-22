"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./IndexLineup.module.css";
import { speakers, speakersByDay, formatDate, siteContent } from "@/lib/content";
import type { Speaker } from "@/lib/content";
import WorksStrip from "./WorksStrip";

/**
 * IndexLineup — the NEW concept lineup: a MINIMAL TYPOGRAPHIC INDEX.
 *
 * No photo cards. The 8 speakers are presented as a clean, type-driven archive
 * index: a numbered list (01–08) where each row is a large studio name + the
 * session title in a tidy tabular layout (gallery / archive index feel).
 * Generous negative space — the warm continuous aura (PostHeroAura, supplied by
 * the region wrapper) is the ONLY color, picked up through transparent rows and
 * the warm --mood tonal ink.
 *
 * Each row is a focusable <button> that EXPANDS on hover / focus (and tap on
 * mobile, via click toggling) to reveal the session description + a small
 * Canvas2D works thumbnail strip. The expand/collapse is pure CSS (grid-rows
 * 0fr -> 1fr transition); prefers-reduced-motion drops the transition so the
 * panel snaps open with no animation. Keyboard: rows are real buttons, so
 * Tab focuses them (which expands them) and Enter/Space toggle the persistent
 * open state.
 *
 * Day 1 / Day 2 are grouped under a tonal day marker. The whole section eases a
 * --mood (0..1) from scroll progress, drifting the warm tonal accents from
 * red-orange (D1) toward gold (D2) within the warm family — matching the aura.
 * Facts (studio, name, role, session title/desc) are verbatim Korean from
 * @/lib/content.
 */

/* numbering across BOTH days, 01..08 in render order (sorted day then order) */
const NUMBER_OF: Record<string, string> = Object.fromEntries(
  speakers.map((s, i) => [s.id, String(i + 1).padStart(2, "0")])
);

function IndexRow({ s }: { s: Speaker }) {
  const [open, setOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);
  // resolved accent (rgb string) read from CSS so the canvas tiles match the
  // live warm --mood tone of this row. Recomputed when the row opens.
  const [accent, setAccent] = useState("rgb(224, 50, 0)");

  useEffect(() => {
    if (!open || !rowRef.current) return;
    const c = getComputedStyle(rowRef.current).getPropertyValue("--row-accent");
    const v = c.trim();
    if (v) setAccent(v);
  }, [open]);

  const titleLines = s.sessionTitle.split("\n");
  const num = NUMBER_OF[s.id];

  return (
    <div
      ref={rowRef}
      className={`${styles.row} ${open ? styles.rowOpen : ""}`}
      // hover/focus also opens visually via CSS; this keeps an explicit
      // persistent state for tap (mobile) + keyboard activation.
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={styles.rowHead}
        aria-expanded={open}
        aria-controls={`idx-panel-${s.id}`}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className={styles.num}>{num}</span>
        <span className={styles.headMain}>
          <span className={styles.studio}>{s.studio}</span>
          <span className={styles.studioEn}>{s.studioEn}</span>
        </span>
        <span className={styles.session}>
          {titleLines.map((line, i) => (
            <span key={i} className={styles.sessionLine}>
              {line}
            </span>
          ))}
        </span>
        <span className={styles.time} aria-hidden="true">
          {s.time}
        </span>
      </button>

      <div
        id={`idx-panel-${s.id}`}
        className={styles.panel}
        role="region"
        aria-label={`${s.studio} 세션 상세`}
      >
        <div className={styles.panelInner}>
          <div className={styles.panelText}>
            <p className={styles.person}>
              <b>{s.name}</b>
              <span>{s.role}</span>
            </p>
            <p className={styles.desc}>{s.sessionDesc}</p>
            {s.credentials.length > 0 && (
              <ul className={styles.creds}>
                {s.credentials.slice(0, 3).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
          <div
            className={styles.works}
            role="group"
            aria-label={`${s.studio} 대표작`}
          >
            <WorksStrip id={s.id} open={open} accent={accent} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Section scroll progress (0->1) -> --mood, split by day: D1 = 0..0.5,
   D2 = 0.5..1. Mirrors the develop Lineup useMood so the tonal ink drifts
   warm red-orange -> gold in step with the shared aura. reduced-motion pins
   each day to its band center. (Read-only reference: components/develop/Lineup.tsx) */
function useMood(ref: React.RefObject<HTMLElement | null>, day: 1 | 2) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const base = day === 1 ? 0 : 0.5;
    const span = 0.5;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--mood", String(base + span / 2));
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height + vh;
      const p = (vh - r.top) / total;
      const clamped = p < 0 ? 0 : p > 1 ? 1 : p;
      el.style.setProperty("--mood", String(base + clamped * span));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, day]);
}

function DayGroup({ day }: { day: 1 | 2 }) {
  const list = speakersByDay(day);
  const ref = useRef<HTMLElement | null>(null);
  useMood(ref, day);
  const c = day === 1 ? siteContent.concept.d1 : siteContent.concept.d2;
  const { md, dow } = formatDate(siteContent.dates[day - 1]);

  return (
    <section
      ref={ref}
      id={`lineup${day}`}
      className={`${styles.dayGroup} ${day === 1 ? styles.d1 : styles.d2}`}
      aria-label={`Day ${day} 라인업`}
    >
      <header className={styles.dayMarker}>
        <span className={styles.dayTag}>Day {day}</span>
        <span className={styles.dayDate}>
          {md} ({dow})
        </span>
        <span className={styles.dayConcept}>{c.title}</span>
      </header>
      <div className={styles.rows}>
        {list.map((s) => (
          <IndexRow key={s.id} s={s} />
        ))}
      </div>
    </section>
  );
}

export default function IndexLineup() {
  return (
    <div className={styles.lineup}>
      <header className={styles.indexHead}>
        <p className={styles.kicker}>Index</p>
        <h2 className={styles.heading}>여덟 개의 세션</h2>
        <p className={styles.note}>
          행에 마우스를 올리거나 탭하면 세션 소개와 대표작이 펼쳐집니다.
        </p>
      </header>
      <DayGroup day={1} />
      <DayGroup day={2} />
    </div>
  );
}
