import { conference } from "../conference";
import styles from "./TerminalSections.module.css";

/* BENEFITS (연계 이벤트 및 참가 혜택) rendered as a console list — each group a
 * labelled block, items as enumerated log entries. Facts verbatim. */
export default function TerminalBenefits() {
  const { groups } = conference.benefits;

  return (
    <section
      id="benefits"
      className={`${styles.sect} shell`}
      aria-labelledby="t-ben-h"
    >
      <div className={styles.inner}>
        <p className={styles.cmd}>
          <span className={styles.caret}>thermal@kprint:~$</span> ls
          benefits/ --long
        </p>
        <h2 id="t-ben-h" className={styles.head}>
          <span className={styles.headKick}>// SECTION 0x03</span>
          연계 이벤트 · 참가 혜택
        </h2>

        <div className={styles.benGroups}>
          {groups.map((grp, gi) => (
            <div key={gi} className={styles.benGroup}>
              <p className={styles.benHead}>
                <span className={styles.benDir}>{`./${gi === 0 ? "pre-register" : "on-site"}/`}</span>
                {grp.heading}
              </p>
              <ul className={styles.benList}>
                {grp.items.map((item, i) => (
                  <li key={i} className={styles.benItem}>
                    <p className={styles.benTitle}>
                      <span className={styles.benBullet}>$</span>
                      {item.title}
                    </p>
                    <p className={styles.benBody}>{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
