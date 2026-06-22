import styles from "./Benefits.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [HEATMAP 변형] 참가 혜택 — conference.benefits.groups 로 렌더. */
export default function Benefits() {
  return (
    <section id="benefits" className={`${styles.benefits} shell`}>
      <Reveal>
        <p className={styles.tag}>참가 혜택</p>
        <div className={styles.groups}>
          {conference.benefits.groups.map((g, gi) => (
            <div key={gi} className={styles.group}>
              <h3 className={styles.groupHead}>{g.heading}</h3>
              <ul className={styles.list}>
                {g.items.map((it, i) => (
                  <li key={i} className={styles.item}>
                    <span className={styles.dot} aria-hidden="true" />
                    <div className={styles.itemBody}>
                      <p className={styles.itemTitle}>{it.title}</p>
                      <p className={styles.itemText}>{it.body}</p>
                    </div>
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
