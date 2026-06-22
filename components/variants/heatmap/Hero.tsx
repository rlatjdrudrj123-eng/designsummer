import styles from "./Hero.module.css";
import HeatBlob from "./HeatBlob";
import { conference } from "@/lib/conference";

/* [HEATMAP 변형] 히어로 — 공식 컨퍼런스 콘텐츠(conference.hero)로 렌더.
   HeatBlob 만 로컬(heatmap) 카피를 사용해 jet LUT 로 렌더(열 필드 아이덴티티 유지).
   배지 · 타이틀 · 서브타이틀 · 설명 · 일시 · 장소 + 일자별 사전등록 버튼 2개. */
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

      {/* 배지 — 동시 개최 컨퍼런스 */}
      <p className={styles.badge}>{h.badge}</p>

      {/* 타이틀 클러스터 */}
      <div className={styles.titleBlock}>
        <p className={styles.sup}>{h.title}</p>
        <h1 className={styles.title}>디자인 썸머 일산</h1>
        <p className={styles.subtitle}>{h.subtitle}</p>
        <p className={styles.desc}>{h.desc}</p>

        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>일시</dt>
            <dd className={styles.metaValue}>{h.date}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>장소</dt>
            <dd className={styles.metaValue}>{h.venue}</dd>
          </div>
        </dl>

        {/* 일자별 사전등록 버튼 2개 */}
        <nav className={styles.regGroup} aria-label="일자별 사전등록">
          {h.register.map((r) => (
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
        </nav>
      </div>
    </section>
  );
}
