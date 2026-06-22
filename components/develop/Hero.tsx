import styles from "./Hero.module.css";
import HeatBlob from "./HeatBlob";
import { speakers, siteContent } from "@/lib/content";
import { sairaCondensed } from "./developFont";
import { VENUE_EN, formatDateRangeEn, type Lang } from "./developEn";
import { conference } from "./conference";

/* 히어로 (가이드 8장) — 공식 컨퍼런스 카피(conference.hero)를 렌더한다.
   - 중앙정렬 금지: 타이틀 우측 치우침, 메타는 모서리에 "정리된 디자인 요소"로 배치
   - 배지 → 서브타이틀("시각의 전환, 실무의 확장") → 짧은 desc → 일시·장소 → 일자별 사전등록 2버튼
   - 옛 "the creative heatwave" 태그라인은 제거하고 subtitle 로 교체
   - 좌하단 연사: 데이별 2줄 (세로쓰기) */
export default function Hero({ lang = "ko" }: { lang?: Lang }) {
  const d1 = speakers.filter((s) => s.day === 1);
  const d2 = speakers.filter((s) => s.day === 2);
  const en = lang === "en";
  const { badge, subtitle, desc, date, register } = conference.hero;

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

      {/* 텍스트 락업은 카드와 동일한 중앙 거터(min(1100px,94%)) 안에 정렬.
          날짜 모서리·열 KV·하단 블렌드만 풀블리드로 남는다. */}
      <div className={styles.gutter}>
        {/* 메인 카피 — 배지 + 서브타이틀(시각의 전환, 실무의 확장). heatwave 태그라인 제거. */}
        <div className={styles.lede}>
          <span className={styles.badge}>{badge}</span>
          <p
            className={
              en
                ? `${styles.tagline} ${styles.taglineEn} ${sairaCondensed.className}`
                : styles.tagline
            }
          >
            {subtitle}
          </p>
          <p className={styles.ledeDesc}>{desc}</p>
        </div>

        {/* 타이틀 클러스터 (우측 치우침, 거터 안).
            2026°C 는 단독으로 떠 있지 않고 °C 마크로 묶는다(.mark). */}
        <div className={styles.titleBlock}>
          <p className={styles.mark}>
            <span className={styles.markYear}>2026°C</span>
            {!en && <span className={styles.markSub}>시각의 전환, 실무의 확장</span>}
          </p>
          {en ? (
            <h1 className={`${styles.title} ${styles.titleEn} ${sairaCondensed.className}`}>
              Design Summer <span className={styles.titleAccent}>2026</span>
            </h1>
          ) : (
            <h1 className={styles.title}>디자인 썸머 일산</h1>
          )}
          {/* 보조 메타 — 일시 + 장소. en 은 장소명/일시를 영문 디스플레이로. */}
          {en ? (
            <p className={`${styles.venueMeta} ${styles.venueMetaEn}`}>
              <span className={`${styles.venueName} ${sairaCondensed.className}`}>
                {VENUE_EN}
              </span>
              <span className={`${styles.venueDate} ${sairaCondensed.className}`}>
                {formatDateRangeEn(siteContent.dates)}
              </span>
            </p>
          ) : (
            <p className={styles.venueMeta}>
              <span className={styles.venueDate}>{date}</span>
              <span className={styles.venueName}>{conference.hero.venue}</span>
            </p>
          )}

          {/* 일자별 사전등록 2버튼 — 각자 자신의 url 로 링크 아웃. */}
          <div className={styles.register}>
            {register.map((r) => (
              <a
                key={r.day}
                className={styles.regBtn}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{r.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* 좌하단 연사 — 세로쓰기 (아이덴티티). 데이별로 묶어 한 밴드에.
            라벨 없이 한국어 스튜디오명(s.studio)만, 데이 사이는 넓은 간격으로 구분. */}
        <nav className={styles.studios} aria-label="라인업 바로가기">
          <div className={styles.dayGroup}>
            {d1.map((s) => (
              <a key={s.id} href="#day1" className={styles.studio}>
                {s.studio}
              </a>
            ))}
          </div>
          <div className={styles.dayGroup}>
            {d2.map((s) => (
              <a key={s.id} href="#day2" className={styles.studio}>
                {s.studio}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
