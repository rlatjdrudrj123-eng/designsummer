import styles from "./Directions.module.css";
import Reveal from "./Reveal";
import VenueMap from "./VenueMap";
import { conference } from "@/lib/conference";

/* [LIQUID 변형] 안내 · 오시는 길 — 주최/정원/참가비/주소/주차 + 안내 도면.
   공식 컨퍼런스 콘텐츠(@/lib/conference). */
export default function Directions() {
  const { info } = conference;
  const rows = [
    { label: "주최", value: info.host },
    { label: "정원", value: info.capacity },
    { label: "참가비", value: info.price },
    { label: "주소", value: info.address },
    { label: "주차", value: info.parking },
  ];

  return (
    <section id="venue" className={`${styles.venue} shell`}>
      <Reveal>
        <p className={styles.tag}>안내 · 오시는 길</p>
        <p className={styles.place}>{info.address}</p>
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
          <p className={styles.mapNote}>※ 안내 도면(샘플) — 실제 행사 도면으로 교체 예정</p>
        </div>
      </Reveal>
    </section>
  );
}
