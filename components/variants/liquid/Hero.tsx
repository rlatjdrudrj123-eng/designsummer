import styles from "./Hero.module.css";
import HeatBlob from "./HeatBlob";
import { speakers } from "@/lib/content";
import { conference } from "@/lib/conference";

/* [LIQUID 변형] 원본 메인 사이트의 히어로를 클론하되 카피를 공식 컨퍼런스
   콘텐츠(@/lib/conference)로 교체. 액상 무지개 LUT 의 HeatBlob 은 그대로 유지.

   ★ 재구성: 컨텐츠 스왑 후 타이틀이 우하단에 떠 있고 메타/버튼이 흩어지던 문제를
   해결. 배지 → 부제 → 타이틀 → 소개 → 일시 → 장소 → 일자별 2버튼을 하나의
   세로 흐름 컬럼으로 묶어 단일 뷰포트(≈100vh) 안에 위계 있게 배치한다.
   좌우 거터는 below-hero 섹션과 동일하게 글로벌 .shell(--maxw/--margin)을 사용. */
export default function Hero() {
  const { hero } = conference;
  const d1 = speakers.filter((s) => s.day === 1);
  const d2 = speakers.filter((s) => s.day === 2);

  return (
    <section id="top" className={styles.hero}>
      <HeatBlob />

      {/* 모서리 날짜 — 좌 08.20(D1) · 우 08.21(D2). 컨셉 요소(아이덴티티) */}
      <span className={`${styles.date} ${styles.dateTl}`} aria-hidden="true">
        08.<br />20
      </span>
      <span className={`${styles.date} ${styles.dateTr}`} aria-hidden="true">
        08.<br />21
      </span>

      {/* 단일 흐름 컬럼 — 좌우 거터는 .shell 로 below-hero 섹션과 정렬 */}
      <div className={`${styles.inner} shell`}>
        <div className={styles.content}>
          <p className={styles.badge}>{hero.badge}</p>

          <h1 className={styles.title}>
            <span className={styles.titleKr}>디자인 썸머 일산</span>
            <span className={styles.sup}>{hero.subtitle}</span>
          </h1>

          <p className={styles.desc}>{hero.desc}</p>

          <dl className={styles.meta}>
            <div className={styles.metaRow}>
              <dt>일시</dt>
              <dd>{hero.date}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>장소</dt>
              <dd>{hero.venue}</dd>
            </div>
          </dl>

          <div className={styles.cta}>
            {hero.register.map((r) => (
              <a
                key={r.day}
                className={styles.regBtn}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{r.label} →</span>
              </a>
            ))}
          </div>
        </div>

        {/* 연사 — 세로쓰기 밴드 (아이덴티티), 데이별 묶음 */}
        <nav className={styles.studios} aria-label="라인업 바로가기">
          <div className={styles.dayGroup}>
            <span className={styles.studioDay}>DAY 1</span>
            {d1.map((s) => (
              <a key={s.id} href="#lineup1" className={styles.studio}>
                {s.studio}
              </a>
            ))}
          </div>
          <div className={styles.dayGroup}>
            <span className={styles.studioDay}>DAY 2</span>
            {d2.map((s) => (
              <a key={s.id} href="#lineup2" className={styles.studio}>
                {s.studio}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
