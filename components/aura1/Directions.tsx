import styles from "./Directions.module.css";
import VenueMap from "@/components/develop/VenueMap";
import { conference } from "@/lib/conference";
import { siteContent } from "@/lib/content";

/* 오시는 길 · 문의 (Aura1 전용 포크) — 위치(주소·주차) + 안내 도면 + 문의.
   공유 develop/Directions 에서 분기한 사본으로 공유 파일은 수정하지 않는다.

   주최/정원/참가비/일시는 상단 개요(Overview)의 참가 정보 스트립으로 이동했고,
   여기에는 '오시는 길'(위치·도면)과 '문의'(연락처)만 남긴다.

   FIX (클라이언트 피드백 — "가로 구분선이 중간에 끊겨 보인다"):
   공유본은 헤어라인을 .meta(max-width:720px) 안쪽에만 걸어, 컨테이너보다 좁은
   지점에서 라인이 끊겨 보였다. 이 포크는 모든 헤어라인 룰을 정규 컨테이너
   (max-width:1180px) 전폭에 깔끔하게 걸쳐지게 분리한다. 라벨/값 텍스트만
   가독 폭으로 제한하고, 룰(border) 자체는 행(.metaRow) 전폭을 차지한다. */
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
