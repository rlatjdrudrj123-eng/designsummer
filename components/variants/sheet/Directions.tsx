import styles from "./Directions.module.css";
import Reveal from "./Reveal";
import VenueMap from "./VenueMap";
import { conference } from "@/lib/conference";

/* [SHEET 변형] 안내 · 오시는 길 — 공식 conference.info 렌더.
   주최 / 정원 / 참가비(20,000원) / 주소 / 주차 + 안내 도면. */
export default function Directions() {
  const info = conference.info;
  const rows: { dt: string; dd: string }[] = [
    { dt: "주최", dd: info.host },
    { dt: "정원", dd: info.capacity },
    { dt: "참가비", dd: info.price },
    { dt: "주소", dd: info.address },
    { dt: "주차", dd: info.parking },
  ];

  return (
    <section id="venue" className={`${styles.venue} shell`}>
      <Reveal>
        <p className={styles.tag}>안내 · 오시는 길</p>
        <p className={styles.place}>{conference.hero.venue}</p>

        <dl className={styles.meta}>
          {rows.map((r) => (
            <div key={r.dt} className={styles.metaRow}>
              <dt>{r.dt}</dt>
              <dd>{r.dd}</dd>
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
