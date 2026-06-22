"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FloatingBar.module.css";
import { siteContent } from "@/lib/content";

/* 플로팅바 — 히어로를 벗어나면 상단에 떠서 따라온다(히어로 위에선 숨김 — 히어로엔
   이미 K·print 로고가 있어 중복 방지). 좌측: 브랜드(맨 위로), 우측: K-PRINT 2026
   바로가기 외부 링크 버튼. K-PRINT URL 은 site.json 의 applyUrl(현재 kprint.co.kr). */
export default function FloatingBar() {
  const [show, setShow] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        // 히어로(약 한 화면)를 지나면 등장
        setShow(window.scrollY > window.innerHeight * 0.6);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`${styles.bar} ${show ? styles.show : ""}`}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <a href="#top" className={styles.brand}>
            디자인 썸머 일산
          </a>
          <span className={styles.divider} aria-hidden="true" />
          <nav className={styles.nav} aria-label="섹션 바로가기">
            <a href="#about" className={styles.navLink}>
              about
            </a>
            <a href="#day1" className={styles.navLink}>
              section A
            </a>
            <a href="#day2" className={styles.navLink}>
              section B
            </a>
            <a href="#benefits" className={styles.navLink}>
              event
            </a>
            <a href="#faq" className={styles.navLink}>
              FAQ
            </a>
          </nav>
        </div>
        <a
          className={styles.cta}
          href={siteContent.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          K-PRINT 2026 바로가기 <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
