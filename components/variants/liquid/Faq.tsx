import styles from "./Faq.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [LIQUID 변형] 자주 묻는 질문 — 네이티브 <details> 아코디언 (라이브러리 무사용,
   키보드·스크린리더 접근성 기본 제공). 공식 컨퍼런스 콘텐츠. */
export default function Faq() {
  return (
    <section id="faq" className={`${styles.faq} shell`}>
      <Reveal>
        <p className={styles.tag}>FAQ</p>
      </Reveal>
      <Reveal className={styles.list}>
        {conference.faq.map((item, i) => (
          <details key={i} className={styles.item}>
            <summary className={styles.q}>
              <span className={styles.qText}>{item.q}</span>
              <span className={styles.icon} aria-hidden="true" />
            </summary>
            <p className={styles.a}>{item.a}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
