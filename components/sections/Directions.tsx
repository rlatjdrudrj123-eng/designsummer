import styles from "./Directions.module.css";
import Reveal from "@/components/scroll/Reveal";
import VenueMap from "./VenueMap";
import { siteContent } from "@/lib/content";

/* 오시는 길 (가이드 8장) — 장소 + 안내 도면(풀폭). 절제된 톤. */
export default function Directions() {
  return (
    <section id="venue" className={`${styles.venue} shell`}>
      <Reveal>
        <p className={styles.tag}>오시는 길</p>
        <p className={styles.place}>{siteContent.venue}</p>
        <div className={styles.mapWrap}>
          <VenueMap />
          <p className={styles.mapNote}>※ 안내 도면(샘플) — 실제 행사 도면으로 교체 예정</p>
        </div>
      </Reveal>
    </section>
  );
}
