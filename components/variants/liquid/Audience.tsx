import styles from "./Audience.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [LIQUID 변형] 추천 대상 — 일자별 대상 그룹. 공식 컨퍼런스 콘텐츠. */
export default function Audience() {
  const { audience } = conference;
  const cols = [
    { day: 1, ...audience.day1 },
    { day: 2, ...audience.day2 },
  ] as const;

  return (
    <section id="audience" className={`${styles.audience} shell`}>
      <Reveal>
        <p className={styles.tag}>이런 분께 추천합니다</p>
      </Reveal>
      <div className={styles.grid}>
        {cols.map((c) => (
          <Reveal
            key={c.day}
            className={`${styles.col} ${c.day === 1 ? styles.d1 : styles.d2}`}
          >
            <p className={styles.dayLabel}>Day {c.day}</p>
            <h3 className={styles.heading}>{c.heading}</h3>
            <ul className={styles.items}>
              {c.items.map((it, i) => (
                <li key={i} className={styles.item}>
                  <span className={styles.mark} aria-hidden="true" />
                  {it}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
