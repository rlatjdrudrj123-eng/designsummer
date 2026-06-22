import styles from "./Directions.module.css";
import Reveal from "./Reveal";
import VenueMap from "./VenueMap";
import { conference } from "@/lib/conference";

/* [PROCESS · CMYK 변형] 안내 및 오시는 길 — conference.info.
   주최 / 정원 / 참가비(20,000원) / 주소 / 주차 안내 + 안내 도면. */
export default function Directions() {
  const { host, capacity, price, address, parking } = conference.info;
  const rows = [
    { label: "주최", value: host },
    { label: "참가비", value: price, accent: true },
    { label: "정원", value: capacity },
    { label: "주소", value: address },
    { label: "주차", value: parking },
  ];

  return (
    <section id="venue" className={`${styles.venue} shell`}>
      <Reveal>
        <p className={styles.tag}>안내 · 오시는 길</p>
        <p className={styles.place}>{address}</p>

        <dl className={styles.info}>
          {rows.map((r) => (
            <div key={r.label} className={styles.metaRow}>
              <dt>{r.label}</dt>
              <dd className={r.accent ? styles.price : undefined}>{r.value}</dd>
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
