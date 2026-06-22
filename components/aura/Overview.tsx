import styles from "./Overview.module.css";
import Reveal from "@/components/develop/Reveal";
import { conference } from "@/lib/conference";

/* Overview (Aura 전용 / 메인 `/`) — 개요 섹션.
   구성: [헤딩 + 슬로건(국문 옆 소문자)] → 인트로 2단락(둘째 단락 줄바꿈 유지)
   → Day 1/Day 2 (CREATIVE DAY / CRAFT DAY 를 크게, 날짜 괄호·'추천' 단어 없음)
   → 마무리 문장 → Information. 콘텐츠 = conference.overview. */
export default function Overview() {
  const { heading, slogan, intro, days } = conference.overview;

  return (
    <section id="about" className={`${styles.overview} shell`}>
      <Reveal>
        <h2 className={styles.heading}>
          {heading}
          <span className={styles.slogan}> : {slogan}</span>
        </h2>

        <div className={styles.lead}>
          {intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className={styles.days}>
          {days.map((d) => (
            <div
              key={d.day}
              className={`${styles.dayBlock} ${d.day === 1 ? styles.d1 : styles.d2}`}
            >
              {/* creative/craft 컨셉 폐기 — 섹션 표기만(클라이언트 요청). */}
              <h3 className={styles.dayConcept}>
                section {d.day === 1 ? "A" : "B"}
              </h3>
              {/* 설명(본문)을 먼저 읽히고, 대상(직군)은 하단에 뱃지로 — 자연스러운
                  정보 위계 + 'UI 모듈' 효과(클라이언트 요청). */}
              <p className={styles.dayBody}>{d.body}</p>
              <ul className={styles.tags} aria-label="추천 대상">
                {d.audience.split(",").map((a, i) => (
                  <li key={i} className={styles.tag}>
                    {a.trim()}
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
