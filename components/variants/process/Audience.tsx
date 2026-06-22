import styles from "./Audience.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [PROCESS · CMYK 변형] 추천 대상 — conference.audience.
   Day1/Day2 각 heading + items. Day1 시안 / Day2 마젠타 잉크 액센트. */
export default function Audience() {
  const { day1, day2 } = conference.audience;
  const cols = [
    { day: 1 as const, ...day1 },
    { day: 2 as const, ...day2 },
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
              <p className={styles.dayLabel}>Day {c.day}</p>
              <h2 className={styles.heading}>{c.heading}</h2>
              <ul className={styles.list}>
                {c.items.map((item, i) => (
                  <li key={i} className={styles.item}>
                    <span className={styles.bullet} aria-hidden="true" />
                    {item}
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
