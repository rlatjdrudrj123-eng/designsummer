"use client";

import { useRef, type ReactNode } from "react";
import styles from "./CursorHeat.module.css";

/* 커서 열원 (가이드 7장) — 히어로의 마우스 열 효과를 D1/D2 콘텐츠로.
   마우스 주변 흰 종이가 데워진다(multiply). D1=레드(열원) / D2=오렌지(전사)로 구분.
   콘텐츠 뒤(z-index 0), 텍스트는 위(z-index 1)라 가독 유지. */
export default function CursorHeat({
  day,
  children,
}: {
  day: 1 | 2;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      className={styles.wrap}
      data-day={day}
      onPointerMove={onMove}
      onPointerEnter={() => ref.current?.classList.add(styles.on)}
      onPointerLeave={() => ref.current?.classList.remove(styles.on)}
    >
      <span className={styles.glow} aria-hidden="true" />
      {children}
    </div>
  );
}
