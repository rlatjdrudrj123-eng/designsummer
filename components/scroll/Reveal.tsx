"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* 스크롤 진입 시 자식들이 열 번짐(opacity+blur)으로 등장 (가이드 7장).
   fade-up 아님 — 위치 이동 없음. globals 의 .reveal/.isIn 이 시각 처리.
   IntersectionObserver 로 1회 발화. 미지원·JS 없음 시 즉시 표시(정보 손실 방지). */
export default function Reveal({
  children,
  className = "",
  threshold = 0.2,
}: {
  children: ReactNode;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("isIn");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("isIn");
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={`reveal ${className}`.trim()}>
      {children}
    </div>
  );
}
