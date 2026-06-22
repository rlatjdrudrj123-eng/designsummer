import styles from "./Apply.module.css";
import Reveal from "@/components/develop/Reveal";
import { speakers } from "@/lib/content";
import { conference } from "@/components/develop/conference";

/* 신청 — Aura1 전용 포크. 공유 develop/Apply 와 동일하되 하단 안내 노트
   ("참가비 … · 일별 선착순 …")만 제거한다. CTA 제목 + 일자별 사전등록 2버튼은
   그대로 유지. 공유 Apply 는 건드리지 않으므로 develop/`/aura` 는 노트를 유지한다. */
export default function Apply() {
  const names = speakers.map((s) => s.studio);
  const { register } = conference.hero;

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

        {/* NOTE: 하단 참가비·정원 안내 노트는 Aura1 포크에서 의도적으로 제거됨. */}
      </Reveal>
    </section>
  );
}
