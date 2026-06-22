"use client";

import { useRef, type ReactNode } from "react";
import styles from "./CursorHeat.module.css";

/* [HEATMAP 변형] 커서 열원 — 원본 components/scroll/CursorHeat.tsx 의 정확한 클론.
   마우스 주변 흰 종이가 데워진다(multiply). 동작/구조 동일.
   ★ 차이: 글로우 그라데이션이 jet 히트맵 색(D1=hot red→orange, D2=cool blue→cyan)으로 칠해진다. */
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
