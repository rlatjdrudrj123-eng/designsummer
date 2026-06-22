import { conference } from "../conference";
import styles from "./TerminalSections.module.css";

/* ABOUT (행사 개요) rendered as a console readout / boot log.
 * conference.about.intro + the two day blocks, each framed as a mounted
 * partition record. All facts verbatim from conference.ts. */
export default function TerminalAbout() {
  const { intro, days } = conference.about;

  return (
    <section id="about" className={`${styles.sect} shell`} aria-labelledby="t-about-h">
      <div className={styles.inner}>
        <p className={styles.cmd}>
          <span className={styles.caret}>thermal@kprint:~$</span> cat
          about/overview.log
        </p>
        <h2 id="t-about-h" className={styles.head}>
          <span className={styles.headKick}>// SECTION 0x01</span>
          행사 개요
        </h2>

        <p className={styles.lead}>{intro}</p>

        <div className={styles.cards}>
          {days.map((d) => (
            <article key={d.day} className={styles.card}>
              <header className={styles.cardBar}>
                <span className={styles.cardTag}>DAY 0{d.day}</span>
                <span className={styles.cardDate}>{d.date}</span>
                <span className={styles.cardStatus}>MOUNTED</span>
              </header>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardComment}>{`> ${d.title}`}</span>
              </h3>
              <p className={styles.cardBody}>{d.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
