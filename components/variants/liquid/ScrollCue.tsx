"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ScrollCue.module.css";

/* [LIQUID 변형] 원본 components/scroll/ScrollCue.tsx 클론 (변경 없음).
   세로 레일을 따라 흐르는 열 입자. 페이지 끝 근처에서 사라짐. */
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
