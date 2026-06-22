"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./WorkShowcase.module.css";

/* 연사 옆 빈 공간을 채우는 대표작 쇼케이스.
   스크롤 진행도(--p, -1..1)를 rAF 로 갱신 → 카드 변형이 스크롤에 실시간 반응(연사마다 다른 효과).
   진입 시 1회 페이드(IntersectionObserver). 라이브러리 없이 CSS 변형 + rAF 만 사용(스택 규칙).
   reduced-motion: 정적 표시. 이미지 미업로드 시 열 색 플레이스홀더로 효과를 미리 보여준다. */

export const EFFECTS = [
  "fan",
  "flip",
  "fly",
  "stack",
  "tilt",
  "wipe",
  "slide",
  "pop",
] as const;
export type Effect = (typeof EFFECTS)[number];

export default function WorkShowcase({
  images,
  studio,
  effect,
  day,
}: {
  images: string[];
  studio: string;
  effect: Effect;
  day: 1 | 2;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const real = images.length;
  const count = Math.max(real, 1);
  const cards = Array.from({ length: count }, (_, i) => images[i] ?? null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setInView(true);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    // 스크롤 진행도 → --p (1: 막 진입(아래) · 0: 화면 중앙 · -1: 빠져나감(위))
    let raf = 0;
    let pending = false;
    const update = () => {
      raf = 0;
      pending = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = r.top + r.height / 2;
      const p = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.showcase} ${styles[effect]} ${
        inView ? styles.in : ""
      } ${day === 2 ? styles.d2 : styles.d1}`}
      data-effect={effect}
      aria-label={`${studio} 대표작`}
      style={{ ["--n" as keyof CSSProperties]: count } as CSSProperties}
    >
      <div className={styles.stage}>
        {cards.map((src, i) => (
          <figure
            key={i}
            className={styles.item}
            style={{ ["--i" as keyof CSSProperties]: i } as CSSProperties}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={`${studio} 대표작 ${i + 1}`}
                className={styles.img}
                loading="lazy"
              />
            ) : (
              <span className={styles.ph} aria-hidden="true">
                {studio}
              </span>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
