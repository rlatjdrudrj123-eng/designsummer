"use client";

import { Unbounded } from "next/font/google";
import { conference } from "@/lib/conference";
import { speakersByDay, formatDate } from "@/lib/content";
import GradientBar from "./GradientBar";
import styles from "./Hero.module.css";

/* Date numerals — the KV uses a quirky, rounded, geometric display numeral.
   Unbounded (rounded, expressive geometric display) is the closest free match
   to that feel. Scoped to this variant; its generated class is applied only to
   the big date numerals (.numeral), so the CSS Module keeps sizing/weight. */
const numeralFont = Unbounded({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

/* HEATWAVE hero — poster #2 recreation, now carrying the official conference
   copy from @/lib/conference. Pure white ground, heavy black type, signature
   vertical multicolor heat bar down the center with a thin black cross-rule
   through it. Rounded date numerals flank the bar; Day-1 studios left (디자인의
   새로운 관점, cool), Day-2 studios right (디자인 실무의 확장, warm). The two
   per-day registration CTAs sit beneath the lists. */

/* Dates derive from the official date string "2026년 8월 20일(목) – 8월 21일(금)
   …" — kept as fixed ISO so the big numerals stay SSR/CSR stable. */
const d1 = formatDate("2026-08-20"); // { md: "08.20", dow }
const d2 = formatDate("2026-08-21"); // { md: "08.21", dow }

/* Daily session window — the giant 08.20 / 08.21 numerals already carry the
   dates, so we keep only the time. Pulled from the official date string
   "… 13:00 ~ 17:00" and rendered once, centered under the bar (no overlap). */
const TIME = "13:00 – 17:00";

function Numeral({ md, dow }: { md: string; dow: string }) {
  // KV 처럼 두 줄("08." / "20"), 두 줄을 같은 폭으로 양끝 맞춤(글자 space-between).
  const [mm, dd] = md.split(".");
  const top = [...mm, "."]; // ["0","8","."]
  const bot = [...dd]; // ["2","0"]
  return (
    <span className={`${numeralFont.className} ${styles.numeral}`}>
      <span className={styles.numLine}>
        {top.map((c, i) =>
          c === "." ? (
            <span key={i} className={styles.dot}>
              .
            </span>
          ) : (
            <span key={i}>{c}</span>
          ),
        )}
      </span>
      <span className={styles.numLine}>
        {bot.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </span>
      {/* small day-of-week + time tag sits inside the date column, below the
         numeral — carries the time without colliding with the big numerals. */}
      <span className={styles.dateMeta}>
        ({dow}) {TIME}
      </span>
    </span>
  );
}

export default function Hero() {
  const { hero } = conference;
  const day1 = speakersByDay(1);
  const day2 = speakersByDay(2);

  return (
    <header className={styles.hero}>
      {/* the signature heat bar + crossing rules (full-bleed background) */}
      <div className={styles.barField}>
        <GradientBar />
        <span className={styles.vRule} aria-hidden="true" />
        <span className={styles.hRule} aria-hidden="true" />
      </div>

      {/* content sits in the same max-width container as the page sections so
          the left/right gutter aligns with everything below the hero. */}
      <div className={styles.inner}>
      {/* ---- top row: title (top-left) + brand (top-right) ---- */}
      <div className={styles.topbar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>
            <span className={styles.titleLine}>디자인</span>
            <span className={styles.titleLine}>썸머 일산</span>
          </h1>
          <span className={styles.titleSub}>{hero.subtitle}</span>
          <span className={styles.titleVenue}>{hero.venue}</span>
        </div>
        <div className={styles.brand}>
          <span className={styles.wordmark}>
            K<span className={styles.dotMark}>·</span>print
          </span>
          <span className={styles.tagline}>{hero.badge}</span>
        </div>
      </div>

      {/* ---- center focal band: dates flanking the bar ---- */}
      <div className={styles.centerBand}>
        <div className={`${styles.date} ${styles.dateLeft}`}>
          <Numeral md={d1.md} dow={d1.dow} />
        </div>
        <div className={`${styles.date} ${styles.dateRight}`}>
          <Numeral md={d2.md} dow={d2.dow} />
        </div>
      </div>

      {/* ---- bottom row: per-day studio lists + CTAs ---- */}
      <div className={styles.bottom}>
        <div className={styles.studioRow}>
          <ul className={`${styles.studios} ${styles.studiosLeft}`}>
            {day1.map((s) => (
              <li key={s.id}>
                <a href={`#sp-${s.id}`}>{s.studio}</a>
              </li>
            ))}
          </ul>
          <ul className={`${styles.studios} ${styles.studiosRight}`}>
            {day2.map((s) => (
              <li key={s.id}>
                <a href={`#sp-${s.id}`}>{s.studio}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.regRow}>
          {hero.register.map((r) => (
            <a
              key={r.day}
              className={`${styles.regBtn} ${r.day === 1 ? styles.regCool : styles.regWarm}`}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {r.label}
            </a>
          ))}
        </div>
      </div>
      </div>
    </header>
  );
}
