import styles from "./Benefits.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [PROCESS · CMYK 변형] 연계 이벤트 및 참가 혜택 — conference.benefits.groups. */
export default function Benefits() {
  const { groups } = conference.benefits;

  return (
    <section id="benefits" className={`${styles.benefits} shell`}>
      <Reveal>
        <p className={styles.tag}>참가 혜택</p>
        <div className={styles.groups}>
          {groups.map((g, gi) => (
            <div key={gi} className={styles.group}>
              <h2 className={styles.heading}>
                <span className={styles.headingNum} aria-hidden="true">
                  {String(gi + 1).padStart(2, "0")}
                </span>
                {g.heading}
              </h2>
              <ul className={styles.list}>
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
