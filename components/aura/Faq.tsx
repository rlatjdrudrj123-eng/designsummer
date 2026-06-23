import styles from "./Faq.module.css";
import { conference } from "@/lib/conference";

/* FAQ (Aura 전용 포크) — conference.faq (q/a).
   (forked from components/aura1/Faq.tsx — independent of /aura1.)

   접근성: 네이티브 <details>/<summary> 디스클로저로 구현. 키보드 포커스·
   Enter/Space 토글이 브라우저 기본 동작으로 보장되며 스크립트가 필요 없다(서버 컴포넌트). */
export default function Faq() {
  return (
    <section id="faq" className={styles.faq}>
      <h2 className={styles.heading}>FAQ</h2>

      {/* ul/li 가 전폭 — 상단 룰 + 각 항목 하단 룰이 컨테이너 전체에 걸친다. */}
      <ul className={styles.list}>
        {conference.faq.map((item, i) => (
          <li key={i} className={styles.item}>
            <details className={styles.details} open={i === 0}>
              <summary className={styles.summary}>
                <span className={styles.qText}>{item.q}</span>
                <span className={styles.icon} aria-hidden="true" />
              </summary>
              <div className={styles.panel}>
                <p className={styles.a}>{item.a}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
