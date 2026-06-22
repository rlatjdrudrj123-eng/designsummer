import styles from "./Chapter.module.css";
import Reveal from "./Reveal";
import Parallax from "./Parallax";
import ConceptHeat from "./ConceptHeat";
import { conference } from "@/lib/conference";

/* [SHEET 변형] ABOUT 의 하루 블록 — 공식 컨퍼런스 카피(conference.about.days)로 렌더.
   ConceptHeat(프리즘 스펙트럼 오브제)는 그대로 유지. 하단에 해당 일자 사전등록 CTA. */
export default function Chapter({ day }: { day: 1 | 2 }) {
  const d = conference.about.days[day - 1];
  const reg = conference.hero.register[day - 1];

  return (
    <section
      id={`day${day}`}
      className={`${styles.chapter} ${day === 1 ? styles.d1 : styles.d2} shell`}
    >
      <Reveal className={styles.text}>
        <p className={styles.sub}>
          DAY {day}
          <span className={styles.date}>{d.date}</span>
        </p>
        <h2 className={styles.title}>{d.title}</h2>
        <p className={styles.body}>{d.body}</p>
        <a
          className={styles.cta}
          href={reg.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{reg.label} →</span>
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
