"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SpeakerModal.module.css";
import type { Speaker } from "@/lib/content";
import { workImages } from "@/lib/images";

/* [LIQUID 변형] 원본 components/sections/SpeakerModal.tsx 클론 — 동작·구조·카피 동일.
   대표작 캐러셀 + 세션 설명 + 크레덴셜 + 홈페이지 링크. role=dialog, Esc·스크림 닫힘,
   포커스 트랩, body 스크롤 잠금, 자동 넘김. */
export default function SpeakerModal({
  speaker,
  onClose,
}: {
  speaker: Speaker;
  onClose: () => void;
}) {
  const works = workImages(speaker.id);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const multi = works.length > 1;

  // 자동 넘김 (여러 장일 때만). 직접 조작 시 잠시 멈춤.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!multi || paused) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % works.length);
    }, 4200);
    return () => clearInterval(t);
  }, [multi, paused, works.length]);

  const go = (next: number) => {
    setPaused(true);
    setIndex(((next % works.length) + works.length) % works.length);
  };

  // body 스크롤 잠금 + 포커스 이동/복원 + Esc + 포커스 트랩
  useEffect(() => {
    const prevActive = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    dialog?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || active === dialog) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, [onClose]);

  const accent = speaker.day === 1 ? "var(--heat-main)" : "var(--heat-mid)";

  return (
    <div
      className={styles.scrim}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${speaker.day === 2 ? styles.d2 : styles.d1}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${speaker.studio} ${speaker.name} 상세`}
        tabIndex={-1}
        style={{ ["--accent" as string]: accent }}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="닫기"
        >
          닫기 ✕
        </button>

        {works.length > 0 ? (
          <div className={styles.gallery} aria-label={`${speaker.studio} 대표작`}>
            <div className={styles.track}>
              {works.map((src, i) => (
                <figure
                  key={i}
                  className={`${styles.slide} ${i === index ? styles.active : ""}`}
                  aria-hidden={i === index ? undefined : true}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.slideImg}
                    src={src}
                    alt={`${speaker.studio} 대표작 ${i + 1}`}
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>

            {multi ? (
              <>
                <button
                  type="button"
                  className={`${styles.nav} ${styles.prev}`}
                  onClick={() => go(index - 1)}
                  aria-label="이전 대표작"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.nav} ${styles.next}`}
                  onClick={() => go(index + 1)}
                  aria-label="다음 대표작"
                >
                  ›
                </button>
                <div className={styles.dots} role="tablist" aria-label="대표작 선택">
                  {works.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.dot} ${i === index ? styles.dotOn : ""}`}
                      onClick={() => go(i)}
                      aria-label={`대표작 ${i + 1}`}
                      aria-selected={i === index}
                      role="tab"
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        <div className={styles.body}>
          <span className={styles.studioEn}>{speaker.studioEn}</span>
          <h2 className={styles.studio}>{speaker.studio}</h2>
          <p className={styles.person}>
            {speaker.name}
            {speaker.role ? (
              <span className={styles.role}> · {speaker.role}</span>
            ) : null}
          </p>

          <p className={styles.sessionTitle}>{speaker.sessionTitle}</p>
          {speaker.sessionDesc ? (
            <p className={styles.desc}>{speaker.sessionDesc}</p>
          ) : null}

          {speaker.credentials.length > 0 ? (
            <ul className={styles.creds}>
              {speaker.credentials.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : null}

          {speaker.url ? (
            <a
              className={styles.link}
              href={speaker.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              홈페이지 ↗
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
