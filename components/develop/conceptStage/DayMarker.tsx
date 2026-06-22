"use client";

import styles from "./DayMarker.module.css";
import { siteContent, formatDate } from "@/lib/content";

/**
 * DayMarker — a bold, tonal full-bleed marker panel that announces each day
 * inside the immersive lineup. Big tonal English concept word (HEAT SOURCE /
 * HEAT TRANSFER) on the warm aura, with the Korean concept title + date.
 *
 * Day 1 lands in the deep red-orange register, Day 2 in the bright golden-
 * yellow register — the page-wide warm drift (PostHeroAura) carries the
 * transition; this panel makes the day change feel like a chapter break.
 */
export default function DayMarker({ day }: { day: 1 | 2 }) {
  const c = day === 1 ? siteContent.concept.d1 : siteContent.concept.d2;
  const iso = siteContent.dates[day - 1];
  const { md, dow } = formatDate(iso);

  return (
    <section
      className={`${styles.marker} ${day === 1 ? styles.d1 : styles.d2}`}
      aria-label={`Day ${day} · ${c.en}`}
    >
      <p className={styles.day}>
        DAY {day}
        <span className={styles.date}>
          {md} ({dow})
        </span>
      </p>
      <h2 className={styles.en}>{c.en}</h2>
      <p className={styles.title}>{c.title}</p>
    </section>
  );
}
