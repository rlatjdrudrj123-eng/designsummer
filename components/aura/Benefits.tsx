import styles from "./Benefits.module.css";
import Reveal from "@/components/develop/Reveal";
import { conference } from "@/lib/conference";

/* event (Aura 전용 / 메인 `/`) — 연계 이벤트 및 참가 혜택.
   위 섹션들과 톤앤매너 통일: 소문자 섹션 라벨("event"), 가로선·장식 아이콘 제거,
   여백으로만 구역 구분. 각 혜택은 깨끗한 글래스 카드(제목 + 본문)로 — 연사 카드와
   동일한 표면 톤. 콘텐츠 = conference.benefits.groups. */
export default function Benefits() {
  const { groups } = conference.benefits;

  return (
    <section id="benefits" className={`${styles.benefits} shell`}>
      <Reveal>
        <h2 className={styles.heading}>event</h2>

        <div className={styles.groups}>
          {groups.map((g, gi) => (
            <div key={gi} className={styles.group}>
              <h3 className={styles.groupHeading}>{g.heading}</h3>
              <ul className={styles.items}>
                {g.items.map((item, i) => (
                  <li key={i} className={styles.item}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    <p className={styles.itemBody}>{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
