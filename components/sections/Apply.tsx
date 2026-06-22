import styles from "./Apply.module.css";
import { speakers } from "@/lib/content";

/* 마감 마퀴 — 연사 업체명이 흐른다 (사이트 유일 marquee, 가이드 7장).
   신청은 각 날(D1/D2)·타임테이블에 버튼이 있으므로, 여기는 라인업 띠만 둔다. */
export default function Apply() {
  const names = speakers.map((s) => s.studio);
  const seq = [...names, ...names]; // translateX(-50%) 무한 루프용 2배

  return (
    <section id="apply" className={styles.apply}>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          {seq.map((n, i) => (
            <span key={i}>
              {n}&nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
