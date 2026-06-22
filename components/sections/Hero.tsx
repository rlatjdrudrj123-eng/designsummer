import styles from "./Hero.module.css";
import HeatBlob from "@/components/hero/HeatBlob";
import { speakers } from "@/lib/content";

/* 히어로 (가이드 8장).
   - 중앙정렬 금지: 타이틀 우측 치우침, 메타는 모서리에 "정리된 디자인 요소"로 배치
   - 상단 좌(일시)·우(장소) 메타 블록: 라벨 + 값, 열 틱
   - 메인 카피 the creative heatwave (heatwave 강조)
   - 좌하단 연사: 데이별 2줄 (세로쓰기) */
export default function Hero() {
  const d1 = speakers.filter((s) => s.day === 1);
  const d2 = speakers.filter((s) => s.day === 2);

  return (
    <section id="top" className={styles.hero}>
      <HeatBlob />

      {/* 모서리 날짜 — 좌 08.20(D1) · 우 08.21(D2). 컨셉 요소 */}
      <span className={`${styles.date} ${styles.dateTl}`}>
        08.<br />20
      </span>
      <span className={`${styles.date} ${styles.dateTr}`}>
        08.<br />21
      </span>

      {/* 메인 카피 */}
      <p className={styles.tagline}>
        the creative <em>heatwave</em>
      </p>

      {/* 타이틀 클러스터 (우측 치우침) */}
      <div className={styles.titleBlock}>
        <p className={styles.sup}>2026°C</p>
        <h1 className={styles.title}>디자인 썸머 일산</h1>
        <p className={styles.venueMeta}>KINTEX 제2전시장 301호</p>
      </div>

      {/* 좌하단 연사 — 세로쓰기 (아이덴티티). 데이별로 묶어 한 밴드에 */}
      <nav className={styles.studios} aria-label="라인업 바로가기">
        <div className={styles.dayGroup}>
          <span className={styles.studioDay}>DAY 1</span>
          {d1.map((s) => (
            <a key={s.id} href="#day1" className={styles.studio}>
              {s.studio}
            </a>
          ))}
        </div>
        <div className={styles.dayGroup}>
          <span className={styles.studioDay}>DAY 2</span>
          {d2.map((s) => (
            <a key={s.id} href="#day2" className={styles.studio}>
              {s.studio}
            </a>
          ))}
        </div>
      </nav>
    </section>
  );
}
