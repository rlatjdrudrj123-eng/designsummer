import styles from "./Faq.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [HEATMAP 변형] FAQ — conference.faq 로 렌더. 네이티브 details/summary (라이브러리 없음). */
export default function Faq() {
  return (
    <section id="faq" className={`${styles.faq} shell`}>
      <Reveal>
        <p className={styles.tag}>FAQ</p>
        <div className={styles.list}>
          {conference.faq.map((f, i) => (
            <details key={i} className={styles.item}>
              <summary className={styles.q}>
                <span className={styles.num}>Q{i + 1}</span>
                <span className={styles.qText}>{f.q}</span>
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
