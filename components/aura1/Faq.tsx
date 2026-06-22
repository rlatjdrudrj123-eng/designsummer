import styles from "./Faq.module.css";
import { conference } from "@/lib/conference";

/* FAQ (Aura1 전용 포크) — conference.faq (q/a). 공유 파일은 수정하지 않는다.

   접근성: 네이티브 <details>/<summary> 디스클로저로 구현. 키보드 포커스·
   Enter/Space 토글이 브라우저 기본 동작으로 보장되며 스크립트가 필요 없다(서버 컴포넌트).

   FIX (클라이언트 — "구분선이 중간에 끊긴다"): 공유본은 리스트를
   max-width:80ch 로 좁혀 헤어라인이 컨테이너보다 안쪽에서 끊겨 보였다. 이 포크는
   리스트(=룰을 가진 박스)를 정규 컨테이너 전폭으로 두고, 답변 텍스트만 가독 폭으로
   제한한다 → 룰은 전폭으로 깔끔, 가독성은 유지. */
export default function Faq() {
  return (
    <section id="faq" className={styles.faq}>
      <h2 className={styles.heading}>자주 묻는 질문</h2>

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
