import { conference } from "../conference";
import styles from "./TerminalSections.module.css";

/* AUDIENCE (추천 대상) rendered as record lists — one query per day,
 * each item a returned record row. Facts verbatim from conference.ts. */
export default function TerminalAudience() {
  const { day1, day2 } = conference.audience;
  const groups = [
    { day: 1, ...day1 },
    { day: 2, ...day2 },
  ];

  return (
    <section
      id="audience"
      className={`${styles.sect} shell`}
      aria-labelledby="t-aud-h"
    >
      <div className={styles.inner}>
        <p className={styles.cmd}>
          <span className={styles.caret}>thermal@kprint:~$</span> query
          audience --match-profile
        </p>
        <h2 id="t-aud-h" className={styles.head}>
          <span className={styles.headKick}>// SECTION 0x02</span>
          추천 대상
        </h2>

        <div className={styles.cards}>
          {groups.map((g) => (
            <article key={g.day} className={styles.card}>
              <header className={styles.cardBar}>
                <span className={styles.cardTag}>DAY 0{g.day}</span>
                <span className={styles.cardStatus}>
                  {g.items.length} MATCHES
                </span>
              </header>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardComment}>{`// ${g.heading}`}</span>
              </h3>
              <ul className={styles.recList}>
                {g.items.map((item, i) => (
                  <li key={i} className={styles.recItem}>
                    <span className={styles.recIdx}>
                      [{String(i).padStart(2, "0")}]
                    </span>
                    <span className={styles.recText}>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
