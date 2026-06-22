import styles from "./Timetable.module.css";
import Reveal from "@/components/develop/Reveal";
import { conference } from "@/lib/conference";

/* 타임테이블 (Aura1 전용 포크) — 하나의 통합 표.
   시간 | Day 1 | Day 2 의 3컬럼. day1/day2 의 rows 를 같은 time 으로 묶어
   슬롯당 한 행으로 렌더한다. develop·variants 탭에는 영향 없음.

   행 종류:
   1) 등록(reg) · 휴식(break): 양일 공통 → Day1·Day2 셀을 하나로 병합해
      가운데 정렬 라벨 한 줄로 렌더.
   2) 세션(session): Day1 셀은 day1, Day2 셀은 day2 의 스튜디오·연사·세션 제목
      (설명 desc 는 표시하지 않음). */
export default function Timetable() {
  const { day1, day2 } = conference.timetable;

  // 두 날의 rows 는 동일한 time 슬롯을 공유한다 → time 기준으로 병합.
  const slots = day1.rows.map((r1, i) => {
    const r2 = day2.rows.find((r) => r.time === r1.time) ?? day2.rows[i];
    const kind = r1.kind ?? "session";
    return { time: r1.time, kind, r1, r2 };
  });

  return (
    <section id="schedule" className={`${styles.timetable} shell`}>
      <Reveal>
        <h2 className={styles.heading}>상세 프로그램</h2>

        <div className={styles.table} role="table" aria-label="상세 프로그램">
          {/* 헤더 행 */}
          <div className={`${styles.headRow}`} role="row">
            <span className={styles.headTime} role="columnheader">
              시간
            </span>
            <span
              className={`${styles.headDay} ${styles.headDay1}`}
              role="columnheader"
            >
              <span className={styles.headDayLabel}>Day 1</span>
              <span className={styles.headDayDate}>{day1.date}</span>
            </span>
            <span
              className={`${styles.headDay} ${styles.headDay2}`}
              role="columnheader"
            >
              <span className={styles.headDayLabel}>Day 2</span>
              <span className={styles.headDayDate}>{day2.date}</span>
            </span>
          </div>

          {slots.map((slot) => {
            const merged = slot.kind === "reg" || slot.kind === "break";

            return (
              <div
                key={slot.time}
                className={`${styles.row} ${
                  merged ? styles.rowMerged : styles.rowSession
                } ${slot.kind === "break" ? styles.break : ""} ${
                  slot.kind === "reg" ? styles.reg : ""
                }`}
                role="row"
              >
                <span className={styles.time} role="cell">
                  {slot.time}
                </span>

                {merged ? (
                  <span className={styles.mergedCell} role="cell">
                    <span className={styles.mergedLabel}>{slot.r1.title}</span>
                  </span>
                ) : (
                  <>
                    <span
                      className={`${styles.cell} ${styles.cellDay1}`}
                      role="cell"
                    >
                      <span className={styles.cellHint}>Day 1</span>
                      <span className={styles.studio}>
                        {slot.r1.studio}
                        {slot.r1.speaker && (
                          <span className={styles.speaker}>
                            {" "}
                            · {slot.r1.speaker}
                          </span>
                        )}
                      </span>
                      <span className={styles.sessionTitle}>
                        {slot.r1.title}
                      </span>
                    </span>

                    <span
                      className={`${styles.cell} ${styles.cellDay2}`}
                      role="cell"
                    >
                      <span className={styles.cellHint}>Day 2</span>
                      <span className={styles.studio}>
                        {slot.r2.studio}
                        {slot.r2.speaker && (
                          <span className={styles.speaker}>
                            {" "}
                            · {slot.r2.speaker}
                          </span>
                        )}
                      </span>
                      <span className={styles.sessionTitle}>
                        {slot.r2.title}
                      </span>
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
