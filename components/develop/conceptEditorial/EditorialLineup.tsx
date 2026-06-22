"use client";

import { useEffect, useRef } from "react";
import styles from "./ConceptEditorial.module.css";
import Reveal from "../Reveal";
import { speakersByDay, type Speaker } from "@/lib/content";
import { imageUrl, showcaseImages } from "@/lib/images";

/* EditorialLineup — the NEW magazine concept replacement for the develop card
   grid. Each speaker is laid out as a generous, full-width EDITORIAL FEATURE
   block instead of a frosted card:

     · a huge warm TONAL STUDIO NAME headline (gradient text-clip, --mood tone)
     · the session title as a big pull-quote
     · the session desc as editorial body, with a small credentials sidebar
     · the works/poster images as an asymmetric editorial image strip

   The blocks are asymmetric (feature alternates the body/sidebar column order
   per index) and breathe with lots of whitespace, magazine-like. A big tonal
   DAY marker separates Day 1 / Day 2.

   All facts come verbatim from @/lib/content (Korean). Tone & manner reuse the
   develop warm palette + the same --mood scroll-eased tonal accents the card
   Lineup used (red-orange D1 → gold D2). It sits on the SAME continuous warm
   PostHeroAura ground, so every surface is transparent. */

function Feature({ s, index }: { s: Speaker; index: number }) {
  const portrait = imageUrl(`speaker-${s.id}`);
  const shots = showcaseImages(s.id);
  const titleLines = s.sessionTitle.split("\n");
  // alternate the asymmetric layout: even features lead with the body column,
  // odd features flip the sidebar to the lead edge → magazine rhythm.
  const flipped = index % 2 === 1;

  return (
    <article className={`${styles.feature} ${flipped ? styles.flip : ""}`}>
      <header className={styles.featureHead}>
        <p className={styles.featureNo}>
          <span className={styles.featureNoNum}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={styles.featureTime}>{s.time}</span>
        </p>
        <h3 className={styles.studioName}>{s.studio}</h3>
        <p className={styles.studioMeta}>
          <span className={styles.studioEn}>{s.studioEn}</span>
          <span className={styles.studioPerson}>
            <b>{s.name}</b>
            {s.role}
          </span>
        </p>
      </header>

      <div className={styles.featureBody}>
        <div className={styles.bodyMain}>
          <h4 className={styles.pullQuote}>
            {titleLines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h4>
          <p className={styles.lede}>{s.sessionDesc}</p>
        </div>

        {s.credentials.length > 0 && (
          <aside className={styles.sidebar} aria-label={`${s.studio} 약력`}>
            <p className={styles.sidebarLabel}>Credentials</p>
            <ul className={styles.creds}>
              {s.credentials.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      <div
        className={styles.strip}
        role="group"
        aria-label={`${s.studio} 작업·포스터`}
      >
        {shots.length > 0 ? (
          shots.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              className={styles.shot}
              src={src}
              alt={`${s.studio} 작업 ${i + 1}`}
              loading="lazy"
            />
          ))
        ) : (
          // tonal placeholders before any image is uploaded — keeps the
          // editorial strip composed; the --mood accent fills them.
          <>
            <span className={styles.shotPh} aria-hidden="true">
              {s.studioEn.charAt(0).toUpperCase()}
            </span>
            <span className={styles.shotPh} aria-hidden="true" />
            <span className={styles.shotPh} aria-hidden="true" />
          </>
        )}
        {portrait && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={`${styles.shot} ${styles.shotPortrait}`}
            src={portrait}
            alt={`${s.studio} ${s.name}`}
            loading="lazy"
          />
        )}
      </div>
    </article>
  );
}

/* drive --mood (0→1) from the section's scroll progress, mirroring develop's
   Lineup.useMood: Day 1 occupies 0→0.5, Day 2 occupies 0.5→1, so the warm
   tonal text/accents drift red-orange → gold down the page. The page-wide warm
   aura ground itself is owned by PostHeroAura; here we only flow text tone.
   reduced-motion → a fixed per-day mid value (no rAF, no scroll listener). */
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

const DAY_META = {
  1: { tag: "HEAT SOURCE", ko: "열원", line: "생각의 온도를 올리는 날" },
  2: { tag: "HEAT TRANSFER", ko: "전사", line: "생각이 실물에 닿는 날" },
} as const;

export default function EditorialLineup({ day }: { day: 1 | 2 }) {
  const list = speakersByDay(day);
  const sectionRef = useRef<HTMLElement>(null);
  useMood(sectionRef, day);
  const m = DAY_META[day];

  return (
    <section
      id={`lineup${day}`}
      ref={sectionRef}
      className={`${styles.lineup} ${day === 1 ? styles.d1 : styles.d2} shell`}
      aria-label={`Day ${day} 라인업`}
    >
      <Reveal className={styles.dayMarker}>
        <p className={styles.dayKicker}>Day {day}</p>
        <p className={styles.dayTag}>{m.tag}</p>
        <p className={styles.dayKo}>
          {m.ko} <span>·</span> {m.line}
        </p>
      </Reveal>

      <div className={styles.features}>
        {list.map((s, i) => (
          <Reveal key={s.id} className={styles.entry}>
            <Feature s={s} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
