import styles from "./Apply.module.css";
import Reveal from "./Reveal";
import { speakers } from "@/lib/content";
import { conference } from "./conference";

/* 신청 — 페이지 마무리 섹션. 일자별 사전등록 2버튼 + 참가비·정원 안내.
   상단 라인업 띠는 거터 안에서 줄바꿈되는 정적 스튜디오 리스트(잘림 없음). */
export default function Apply() {
  const names = speakers.map((s) => s.studio);
  const { register } = conference.hero;
  const { price, capacity } = conference.info;

  return (
    <section id="apply" className={`${styles.apply} shell`}>
      <Reveal>
        <p className={styles.kicker}>Apply</p>
        <h2 className={styles.heading}>시각의 전환, 실무의 확장 — 함께하세요</h2>

        {/* 연사 스튜디오 라인업 — 줄바꿈 정적 리스트(잘림 없음). */}
        <ul className={styles.studios} aria-label="참여 스튜디오">
          {names.map((n, i) => (
            <li key={i} className={styles.studio}>
              {n}
            </li>
          ))}
        </ul>

        {/* 일자별 사전등록 2버튼 — 각자 자신의 url 로 링크 아웃. */}
        <div className={styles.actions}>
          {register.map((r) => (
            <a
              key={r.day}
              className={styles.cta}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{r.label} →</span>
            </a>
          ))}
        </div>

        <p className={styles.note}>
          참가비 {price} · {capacity}
        </p>
      </Reveal>
    </section>
  );
}
