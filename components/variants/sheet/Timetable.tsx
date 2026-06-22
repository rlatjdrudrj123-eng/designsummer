import styles from "./Timetable.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [SHEET 변형] 상세 타임테이블 — 공식 conference.timetable 렌더.
   reg(등록)·break(휴식)·session(세션)을 구분: 세션은 시간·스튜디오·연사·제목·설명 모두 표기. */
export default function Timetable() {
  const days = [conference.timetable.day1, conference.timetable.day2];
  return (
    <section id="schedule" className={`${styles.timetable} shell`}>
      <Reveal>
        <p className={styles.tag}>Timetable · 상세 프로그램</p>
        <div className={styles.grid}>
          {days.map((d) => {
            const reg = conference.hero.register[d.day - 1];
            return (
              <div key={d.day} className={styles.day}>
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
                          kind === "reg"
                            ? styles.reg
                            : kind === "break"
                              ? styles.brk
                              : ""
                        }`}
                      >
                        <span className={styles.time}>{r.time}</span>
                        {kind === "session" ? (
                          <>
                            <span className={styles.studio}>
                              {r.studio}
                              {r.speaker ? (
                                <span className={styles.speaker}>
                                  {" "}
                                  · {r.speaker}
                                </span>
                              ) : null}
                            </span>
                            <span className={styles.title}>{r.title}</span>
                            {r.desc ? (
                              <span className={styles.desc}>{r.desc}</span>
                            ) : null}
                          </>
                        ) : (
                          <span className={styles.label}>{r.title}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <a
                  className={styles.cta}
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
