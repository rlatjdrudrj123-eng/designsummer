import styles from "./Hero.module.css";
import HeatBlob from "./HeatBlob";
import { speakers } from "@/lib/content";
import { conference } from "@/lib/conference";

/* [PROCESS · CMYK 변형] 히어로 — 공식 컨퍼런스 카피로 교체.
   CMYK 인쇄 아이덴티티(흰 종이 위 C·M·Y 감산잉크 + 커서 잉크)는 그대로 유지.
   badge / title(디자인 썸머 일산) / subtitle / desc / 날짜·시간 / 장소 /
   일자별 사전등록 버튼 2개 를 conference.hero 에서 렌더. 가산/하드코딩 카피 제거. */
export default function Hero() {
  const d1 = speakers.filter((s) => s.day === 1);
  const d2 = speakers.filter((s) => s.day === 2);
  const { badge, subtitle, desc, date, venue, register } = conference.hero;

  return (
    <section id="top" className={styles.hero}>
      <HeatBlob />

      {/* 모서리 날짜 — 좌 08.20(D1) · 우 08.21(D2), 둘 다 종이 위 먹 */}
      <span className={`${styles.date} ${styles.dateTl}`}>
        08.<br />20
      </span>
      <span className={`${styles.date} ${styles.dateTr}`}>
        08.<br />21
      </span>

      {/* 배지 — K-PRINT 동시 개최 (종이 위, 시안 잉크) */}
      <p className={styles.badge}>{badge}</p>

      {/* 타이틀 클러스터 (종이 면, 먹 글자) */}
      <div className={styles.titleBlock}>
        <p className={styles.sup}>C M Y K</p>
        <h1 className={styles.title}>디자인 썸머 일산</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <p className={styles.desc}>{desc}</p>
        <p className={styles.meta}>
          <span>{date}</span>
          <span className={styles.metaSep} aria-hidden="true">·</span>
          <span>{venue}</span>
        </p>

        {/* 일자별 사전등록 버튼 2개 (Day1 시안 / Day2 마젠타 잉크) */}
        <div className={styles.regRow}>
          {register.map((r) => (
            <a
              key={r.day}
              className={`${styles.reg} ${r.day === 1 ? styles.reg1 : styles.reg2}`}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{r.label} →</span>
            </a>
          ))}
        </div>
      </div>

      {/* 좌하단 연사 — 세로쓰기 (종이 면, 먹 글자), 데이별 묶음 */}
      <nav className={styles.studios} aria-label="라인업 바로가기">
        <div className={styles.dayGroup}>
          <span className={styles.studioDay}>DAY 1 · CYAN</span>
          {d1.map((s) => (
            <a key={s.id} href="#lineup1" className={styles.studio}>
              {s.studio}
            </a>
          ))}
        </div>
        <div className={styles.dayGroup}>
          <span className={styles.studioDay}>DAY 2 · MAGENTA</span>
          {d2.map((s) => (
            <a key={s.id} href="#lineup2" className={styles.studio}>
              {s.studio}
            </a>
          ))}
        </div>
      </nav>
    </section>
  );
}
