import styles from "./Apply.module.css";
import { speakers } from "@/lib/content";

/* [HEATMAP 변형] 원본 components/sections/Apply.tsx 클론 (변경 없음). */
export default function Apply() {
  const names = speakers.map((s) => s.studio);
  const seq = [...names, ...names]; // translateX(-50%) 무한 루프용 2배

  return (
    <section id="apply" className={styles.apply}>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          {seq.map((n, i) => (
            <span key={i}>
              {n}&nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
