import styles from "./Chapter.module.css";
import Reveal from "./Reveal";
import Parallax from "./Parallax";
import ConceptHeat from "./ConceptHeat";
import { siteContent, formatDate } from "@/lib/content";
import { type Lang } from "./developEn";

/* D1/D2 타이틀 영역 — 동일 구조, 좌우 미러링·색만 다르게.
   텍스트(DAY N · 대제목 · 본문 · 키워드 리스트) + KV 열 오브제.
   D1: 좌 텍스트 / 우 오브제(레드). D2: 우 텍스트 / 좌 오브제(오렌지).
   콘텐츠는 ko/en 동일(한국어) — en 은 히어로 KV 타이틀만 영문이다. */
export default function Chapter({ day }: { day: 1 | 2; lang?: Lang }) {
  const c = day === 1 ? siteContent.concept.d1 : siteContent.concept.d2;
  const keywords =
    day === 1 ? siteContent.concept.d1.tags : siteContent.concept.d2.modules;
  const iso = siteContent.dates[day - 1];
  const { md, dow } = formatDate(iso);

  return (
    <section
      id={`day${day}`}
      className={`${styles.chapter} ${day === 1 ? styles.d1 : styles.d2} shell`}
    >
      <Reveal className={styles.text}>
        <p className={styles.sub}>
          DAY {day}
          <span className={styles.date}>
            {md} ({dow})
          </span>
        </p>
        <h2 className={styles.title}>{c.title}</h2>
        <p className={styles.body}>{c.body}</p>
        <ul className={styles.keywords}>
          {keywords.map((k, i) => (
            <li key={i} className={styles.keyword}>
              <span className={styles.kwNum}>{String(i + 1).padStart(2, "0")}</span>
              {k}
            </li>
          ))}
        </ul>
        <a
          className={styles.cta}
          href={siteContent.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{`Day ${day} 신청하기 →`}</span>
        </a>
      </Reveal>
      <div className={`${styles.graphic} ${styles.graphicObject}`}>
        <Parallax speed={0.16}>
          <ConceptHeat day={day} />
        </Parallax>
      </div>
    </section>
  );
}
