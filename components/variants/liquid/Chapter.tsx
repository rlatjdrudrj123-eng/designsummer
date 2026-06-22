import styles from "./Chapter.module.css";
import Reveal from "./Reveal";
import Parallax from "./Parallax";
import ConceptHeat from "./ConceptHeat";
import { siteContent, formatDate } from "@/lib/content";

/* [LIQUID 변형] 원본 components/sections/Chapter.tsx 클론 — 구조·카피 동일.
   ConceptHeat 만 로컬(liquid) 카피를 사용해 액상 무지개 LUT 로 렌더. */
export default function Chapter({ day }: { day: 1 | 2 }) {
  const c = day === 1 ? siteContent.concept.d1 : siteContent.concept.d2;
  const keywords =
    day === 1 ? siteContent.concept.d1.tags : siteContent.concept.d2.modules;
  const { md, dow } = formatDate(siteContent.dates[day - 1]);

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
          <span>Day {day} 신청하기 →</span>
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
