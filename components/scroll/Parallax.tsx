"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* 스크롤 패럴랙스 — 요소가 뷰포트를 지날 때 다른 속도로 떠 움직인다(깊이감).
   speed: 이동 계수(0.06 미세 ~ 0.2 뚜렷). reduced-motion: 정지. */
export default function Parallax({
  children,
  speed = 0.12,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 뷰포트 안에 있을 때만 계산
      if (r.bottom < -200 || r.top > vh + 200) return;
      const center = r.top + r.height / 2;
      const off = (vh / 2 - center) * speed;
      el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
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
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
