import styles from "./About.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [HEATMAP 변형] 행사 개요(ABOUT) — conference.about 으로 렌더.
   인트로 + 일자별 트랙(Day 1 / Day 2) 카드. */
export default function About() {
  const a = conference.about;
  return (
    <section id="about" className={`${styles.about} shell`}>
      <Reveal>
        <p className={styles.tag}>About</p>
        <p className={styles.intro}>{a.intro}</p>
        <div className={styles.days}>
          {a.days.map((d) => (
            <article
              key={d.day}
              className={`${styles.day} ${d.day === 1 ? styles.d1 : styles.d2}`}
            >
              <p className={styles.dayHead}>
                <span className={styles.dayLabel}>Day {d.day}</span>
                <span className={styles.dayDate}>{d.date}</span>
              </p>
              <h3 className={styles.dayTitle}>{d.title}</h3>
              <p className={styles.dayBody}>{d.body}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
