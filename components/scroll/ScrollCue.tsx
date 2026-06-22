"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ScrollCue.module.css";

/* 스크롤 유도 — 컨셉(열): 열 입자가 세로 라인을 따라 아래로 흐른다.
   "생각의 온도를 아래로" 라는 인상. 페이지 끝 근처에서 사라진다.
   reduced-motion: 흐름 정지(정적 점만). */
export default function ScrollCue() {
  const [hidden, setHidden] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const sc = window.scrollY;
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        // 끝에서 한 화면 정도 남으면 숨김
        setHidden(max - sc < window.innerHeight * 0.6);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`${styles.cue} ${hidden ? styles.hidden : ""}`} aria-hidden="true">
      <span className={styles.label}>SCROLL</span>
      <span className={styles.rail}>
        <span className={styles.bead} />
      </span>
    </div>
  );
}
