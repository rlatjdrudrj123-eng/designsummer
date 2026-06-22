import styles from "./Timetable.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [HEATMAP 변형] 상세 타임테이블 — conference.timetable 로 렌더.
   등록(reg)·휴식(break) 행은 세션과 구분된 스타일. 세션은 시간·스튜디오·연사·제목·설명 표시.
   하단에 일자별 사전등록 CTA. */
const DAYS = [conference.timetable.day1, conference.timetable.day2] as const;

export default function Timetable() {
  return (
    <section id="schedule" className={`${styles.timetable} shell`}>
      <Reveal>
        <p className={styles.tag}>Timetable · 상세 프로그램</p>
        <div className={styles.grid}>
          {DAYS.map((d) => {
            const reg = conference.hero.register[d.day - 1];
            return (
              <div key={d.day} className={`${styles.day} ${d.day === 1 ? styles.d1 : styles.d2}`}>
                <p className={styles.dayHead}>
                  <span className={styles.dayLabel}>Day {d.day}</span>
                  <span className={styles.dayDate}>{d.date}</span>
                </p>
                <p className={styles.dayTitle}>{d.title}</p>

                <ul className={styles.rows}>
                  {d.rows.map((r, i) => {
                    const kind = r.kind ?? "session";
                    return (
                      <li
                        key={i}
                        className={`${styles.row} ${
                          kind === "reg" ? styles.reg : kind === "break" ? styles.brk : ""
                        }`}
                      >
                        <span className={styles.time}>{r.time}</span>
                        <div className={styles.rowBody}>
                          {r.studio ? (
                            <span className={styles.studio}>
                              {r.studio}
                              {r.speaker ? (
                                <span className={styles.speaker}> · {r.speaker}</span>
                              ) : null}
                            </span>
                          ) : null}
                          <span className={styles.title}>{r.title}</span>
                          {r.desc ? <span className={styles.desc}>{r.desc}</span> : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <a
                  className={`${styles.cta} ${d.day === 2 ? styles.cta2 : ""}`}
                  href={reg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{reg.label} →</span>
                </a>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
