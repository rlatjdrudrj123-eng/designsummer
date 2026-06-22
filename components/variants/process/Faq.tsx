import styles from "./Faq.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [PROCESS · CMYK 변형] FAQ — conference.faq. native <details> 로 접근성·무JS 토글. */
export default function Faq() {
  return (
    <section id="faq" className={`${styles.faq} shell`}>
      <Reveal>
        <p className={styles.tag}>FAQ</p>
        <ul className={styles.list}>
          {conference.faq.map((f, i) => (
            <li key={i} className={styles.item}>
              <details className={styles.details}>
                <summary className={styles.summary}>
                  <span className={styles.q}>{f.q}</span>
                  <span className={styles.mark} aria-hidden="true" />
                </summary>
                <p className={styles.a}>{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
