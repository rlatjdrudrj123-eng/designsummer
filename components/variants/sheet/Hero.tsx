import styles from "./Hero.module.css";
import HeatBlob from "./HeatBlob";
import { conference } from "@/lib/conference";

/* [SHEET 변형] 히어로 — 공식 컨퍼런스 카피(conference.hero)로 렌더.
   HeatBlob(프리즘 스펙트럼 필드)는 그대로 유지.
   타이틀 "디자인 썸머 일산" / 서브 "시각의 전환, 실무의 확장" + 일자별 사전등록 버튼 2개. */
export default function Hero() {
  const h = conference.hero;

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

      {/* 배지 */}
      <p className={styles.badge}>{h.badge}</p>

      {/* 타이틀 클러스터 (우측 치우침) */}
      <div className={styles.titleBlock}>
        <p className={styles.sup}>{h.title}</p>
        <h1 className={styles.title}>디자인 썸머 일산</h1>
        <p className={styles.subtitle}>{h.subtitle}</p>
        <p className={styles.desc}>{h.desc}</p>
        <p className={styles.venueMeta}>{h.date}</p>
        <p className={styles.venueMeta}>{h.venue}</p>

        {/* 일자별 사전등록 버튼 2개 */}
        <div className={styles.regs}>
          {h.register.map((r) => (
            <a
              key={r.day}
              className={styles.reg}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{r.label} →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
