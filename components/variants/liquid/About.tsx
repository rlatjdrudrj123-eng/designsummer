import styles from "./About.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [LIQUID 변형] 행사 개요 — 인트로 + 양일 트랙 소개. 공식 컨퍼런스 콘텐츠. */
export default function About() {
  const { about } = conference;
  return (
    <section id="about" className={`${styles.about} shell`}>
      <Reveal>
        <p className={styles.tag}>About</p>
        <p className={styles.intro}>{about.intro}</p>
      </Reveal>
      <div className={styles.grid}>
        {about.days.map((d) => (
          <Reveal
            key={d.day}
            className={`${styles.card} ${d.day === 1 ? styles.d1 : styles.d2}`}
          >
            <p className={styles.dayHead}>
              <span className={styles.dayLabel}>Day {d.day}</span>
              <span className={styles.dayDate}>{d.date}</span>
            </p>
            <h2 className={styles.title}>{d.title}</h2>
            <p className={styles.body}>{d.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
