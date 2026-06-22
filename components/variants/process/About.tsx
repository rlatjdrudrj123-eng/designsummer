import styles from "./About.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [PROCESS · CMYK 변형] 행사 개요(ABOUT) — conference.about.
   intro 리드 + Day1/Day2 두 트랙 카드. CMYK 잉크 액센트(Day1 시안 / Day2 마젠타). */
export default function About() {
  const { intro, days } = conference.about;

  return (
    <section id="about" className={`${styles.about} shell`}>
      <Reveal>
        <p className={styles.tag}>About</p>
        <p className={styles.intro}>{intro}</p>
        <div className={styles.grid}>
          {days.map((d) => (
            <article
              key={d.day}
              className={`${styles.day} ${d.day === 1 ? styles.d1 : styles.d2}`}
            >
              <p className={styles.dayHead}>
                <span className={styles.dayLabel}>Day {d.day}</span>
                <span className={styles.dayDate}>{d.date}</span>
              </p>
              <h2 className={styles.dayTitle}>{d.title}</h2>
              <p className={styles.dayBody}>{d.body}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
