import styles from "./TempTest.module.css";
import Reveal from "@/components/develop/Reveal";
import { conference } from "@/lib/conference";

/* 온도 테스트 (Aura 전용 / 메인 `/`) — Benefits 직후 풀폭 띠 배너.
   제목(+이모지) → 설명 + CTA(아웃라인 펄, 사선 화살표). 콘텐츠 = benefits.temperatureTest. */
export default function TempTest() {
  const t = conference.benefits.temperatureTest;

  return (
    <section id="temptest" className={styles.temp}>
      <Reveal className={styles.inner}>
        <h2 className={styles.title}>
          {t.title}{" "}
          <span className={styles.emoji} aria-hidden="true">
            {t.emoji}
          </span>
        </h2>
        <div className={styles.row}>
          <p className={styles.body}>{t.body}</p>
          <a
            className={styles.cta}
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.cta}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
