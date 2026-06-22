import styles from "./BenefitsSection.module.css";
import Reveal from "./Reveal";
import { conference } from "./conference";

/* 연계 이벤트 및 참가 혜택 — conference.benefits.groups
   (각 그룹: heading + items[{title, body}]). */
export default function BenefitsSection() {
  const { groups } = conference.benefits;

  return (
    <section id="benefits" className={`${styles.benefits} shell`}>
      <Reveal>
        <p className={styles.kicker}>Benefits</p>
        <h2 className={styles.heading}>연계 이벤트 및 참가 혜택</h2>

        <div className={styles.groups}>
          {groups.map((g, gi) => (
            <div key={gi} className={styles.group}>
              <h3 className={styles.groupHeading}>{g.heading}</h3>
              <ul className={styles.items}>
                {g.items.map((item, i) => (
                  <li key={i} className={styles.item}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    <p className={styles.itemBody}>{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
