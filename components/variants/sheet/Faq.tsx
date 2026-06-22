import styles from "./Faq.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [SHEET 변형] FAQ — 공식 conference.faq 렌더. 네이티브 details/summary 아코디언(무JS). */
export default function Faq() {
  return (
    <section id="faq" className={`${styles.faq} shell`}>
      <Reveal>
        <p className={styles.tag}>FAQ · 자주 묻는 질문</p>
        <div className={styles.list}>
          {conference.faq.map((f, i) => (
            <details key={i} className={styles.item}>
              <summary className={styles.q}>
                <span>{f.q}</span>
                <span className={styles.mark} aria-hidden="true" />
              </summary>
              <p className={styles.a}>{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
