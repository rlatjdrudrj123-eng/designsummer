import styles from "./Benefits.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [SHEET 변형] 연계 이벤트 및 참가 혜택 — 공식 conference.benefits 렌더. */
export default function Benefits() {
  return (
    <section id="benefits" className={`${styles.benefits} shell`}>
      <Reveal>
        <p className={styles.tag}>연계 이벤트 · 참가 혜택</p>
        <div className={styles.groups}>
          {conference.benefits.groups.map((g, gi) => (
            <div key={gi} className={styles.group}>
              <h3 className={styles.groupHead}>{g.heading}</h3>
              <ul className={styles.items}>
                {g.items.map((it, i) => (
                  <li key={i} className={styles.item}>
                    <p className={styles.itemTitle}>{it.title}</p>
                    <p className={styles.itemBody}>{it.body}</p>
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
