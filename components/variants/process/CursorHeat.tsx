"use client";

import { useRef, type ReactNode } from "react";
import styles from "./CursorHeat.module.css";

/* [PROCESS 변형] 커서 열원 — 원본 components/scroll/CursorHeat.tsx 의 정확한 클론.
   마우스 주변에 매질이 발광한다. 동작/구조 동일.
   ★ 차이: 두 날 모두 CMYK 잉크(multiply, 흰 종이). Day1 시안 강조 / Day2 마젠타 강조. */
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
