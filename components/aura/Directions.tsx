import styles from "./Directions.module.css";
import VenueMap from "@/components/develop/VenueMap";
import { conference } from "@/lib/conference";
import { siteContent } from "@/lib/content";

/* 오시는 길 · 문의 (Aura 전용 포크) — 위치(주소·주차) + 안내 도면 + 문의.
   (forked from components/aura1/Directions.tsx — independent of /aura1.)

   주최/정원/참가비/일시는 상단 개요(Overview)의 참가 정보 스트립에 있고,
   여기에는 '오시는 길'(위치·도면)과 '문의'(연락처)만 남긴다.
   안내 도면(VenueMap)은 인라인 SVG 다이어그램(사진 아님)으로 유지한다. */
export default function Directions() {
  const { address, parking } = conference.info;
  const rows: { label: string; value: string }[] = [
    { label: "주소", value: address },
    { label: "주차", value: parking },
  ];

  return (
    <section id="venue" className={styles.venue}>
      <h2 className={styles.heading}>오시는 길 · 문의</h2>

      {/* dl 자체가 전폭 — 상단 룰과 각 행의 하단 룰이 컨테이너 전체에 걸친다. */}
      <dl className={styles.meta}>
        {rows.map((r) => (
          <div key={r.label} className={styles.metaRow}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
        <div className={styles.metaRow}>
          <dt>문의</dt>
          <dd>
            <a className={styles.contactLink} href={`mailto:${siteContent.contact}`}>
              {siteContent.contact}
            </a>
          </dd>
        </div>
      </dl>

      <div className={styles.mapWrap}>
        <VenueMap />
        <p className={styles.mapNote}>
          ※ 안내 도면(샘플) — 실제 행사 도면으로 교체 예정
        </p>
      </div>
    </section>
  );
}
