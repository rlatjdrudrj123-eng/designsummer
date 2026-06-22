import styles from "./Directions.module.css";
import Reveal from "./Reveal";
import VenueMap from "./VenueMap";
import { conference } from "./conference";
import { type Lang } from "./developEn";

/* 안내 및 오시는 길 — conference.info(주최·정원·참가비·주소·주차) + 안내 도면.
   콘텐츠는 ko/en 동일(한국어) — en 은 히어로 KV 타이틀만 영문이다. */
export default function Directions({}: { lang?: Lang } = {}) {
  const { host, capacity, price, address, parking } = conference.info;
  const rows: { label: string; value: string }[] = [
    { label: "주최", value: host },
    { label: "참가비", value: price },
    { label: "정원", value: capacity },
    { label: "주소", value: address },
    { label: "주차", value: parking },
  ];

  return (
    <section id="venue" className={`${styles.venue} shell`}>
      <Reveal>
        <p className={styles.kicker}>Venue</p>
        <h2 className={styles.heading}>안내 및 오시는 길</h2>

        <dl className={styles.meta}>
          {rows.map((r) => (
            <div key={r.label} className={styles.metaRow}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.mapWrap}>
          <VenueMap />
          <p className={styles.mapNote}>
            ※ 안내 도면(샘플) — 실제 행사 도면으로 교체 예정
          </p>
        </div>
      </Reveal>
    </section>
  );
}
