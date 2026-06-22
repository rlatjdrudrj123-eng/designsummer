import styles from "./Timetable.module.css";
import Reveal from "./Reveal";
import { conference, type TimetableRow } from "@/lib/conference";

/* [PROCESS · CMYK 변형] 상세 타임테이블 — conference.timetable.
   reg(등록)·break(휴식) 행은 세션과 구분해 렌더. 세션은 time·studio·speaker·title·desc.
   Day1 시안 / Day2 마젠타 잉크 액센트. */
function Row({ r }: { r: TimetableRow }) {
  const kind = r.kind ?? "session";
  if (kind === "reg" || kind === "break") {
    return (
      <li className={`${styles.row} ${kind === "reg" ? styles.reg : styles.break}`}>
        <span className={styles.time}>{r.time}</span>
        <span className={styles.aux}>{r.title}</span>
      </li>
    );
  }
  return (
    <li className={`${styles.row} ${styles.session}`}>
      <span className={styles.time}>{r.time}</span>
      <div className={styles.body}>
        <p className={styles.meta}>
          {r.studio ? <span className={styles.studio}>{r.studio}</span> : null}
          {r.speaker ? <span className={styles.speaker}>{r.speaker}</span> : null}
        </p>
        <p className={styles.title}>{r.title}</p>
        {r.desc ? <p className={styles.desc}>{r.desc}</p> : null}
      </div>
    </li>
  );
}

export default function Timetable() {
  const days = [conference.timetable.day1, conference.timetable.day2];
  return (
    <section id="schedule" className={`${styles.timetable} shell`}>
      <Reveal>
        <p className={styles.tag}>Timetable</p>
        <div className={styles.grid}>
          {days.map((d) => (
            <div
              key={d.day}
              className={`${styles.day} ${d.day === 1 ? styles.d1 : styles.d2}`}
            >
              <p className={styles.dayHead}>
                <span className={styles.dayLabel}>Day {d.day}</span>
                <span className={styles.dayDate}>{d.date}</span>
              </p>
              <p className={styles.dayTheme}>{d.title}</p>
              <ul className={styles.rows}>
                {d.rows.map((r, i) => (
                  <Row key={i} r={r} />
                ))}
              </ul>
              <a
                className={styles.cta}
                href={conference.hero.register[d.day - 1].url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Day {d.day} 사전등록 →</span>
              </a>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
