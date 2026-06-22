import styles from "./AboutSection.module.css";
import Reveal from "./Reveal";
import { conference } from "./conference";

/* 행사 개요 — conference.about.intro + 이틀 블록(day/date/title/body).
   따뜻한 오라 위 투명 배경, 중앙 거터(min(1100px,94%)). */
export default function AboutSection() {
  const { intro, days } = conference.about;

  return (
    <section id="about" className={`${styles.about} shell`}>
      <Reveal>
        <p className={styles.kicker}>About</p>
        <h2 className={styles.heading}>행사 개요</h2>
        <p className={styles.intro}>{intro}</p>

        <div className={styles.days}>
          {days.map((d) => (
            <article key={d.day} className={styles.day}>
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
