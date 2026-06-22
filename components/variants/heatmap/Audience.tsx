import styles from "./Audience.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [HEATMAP 변형] 추천 대상 — conference.audience(day1/day2) 로 렌더. */
export default function Audience() {
  const a = conference.audience;
  const cols = [
    { day: 1, ...a.day1 },
    { day: 2, ...a.day2 },
  ] as const;

  return (
    <section id="audience" className={`${styles.audience} shell`}>
      <Reveal>
        <p className={styles.tag}>추천 대상</p>
        <div className={styles.grid}>
          {cols.map((c) => (
            <div
              key={c.day}
              className={`${styles.col} ${c.day === 1 ? styles.d1 : styles.d2}`}
            >
              <p className={styles.colHead}>
                <span className={styles.dayLabel}>Day {c.day}</span>
                {c.heading}
              </p>
              <ul className={styles.list}>
                {c.items.map((item, i) => (
                  <li key={i} className={styles.item}>
                    <span className={styles.num}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{item}</span>
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
