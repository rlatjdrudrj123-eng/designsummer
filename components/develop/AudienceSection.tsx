import styles from "./AudienceSection.module.css";
import Reveal from "./Reveal";
import { conference } from "./conference";

/* 추천 대상 — conference.audience.day1 & day2 (heading + items). Day1/Day2 분할. */
export default function AudienceSection() {
  const { day1, day2 } = conference.audience;
  const cols = [
    { day: 1, ...day1 },
    { day: 2, ...day2 },
  ];

  return (
    <section id="audience" className={`${styles.audience} shell`}>
      <Reveal>
        <p className={styles.kicker}>Audience</p>
        <h2 className={styles.heading}>추천 대상</h2>

        <div className={styles.cols}>
          {cols.map((c) => (
            <article key={c.day} className={styles.col}>
              <p className={styles.dayHead}>
                <span className={styles.dayLabel}>Day {c.day}</span>
              </p>
              <h3 className={styles.colHeading}>{c.heading}</h3>
              <ul className={styles.items}>
                {c.items.map((item, i) => (
                  <li key={i} className={styles.item}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
