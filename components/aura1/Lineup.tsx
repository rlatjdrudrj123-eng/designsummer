"use client";

/* ============================================================================
 * Aura1 Lineup — forked speaker lineup for the warm-Aura page.
 *
 * Forked from components/develop/Lineup.tsx. The shared file is NOT modified.
 *
 * This fork keeps the EXISTING Aura card FORM (same as the shared develop
 * Lineup): a SMALL round profile avatar + tonal studio name + studioEn +
 * session title + desc + person(role) + credentials + the 대표작 (works)
 * thumbnail strip. It is NOT a big full-card portrait.
 *
 * Two small fork-specific changes vs the shared version:
 *
 *   1) HEAD-CROP FIX — the small avatar uses object-position:top center so
 *      faces/heads are not sliced off by the round crop. Same small size.
 *
 *   2) WORKS LIGHTBOX — clicking a 대표작 (works) thumbnail opens a lib-free
 *      lightbox (CSS + React state) showing that WORK image large. Closes on
 *      scrim click / Esc / × button, traps focus, and locks page scroll while
 *      open. (The ENLARGE is for the works images, NOT the profile photo.)
 *
 * Renders the 8 speakers grouped by Day. Accepts a `day` prop (1|2).
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Lineup.module.css";
import DayKV from "./DayKV";
import { speakersByDay, type Speaker } from "@/lib/content";
import { imageUrl, workImages } from "@/lib/images";
import { conference } from "@/lib/conference";

type LightboxState = { src: string; alt: string } | null;

function SpeakerCard({
  s,
  onOpen,
}: {
  s: Speaker;
  onOpen: (src: string, alt: string) => void;
}) {
  const portrait = imageUrl(`speaker-${s.id}`);
  const works = workImages(s.id);
  const titleLines = s.sessionTitle.split("\n");

  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        {portrait ? (
          <div className={styles.portrait}>
            <Image
              src={portrait}
              alt={`${s.studio} ${s.name}`}
              fill
              sizes="58px"
              loading="lazy"
              style={{ objectFit: "cover", objectPosition: "top center" }}
            />
          </div>
        ) : (
          <div className={styles.portraitPh} aria-hidden="true">
            {s.studio.charAt(0)}
          </div>
        )}
        <div className={styles.cardId}>
          {/* 스튜디오명은 한글만 — 영문 보조 라벨(studioEn) 제거(클라이언트 요청). */}
          <div className={styles.studioTonal}>{s.studio}</div>
        </div>
        <div className={styles.cardTime}>{s.time}</div>
      </header>

      <div className={styles.cardBody}>
        <h3 className={styles.session}>
          {titleLines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </h3>
        <p className={styles.sessionDesc}>{s.sessionDesc}</p>
        <p className={styles.person}>
          <b>{s.name}</b>
          <span>{s.role}</span>
        </p>
        {s.credentials.length > 0 && (
          <ul className={styles.creds}>
            {s.credentials.slice(0, 3).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
      </div>

      {works.length > 0 && (
        <div
          className={styles.works}
          role="group"
          aria-label={`${s.studio} 대표작`}
        >
          {works.map((src, i) => (
            <button
              key={src}
              type="button"
              className={styles.workBtn}
              onClick={() => onOpen(src, `${s.studio} 대표작 ${i + 1}`)}
              aria-label={`${s.studio} 대표작 ${i + 1} 크게 보기`}
            >
              <Image
                className={styles.work}
                src={src}
                alt={`${s.studio} 대표작 ${i + 1}`}
                fill
                sizes="64px"
                loading="lazy"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

/* Lib-free lightbox for the works (대표작) images: scrim + centered large image.
   - Esc / scrim click / close button → close.
   - Focus trap: focus moves into the dialog on open, Tab cycles within it,
     and focus returns to the trigger on close.
   - Scroll lock while open. */
function Lightbox({
  state,
  onClose,
}: {
  state: LightboxState;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = state !== null;

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevActive = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        // Single focusable (close button) → keep focus trapped on it.
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !state) return null;

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={state.alt}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.lightboxImg} src={state.src} alt={state.alt} />
      </div>
    </div>
  );
}

export default function Lineup({ day }: { day: 1 | 2 }) {
  const list = speakersByDay(day);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const onOpen = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);
  const onClose = useCallback(() => setLightbox(null), []);

  /* Day 머리말 데이터 — 개요에서 이리로 이동한 그 날의 테마(about.days)와
     추천 대상(audience.day1/day2). 한 섹션이 테마 → 추천 대상 → 연사 cards 로
     하나의 응집된 블록으로 읽힌다. */
  const theme = conference.about.days[day - 1];
  const aud = day === 1 ? conference.audience.day1 : conference.audience.day2;
  /* Per-day registration CTA: register[0]=Day1, register[1]=Day2 → {label,url}. */
  const reg = conference.hero.register[day - 1];

  return (
    <section
      id={`lineup${day}`}
      className={`${styles.lineup} ${day === 1 ? styles.d1 : styles.d2} shell`}
      aria-label={`Day ${day} 라인업`}
    >
      <header className={styles.dayIntro}>
        <p className={styles.dayHead}>
          <span className={styles.dayLabel}>Day {day}</span>
          <span className={styles.dayDate}>{theme.date}</span>
        </p>

        <div className={styles.themeRow}>
          <DayKV day={day} />
          <h2 className={styles.dayTitle}>{theme.title}</h2>
        </div>
        <p className={styles.dayBody}>{theme.body}</p>

        <div className={styles.audience}>
          <p className={styles.audienceKicker}>추천 대상</p>
          <h3 className={styles.audienceHeading}>{aud.heading}</h3>
          <ul className={styles.items}>
            {aud.items.map((item, i) => (
              <li key={i} className={styles.item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className={styles.cards}>
        {list.map((s) => (
          <SpeakerCard key={s.id} s={s} onOpen={onOpen} />
        ))}
      </div>

      {/* Per-day 신청하기 CTA — Day1 → register[0], Day2 → register[1]. */}
      <div className={styles.applyWrap}>
        <a
          className={styles.applyBtn}
          href={reg.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          {reg.label}
        </a>
      </div>

      <Lightbox state={lightbox} onClose={onClose} />
    </section>
  );
}
