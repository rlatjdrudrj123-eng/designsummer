"use client";

import { useState } from "react";
import { conference } from "../conference";
import styles from "./TerminalSections.module.css";

/* FAQ rendered as a query/response log — each question is a `?` query line that
 * expands to print its response. Facts verbatim from conference.faq. */
export default function TerminalFaq() {
  const faq = conference.faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className={`${styles.sect} shell`} aria-labelledby="t-faq-h">
      <div className={styles.inner}>
        <p className={styles.cmd}>
          <span className={styles.caret}>thermal@kprint:~$</span> query faq
          --interactive
        </p>
        <h2 id="t-faq-h" className={styles.head}>
          <span className={styles.headKick}>// SECTION 0x04</span>
          자주 묻는 질문
        </h2>

        <div className={styles.faqLog}>
          {faq.map((item, i) => {
            const isOpen = open === i;
            const qId = `faq-q-${i}`;
            const aId = `faq-a-${i}`;
            return (
              <div
                key={i}
                className={`${styles.faqEntry} ${isOpen ? styles.faqOpen : ""}`}
              >
                <button
                  type="button"
                  id={qId}
                  className={styles.faqQ}
                  aria-expanded={isOpen}
                  aria-controls={aId}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className={styles.faqMark}>?</span>
                  <span className={styles.faqQText}>{item.q}</span>
                  <span className={styles.faqToggle}>
                    {isOpen ? "[ − ]" : "[ + ]"}
                  </span>
                </button>
                {isOpen && (
                  <div id={aId} role="region" aria-labelledby={qId} className={styles.faqA}>
                    <span className={styles.faqMarkA}>›</span>
                    <p className={styles.faqAText}>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
