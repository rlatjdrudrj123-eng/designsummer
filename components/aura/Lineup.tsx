"use client";

/* ============================================================================
 * Aura Lineup — per-day speaker section for the warm-Aura MAIN content.
 * (forked from components/aura1/Lineup.tsx — independent of /aura1.)
 *
 * Same day-section LAYOUT as aura1 (big Day label + date, theme title beside
 * the DayKV heat-field KV, theme body, 추천 대상 list, then the speaker cards):
 *
 *   - Speakers are sourced from auraSpeakersByDay (lib/auraContent) so the MAIN
 *     stays admin-editable via "Aura 연사 내용".
 *   - Cards show: speaker profile avatar (speaker-{id}, head-crop fix), studio
 *     (tonal), session title, session desc (if present), name, role,
 *     credentials (ALL, no cap), the 대표작/works thumbnail strip (capped at 5,
 *     each opens a lib-free lightbox), and a bottom-right "더보기 →" link to the
 *     speaker homepage (speaker.url).
 *   - The DayKV canvas heat effect (D1 ripple red / D2 arrow gold) is kept —
 *     it is a graphic, not a photo. Day1=red / Day2=gold coding + glass cards.
 *
 * Accepts a `day` prop (1|2). Renders that day's speakers grouped under the
 * day-intro header.
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Lineup.module.css";
import DayKV from "./DayKV";
import Reveal from "@/components/develop/Reveal";
import { type Speaker } from "@/lib/content";
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
  const works = workImages(s.id).slice(0, 4);
  const titleLines = s.sessionTitle.split("\n");
  const url = s.url && s.url.trim() ? s.url.trim() : null;

  return (
    <article className={styles.card}>
      {/* 좌측 정렬 프로필 — 원형 사진 + "이름 | 스튜디오 직책" 한 줄. */}
      <header className={styles.cardHead}>
        {portrait ? (
          <div className={styles.portrait}>
            <Image
              src={portrait}
              alt={`${s.name} ${s.studio} ${s.role} 프로필 사진`}
              fill
              sizes="56px"
              loading="lazy"
              style={{ objectFit: "cover", objectPosition: "top center" }}
            />
          </div>
        ) : (
          <div className={styles.portraitPh} aria-hidden="true">
            {s.studio.charAt(0)}
          </div>
        )}
        <p className={styles.cardId}>
          <b className={styles.idName}>{s.name}</b>
          <span className={styles.idMeta}>
            {s.studio} {s.role}
          </span>
        </p>
      </header>

      {/* 세션 제목 — 카드에서 가장 크고 굵게. */}
      <h3 className={styles.session}>
        {titleLines.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </h3>
      {s.sessionDesc && <p className={styles.sessionDesc}>{s.sessionDesc}</p>}

      {/* 약력 — 불릿/가로선 없이 여백으로만 구분(클라이언트 요청). */}
      {s.credentials.length > 0 && (
        <ul className={styles.creds}>
          {s.credentials.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}

      {/* 포트폴리오 — 라벨 + (썸네일 … 더보기) 같은 줄. 하단 정렬. */}
      {(works.length > 0 || url) && (
        <div className={styles.portfolio}>
          <span className={styles.portfolioLabel}>portfolio</span>
          <div className={styles.portfolioRow}>
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
                      alt={`${s.name} ${s.studio} 대표작 ${i + 1}`}
                      fill
                      sizes="64px"
                      loading="lazy"
                      style={{ objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
            {url && (
              <a
                className={styles.moreLink}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.studio} 홈페이지 더보기 (새 탭)`}
              >
                더보기 ↗
              </a>
            )}
          </div>
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

export default function Lineup({
  day,
  speakers,
}: {
  day: 1 | 2;
  speakers: Speaker[];
}) {
  const list = speakers;
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const onOpen = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);
  const onClose = useCallback(() => setLightbox(null), []);

  /* Day 머리말 데이터 — 그 날의 테마(about.days)와 추천 대상(audience.day1/day2).
     한 섹션이 테마 → 추천 대상 → 연사 cards 로 하나의 응집된 블록으로 읽힌다. */
  const theme = conference.about.days[day - 1];
  const aud = day === 1 ? conference.audience.day1 : conference.audience.day2;
  // 머리말 라벨: "section A" — creative/craft 컨셉 폐기, 섹션 표기만(클라이언트 요청).
  const section = day === 1 ? "A" : "B";
  // 그 날의 사전등록 URL(히어로 register 와 동일 소스).
  const dayUrl =
    conference.hero.register.find((r) => r.day === day)?.url ??
    conference.hero.register[0].url;
  // 추천 대상 항목 — "역할 : 설명" 형식이면 첫 ' : ' 로 분리해 역할을 소제목처럼.
  const audItems = (aud.items as ReadonlyArray<string>).map((raw) => {
    const idx = raw.indexOf(" : ");
    return idx === -1
      ? { role: null as string | null, desc: raw }
      : { role: raw.slice(0, idx), desc: raw.slice(idx + 3) };
  });

  return (
    <section
      id={`lineup${day}`}
      className={`${styles.lineup} ${day === 1 ? styles.d1 : styles.d2} shell`}
      aria-label={`Section ${section} 라인업`}
    >
      <header className={styles.dayIntro}>
        {/* 우측 대형 KV — 인트로 블록 오른쪽에 크게 자리잡아 스케일·공간감을 준다.
            텍스트는 좌측이라 겹치지 않고, 아이콘은 뒤(z:0)·클릭 비간섭. */}
        <DayKV day={day} className={styles.kvBleed} />

        <p className={styles.dayHead}>
          <span className={styles.dayLabel}>section {section}</span>
        </p>

        <div className={styles.themeRow}>
          <h2 className={styles.dayTitle}>{theme.title}</h2>
        </div>
        <p className={styles.dayBody}>{theme.body}</p>

        <div className={styles.audience}>
          <ul className={styles.items}>
            {audItems.map((item, i) => (
              <li key={i} className={styles.item}>
                {item.role && (
                  <span className={styles.itemRole}>{item.role}</span>
                )}
                <span className={styles.itemDesc}>{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 신청 — 박스 없이 좌정렬 텍스트 링크, 연사 카드 위(클라이언트 요청). */}
        <a
          className={styles.dayCtaLink}
          href={dayUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          section {section} 신청하기
          <span aria-hidden="true" className={styles.dayCtaArrow}>
            ↗
          </span>
        </a>
      </header>

      <div className={styles.cards}>
        {list.map((s) => (
          <Reveal key={s.id} className={styles.entry}>
            <SpeakerCard s={s} onOpen={onOpen} />
          </Reveal>
        ))}
      </div>

      {/* 모바일 전용 — 연사 소개를 다 본 뒤 한 번 더 신청 지점(클라이언트 요청). */}
      <div className={styles.dayCtaBottom}>
        <a
          className={styles.dayCtaLink}
          href={dayUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          section {section} 신청하기
          <span aria-hidden="true" className={styles.dayCtaArrow}>
            ↗
          </span>
        </a>
      </div>

      <Lightbox state={lightbox} onClose={onClose} />
    </section>
  );
}
