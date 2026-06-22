import styles from "./Timetable.module.css";
import Reveal from "./Reveal";
import { conference } from "./conference";

/* 타임테이블 — conference.timetable(day1 & day2). 각 데이: 날짜 + 제목 + 행 목록.
   reg/break 행은 차분하게(연사 없음), 세션 행은 시간 · 스튜디오 · 연사 · 제목 · 설명.
   #day1/#day2 앵커 + 데이별 사전등록 CTA. */
export default function Timetable() {
  const { register } = conference.hero;
  const days = [conference.timetable.day1, conference.timetable.day2];

  return (
    <section id="schedule" className={`${styles.timetable} shell`}>
      <Reveal>
        <p className={styles.kicker}>Timetable</p>
        <h2 className={styles.heading}>상세 프로그램</h2>
        <div className={styles.grid}>
          {days.map((d) => {
            const cta = register.find((r) => r.day === d.day) ?? register[0];
            return (
              <div key={d.day} id={`schedule-day${d.day}`} className={styles.day}>
                <p className={styles.dayHead}>
                  <span className={styles.dayLabel}>Day {d.day}</span>
                  <span className={styles.dayDate}>{d.date}</span>
                </p>
                <p className={styles.dayTitle}>{d.title}</p>

                <ul className={styles.rows}>
                  {d.rows.map((row, i) => {
                    const kind = row.kind ?? "session";
                    if (kind === "session") {
                      return (
                        <li key={i} className={styles.row}>
                          <span className={styles.time}>{row.time}</span>
                          <span className={styles.studio}>
                            {row.studio}
                            {row.speaker && (
                              <span className={styles.speaker}> · {row.speaker}</span>
                            )}
                          </span>
                          <span className={styles.sessionTitle}>{row.title}</span>
                          {row.desc && <span className={styles.desc}>{row.desc}</span>}
                        </li>
                      );
                    }
                    return (
                      <li
                        key={i}
                        className={`${styles.row} ${
                          kind === "reg" ? styles.reg : styles.break
                        }`}
                      >
                        <span className={styles.time}>{row.time}</span>
                        <span className={styles.metaTitle}>{row.title}</span>
                      </li>
                    );
                  })}
                </ul>

                <a
                  className={styles.cta}
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{cta.label} →</span>
                </a>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
