"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* [LIQUID 변형] 원본 components/scroll/Reveal.tsx 클론 (변경 없음).
   스크롤 진입 시 자식들이 열 번짐(opacity+blur)으로 등장. globals 의 .reveal/.isIn 사용. */
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
