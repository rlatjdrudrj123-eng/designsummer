import styles from "./Timetable.module.css";
import Reveal from "@/components/scroll/Reveal";
import { speakersByDay, siteContent, formatDate } from "@/lib/content";

/* 타임테이블 — 헤어라인 표, D1/D2. 12:00 등록 시작 + 세션 시간.
   각 데이 하단에 신청 CTA. */
export default function Timetable() {
  const days = [1, 2] as const;
  return (
    <section id="schedule" className={`${styles.timetable} shell`}>
      <Reveal>
        <p className={styles.tag}>Timetable</p>
        <div className={styles.grid}>
          {days.map((day) => {
            const { md, dow } = formatDate(siteContent.dates[day - 1]);
            return (
              <div key={day} className={styles.day}>
                <p className={styles.dayHead}>
                  <span className={styles.dayLabel}>Day {day}</span>
                  <span className={styles.dayDate}>
                    {md} ({dow})
                  </span>
                </p>
                <ul className={styles.rows}>
                  <li className={`${styles.row} ${styles.reg}`}>
                    <span className={styles.time}>12:00–</span>
                    <span className={styles.studio}>등록 시작</span>
                    <span className={styles.title}>현장 등록 및 입장</span>
                  </li>
                  {speakersByDay(day).map((s) => (
                    <li key={s.id} className={styles.row}>
                      <span className={styles.time}>{s.time}</span>
                      <span className={styles.studio}>{s.studio}</span>
                      <span className={styles.title}>{s.sessionTitle}</span>
                    </li>
                  ))}
                </ul>
                <a
                  className={styles.cta}
                  href={siteContent.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Day {day} 신청하기 →</span>
                </a>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
