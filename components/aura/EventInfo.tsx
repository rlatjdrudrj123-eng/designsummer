import styles from "./Overview.module.css";
import Reveal from "@/components/develop/Reveal";
import { conference } from "@/lib/conference";

/* EventInfo (Aura 전용 / 메인 `/`) — 개요의 마무리 문장 + Information 블록.
   클라이언트 요청으로 개요에서 분리해 타임테이블 아래로 배치.
   스타일은 Overview.module.css 의 .closing/.facts 계열을 재사용한다. */
export default function EventInfo() {
  // 마무리 문장은 개요 인트로로 이동(클라이언트 요청). 여기서는 Information 만.
  const { info } = conference.overview;

  return (
    <section className={`${styles.overview} ${styles.afterTable} shell`}>
      <Reveal>
        <dl className={styles.facts}>
          {info.map((f) => (
            <div key={f.label} className={styles.fact}>
              <dt className={styles.factLabel}>{f.label}</dt>
              <dd className={styles.factValue}>{f.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
