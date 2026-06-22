import Image from "next/image";
import styles from "./Overview.module.css";
import Reveal from "@/components/develop/Reveal";
import { conference } from "@/lib/conference";
import { imageUrl } from "@/lib/images";

/* Overview — 단일 인트로 + 안내 스트립.
 *
 * 재구성: 기존엔 개요 자체가 Day1/Day2 박스로 갈리고, 아래 라인업도 Day1/Day2로
 * 갈려 중복·산만했다. 이제 개요는 행사 전체를 한 번에 소개하는 단일 블록만 담는다:
 *   - 헤딩 "디자인 썸머 일산"
 *   - 두 줄 인트로(about.intro), 전체 폭
 *   - 안내 키–값 스트립(주최/일시/참가비/정원)
 *
 * 날짜별 테마·추천 대상은 각 Day 라인업 섹션의 머리말로 이동했다(Lineup.tsx).
 *
 * 공유 develop 컴포넌트는 수정하지 않고 데이터만 재사용. */
export default function Overview() {
  const { intro } = conference.about;
  const { host, price, capacity } = conference.info;

  /* 참가 정보(안내) — 박스 없이 헤어라인 한 줄로만 구획한 키–값 스트립. */
  const facts: { label: string; value: string }[] = [
    { label: "주최", value: host },
    { label: "일시", value: conference.hero.date },
    { label: "참가비", value: price },
    { label: "정원", value: capacity },
  ];

  /* 지난 행사 사진 — past-1(큰 사진) + past-2·past-3(작은 사진 2장).
     미업로드 슬롯은 플레이스홀더로 자리를 지킨다. */
  const featured = imageUrl("past-1");
  const smalls = [imageUrl("past-2"), imageUrl("past-3")];

  return (
    <section id="about" className={`${styles.overview} shell`}>
      <Reveal>
        <h2 className={styles.heading}>디자인 썸머 일산</h2>

        <figure className={styles.gallery}>
          <div className={styles.galleryRow}>
            <div className={`${styles.shot} ${styles.shotLarge}`}>
              {featured ? (
                <Image
                  className={styles.shotImg}
                  src={featured}
                  alt="Design Summer 지난 현장 1"
                  fill
                  sizes="(max-width: 640px) 100vw, 760px"
                  loading="lazy"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <span className={styles.shotEmpty} aria-hidden="true" />
              )}
            </div>
            <div className={styles.shotColumn}>
              {smalls.map((url, i) => (
                <div
                  key={i}
                  className={`${styles.shot} ${styles.shotSmall}`}
                >
                  {url ? (
                    <Image
                      className={styles.shotImg}
                      src={url}
                      alt={`Design Summer 지난 현장 ${i + 2}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 380px"
                      loading="lazy"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span className={styles.shotEmpty} aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <figcaption className={styles.galleryCaption}>
            Design Summer 지난 현장
          </figcaption>
        </figure>

        <p className={styles.lead}>{intro}</p>

        <dl className={styles.facts}>
          {facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <dt className={styles.factLabel}>{f.label}</dt>
              <dd className={styles.factValue}>{f.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
