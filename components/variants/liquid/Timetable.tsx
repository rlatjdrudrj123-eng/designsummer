import styles from "./Timetable.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [LIQUID 변형] 상세 타임테이블 — 공식 컨퍼런스 프로그램.
   등록(reg)·휴식(break)·세션을 시각적으로 구분하고, 세션은 시간·스튜디오·연사·
   제목·설명을 모두 노출. 일자별 사전등록 CTA 포함. */
export default function Timetable() {
  const { day1, day2 } = conference.timetable;
  const days = [day1, day2];
  const register = conference.hero.register;

  return (
    <section id="schedule" className={`${styles.timetable} shell`}>
      <Reveal>
        <p className={styles.tag}>상세 프로그램</p>
        <div className={styles.grid}>
          {days.map((d) => {
            const reg = register.find((r) => r.day === d.day);
            return (
              <div key={d.day} className={styles.day}>
                <p className={styles.dayHead}>
                  <span className={styles.dayLabel}>Day {d.day}</span>
                  <span className={styles.dayDate}>{d.date}</span>
                </p>
                <p className={styles.dayTitle}>{d.title}</p>
                <ul className={styles.rows}>
                  {d.rows.map((row, i) => {
                    const kind = row.kind ?? "session";
                    return (
                      <li
                        key={i}
                        className={`${styles.row} ${
                          kind === "reg"
                            ? styles.reg
                            : kind === "break"
                            ? styles.break
                            : ""
                        }`}
                      >
                        <span className={styles.time}>{row.time}</span>
                        {kind === "session" ? (
                          <>
                            {row.studio ? (
                              <span className={styles.studio}>
                                {row.studio}
                                {row.speaker ? (
                                  <span className={styles.speaker}>
                                    {" "}
                                    · {row.speaker}
                                  </span>
                                ) : null}
                              </span>
                            ) : null}
                            <span className={styles.title}>{row.title}</span>
                            {row.desc ? (
                              <span className={styles.desc}>{row.desc}</span>
                            ) : null}
                          </>
                        ) : (
                          <span className={styles.label}>{row.title}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {reg ? (
                  <a
                    className={styles.cta}
                    href={reg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{reg.label} →</span>
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
