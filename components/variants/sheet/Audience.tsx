import styles from "./Audience.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [SHEET 변형] 추천 대상 — 공식 conference.audience(day1/day2) 렌더. */
export default function Audience() {
  const { day1, day2 } = conference.audience;
  const cols = [
    { day: 1, ...day1 },
    { day: 2, ...day2 },
  ];

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
              <p className={styles.colDay}>Day {c.day}</p>
              <h3 className={styles.heading}>{c.heading}</h3>
              <ul className={styles.items}>
                {c.items.map((it, i) => (
                  <li key={i} className={styles.item}>
                    <span className={styles.bullet} aria-hidden="true" />
                    {it}
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
