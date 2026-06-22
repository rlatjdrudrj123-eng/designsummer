"use client";

import { useEffect, useRef } from "react";
import styles from "./Lineup.module.css";
import Reveal from "./Reveal";
import { speakersByDay, type Speaker } from "@/lib/content";
import { imageUrl, workImages } from "@/lib/images";
import { type Lang } from "./developEn";

/* 라인업 (가이드 8장) — Aura 시안의 "스피커 카드" 디자인을 그대로 가져온다.
   - Aura SpeakerCard 구조: 약화된 작은 포트레이트 + 톤 그라데이션 스튜디오명/영문,
     세션 시간, 본문(세션 제목·설명·인물·크레덴셜), 그리고 인라인 대표작 썸네일 행.
   - 색은 이 사이트의 따뜻한 팔레트로 적응: DAY 1 오렌지 → DAY 2 골든-옐로 (Aura 의
     green/magenta 아님). 카드 표면은 Aura 처럼 프로스티드/반투명이라 오라가 비친다.
   - 무드 컬러 시프트: 섹션 스크롤 진행도로 --mood(0→1)가 부드럽게 이징 → 톤 스튜디오명,
     크레덴셜 불릿 등이 따뜻한 계열 안에서 드리프트. reduced-motion 시 날짜별 고정값.
   - 대표작은 Aura 처럼 카드 안 인라인 썸네일로 보여주므로 클릭 모달은 더 이상 필요 없다. */

/* 카드 콘텐츠는 ko/en 동일 — 한국어 데이터를 그대로 쓴다.
   en 모드는 히어로 KV 타이틀만 영문이며, 그 아래/주변(라인업 카드 포함)은
   전부 ko 와 바이트 동일하게 유지한다. */
function SpeakerCard({ s }: { s: Speaker }) {
  const portrait = imageUrl(`speaker-${s.id}`);
  const works = workImages(s.id);
  const titleLines = s.sessionTitle.split("\n");
  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.portrait}
            src={portrait}
            alt={`${s.studio} ${s.name}`}
            loading="lazy"
          />
        ) : (
          <div className={styles.portraitPh} aria-hidden="true">
            {s.studioEn.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={styles.cardId}>
          <div className={styles.studioTonal}>{s.studio}</div>
          <div className={styles.studioEn}>{s.studioEn}</div>
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              className={styles.work}
              src={src}
              alt={`${s.studio} 대표작 ${i + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      )}
    </article>
  );
}

/* 섹션 스크롤 진행도(0→1)를 --mood 로 흘려보낸다. day 로 무드 구간을 나눈다:
   DAY 1 은 0 → 0.5, DAY 2 는 0.5 → 1. 이 --mood 가 톤 그라데이션과 악센트를
   따뜻한 계열 안에서 부드럽게 드리프트시킨다.
   (페이지 전체 오라 그라운드는 PostHeroAura 가 담당 — 여기서는 텍스트 톤만 흘린다.)
   reduced-motion 시 날짜별 고정값. */
function useMood(ref: React.RefObject<HTMLElement | null>, day: 1 | 2) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const base = day === 1 ? 0 : 0.5;
    const span = 0.5; // 각 날이 차지하는 무드 폭

    // reduced-motion: 날짜별 고정 무드(구간 중앙).
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

export default function Lineup({ day }: { day: 1 | 2; lang?: Lang }) {
  const list = speakersByDay(day);
  const sectionRef = useRef<HTMLElement>(null);
  useMood(sectionRef, day);

  return (
    <section
      id={`lineup${day}`}
      ref={sectionRef}
      className={`${styles.lineup} ${day === 1 ? styles.d1 : styles.d2} shell`}
      aria-label={`Day ${day} 라인업`}
    >
      <div className={styles.cards}>
        {list.map((s) => (
          <Reveal key={s.id} className={styles.entry}>
            <SpeakerCard s={s} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
