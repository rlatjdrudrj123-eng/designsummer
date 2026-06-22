import styles from "./Chapter.module.css";
import Reveal from "./Reveal";
import Parallax from "./Parallax";
import ConceptHeat from "./ConceptHeat";
import { siteContent, formatDate } from "@/lib/content";

/* [PROCESS 변형] 원본 components/sections/Chapter.tsx 클론 — 구조·카피 동일.
   ConceptHeat 만 로컬(process) 카피: 두 날 모두 CMYK 감산잉크 + 하프톤 도트. */
export default function Chapter({ day }: { day: 1 | 2 }) {
  const c = day === 1 ? siteContent.concept.d1 : siteContent.concept.d2;
  const keywords =
    day === 1 ? siteContent.concept.d1.tags : siteContent.concept.d2.modules;
  const { md, dow } = formatDate(siteContent.dates[day - 1]);

  // CMYK 인쇄 프레이밍 카피 (사실 아님 — 디자인 프레이밍만, 데이터는 그대로)
  const processTag =
    day === 1 ? "CMYK · CYAN PLATE" : "CMYK · MAGENTA PLATE";
  const processKo = day === 1 ? "잉크가 되는 생각" : "실물에 닿는 잉크";

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
        <p className={styles.process}>
          <span className={styles.processCode}>{processTag}</span>
          <span className={styles.processKo}>{processKo}</span>
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
          <div className={styles.objectFrame}>
            <ConceptHeat day={day} />
          </div>
        </Parallax>
      </div>
    </section>
  );
}
