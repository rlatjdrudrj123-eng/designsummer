import Image from "next/image";
import styles from "./Benefits.module.css";
import Reveal from "@/components/develop/Reveal";
import { conference } from "@/lib/conference";
import { imageUrl } from "@/lib/images";

/* benefit (Aura 전용 / 메인 `/`) — 참가 혜택. 쨍한 컬러 가로 배너 3개(흰 텍스트).
   섹션 헤딩 없음(클라이언트 요청). 각 배너: [타이틀(+금액) + 설명] + 투명 PNG 비주얼.
   비주얼은 imageUrl(imageKey) 업로드(어드민 PNG) 시 표시, 없으면 플레이스홀더.
   콘텐츠 = conference.benefits.events. */
export default function Benefits() {
  const { events } = conference.benefits;

  return (
    <section id="benefits" className={`${styles.benefits} shell`} aria-labelledby="benefits-heading">
      <Reveal>
        {/* 섹션 헤딩은 화면에서 숨김(클라이언트 요청) — 헤딩 계층·검색엔진용 sr-only h2 유지. */}
        <h2 id="benefits-heading" className="srOnly">
          디자인 썸머 일산 참가 혜택
        </h2>
        <ul className={styles.banners}>
          {events.map((e, i) => {
            const img = imageUrl(e.imageKey);
            return (
              <li key={i} className={styles.banner}>
                <div className={styles.bannerText}>
                  <h3 className={styles.bannerTitle}>{e.title}</h3>
                  <p className={styles.body}>{e.body}</p>
                </div>
                <div className={styles.bannerVisual}>
                  {img ? (
                    <Image
                      src={img}
                      alt={`디자인 썸머 일산 참가 혜택 — ${e.title} (${e.amount})`}
                      fill
                      sizes="(max-width: 760px) 90vw, 240px"
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <span className={styles.visualPh} aria-hidden="true">
                      {e.title}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
