import styles from "./Timetable.module.css";
import Reveal from "@/components/develop/Reveal";
import { conference } from "@/lib/conference";

/* 타임테이블 (Aura 전용 포크) — 하나의 통합 표.
   (forked from components/aura1/Timetable.tsx — independent of /aura1.)
   시간 | Day 1 | Day 2 의 3컬럼. day1/day2 의 rows 를 같은 time 으로 묶어
   슬롯당 한 행으로 렌더한다.

   행 종류:
   1) 등록(reg) · 휴식(break): 양일 공통 → Day1·Day2 셀을 하나로 병합해
      가운데 정렬 라벨 한 줄로 렌더.
   2) 세션(session): Day1 셀은 day1, Day2 셀은 day2 의 스튜디오·연사·세션 제목
      (설명 desc 는 표시하지 않음). */
export default function Timetable() {
  const { day1, day2 } = conference.timetable;
  // 컬럼 헤더 컨셉 라벨(개요와 동일 소스): "creative day" / "craft day".
  const [ov1, ov2] = conference.overview.days;
  // 일자별 사전등록 URL(히어로 register 와 동일 소스).
  const reg = conference.hero.register;
  const url1 = reg.find((r) => r.day === 1)?.url ?? reg[0].url;
  const url2 = reg.find((r) => r.day === 2)?.url ?? reg[1].url;

  // 두 날의 rows 는 동일한 time 슬롯을 공유한다 → time 기준으로 병합.
  // 중간 브레이크(14:40-14:50) 행은 표에서 숨긴다(클라이언트 요청). 데이터는 유지.
  const slots = day1.rows
    .filter((r1) => (r1.kind ?? "session") !== "break")
    .map((r1, i) => {
      const r2 = day2.rows.find((r) => r.time === r1.time) ?? day2.rows[i];
      const kind = r1.kind ?? "session";
      return { time: r1.time, kind, r1, r2 };
    });

  return (
    <section id="schedule" className={`${styles.timetable} shell`}>
      <Reveal>
        {/* '상세 프로그램' 헤딩 제거(클라이언트 요청) — 표만 개요 아래에 자연스럽게 붙는다. */}
        <div className={styles.table} role="table" aria-label="상세 프로그램">
          {/* 헤더 행 */}
          <div className={`${styles.headRow}`} role="row">
            <span className={styles.headTime} role="columnheader">
              time
            </span>
            <span
              className={`${styles.headDay} ${styles.headDay1}`}
              role="columnheader"
            >
              {/* 표 헤더는 날짜+요일만: "08.20. thu" (day→section 혼동 방지). */}
              <span className={styles.headDayLabel}>{ov1.date}</span>
            </span>
            <span
              className={`${styles.headDay} ${styles.headDay2}`}
              role="columnheader"
            >
              <span className={styles.headDayLabel}>{ov2.date}</span>
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
                      <span className={styles.cellHint}>Section A</span>
                      <span className={styles.studio}>{slot.r1.studio}</span>
                      {slot.r1.speaker && (
                        <span className={styles.speaker}>{slot.r1.speaker}</span>
                      )}
                      <span className={styles.sessionTitle}>
                        {slot.r1.title}
                      </span>
                    </span>

                    <span
                      className={`${styles.cell} ${styles.cellDay2}`}
                      role="cell"
                    >
                      <span className={styles.cellHint}>Section B</span>
                      <span className={styles.studio}>{slot.r2.studio}</span>
                      {slot.r2.speaker && (
                        <span className={styles.speaker}>{slot.r2.speaker}</span>
                      )}
                      <span className={styles.sessionTitle}>
                        {slot.r2.title}
                      </span>
                    </span>
                  </>
                )}
              </div>
            );
          })}

          {/* 표 맨 아래 CTA 행 — 일자별 신청하기(day1·day2 컬럼에 각각). */}
          <div className={`${styles.row} ${styles.ctaRow}`} role="row">
            <span className={styles.time} role="cell" aria-hidden="true" />
            <span className={styles.ctaCell} role="cell">
              <a
                className={styles.cta}
                href={url1}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>section A 신청하기</span>
              </a>
            </span>
            <span className={styles.ctaCell} role="cell">
              <a
                className={styles.cta}
                href={url2}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>section B 신청하기</span>
              </a>
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
