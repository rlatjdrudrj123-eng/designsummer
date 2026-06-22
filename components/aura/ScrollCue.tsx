"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ScrollCue.module.css";

/* 스크롤 유도 (Aura1 전용 포크 — 공유 develop/ScrollCue 강화판).
   컨셉(열): 열 입자가 세로 라인을 따라 아래로 흐르고, 그 아래 열-색 화살표가
   바운스하며 아래로 내려가라고 더 적극적으로 유도한다. 라벨은 은은히 펄스.
   페이지 끝 근처에서 사라진다. reduced-motion: 모든 흐름·바운스·펄스 정지. */
export default function ScrollCue() {
  const [hidden, setHidden] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        // 히어로에서만 보이게 — 한 화면의 절반 정도 내려가면(=히어로를 벗어나기 시작)
        // 자연스럽게 페이드 아웃(본문 가독성 저해 방지). 0.5s opacity 트랜지션으로 사라짐.
        setHidden(window.scrollY > window.innerHeight * 0.45);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`${styles.cue} ${hidden ? styles.hidden : ""}`} aria-hidden="true">
      <span className={styles.label}>scroll</span>
      <span className={styles.rail}>
        <span className={styles.bead} />
        <span className={`${styles.bead} ${styles.bead2}`} />
      </span>
      <span className={styles.chevron} />
    </div>
  );
}
