"use client";

import { useState } from "react";
import styles from "./FaqSection.module.css";
import Reveal from "./Reveal";
import { conference } from "./conference";

/* FAQ — conference.faq (q/a). 접근 가능한 disclosure:
   <button> 토글(포커스 가능, Enter/Space 기본 동작), aria-expanded + 패널 연결. */
export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className={`${styles.faq} shell`}>
      <Reveal>
        <p className={styles.kicker}>FAQ</p>
        <h2 className={styles.heading}>자주 묻는 질문</h2>

        <ul className={styles.list}>
          {conference.faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={i} className={styles.item}>
                <h3 className={styles.qWrap}>
                  <button
                    type="button"
                    className={styles.q}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className={styles.qText}>{item.q}</span>
                    <span className={styles.icon} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={styles.panel}
                  hidden={!isOpen}
                >
                  <p className={styles.a}>{item.a}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
