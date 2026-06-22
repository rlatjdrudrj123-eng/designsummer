import styles from "./Benefits.module.css";
import Reveal from "./Reveal";
import { conference } from "@/lib/conference";

/* [LIQUID 변형] 연계 이벤트 및 참가 혜택. 공식 컨퍼런스 콘텐츠. */
export default function Benefits() {
  const { benefits } = conference;
  return (
    <section id="benefits" className={`${styles.benefits} shell`}>
      <Reveal>
        <p className={styles.tag}>참가 혜택</p>
      </Reveal>
      <div className={styles.groups}>
        {benefits.groups.map((g, gi) => (
          <Reveal key={gi} className={styles.group}>
            <h3 className={styles.heading}>{g.heading}</h3>
            <ul className={styles.items}>
              {g.items.map((it, i) => (
                <li key={i} className={styles.item}>
                  <p className={styles.itemTitle}>{it.title}</p>
                  <p className={styles.itemBody}>{it.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
