/* ============================================================================
 * `/r?a={animalId}` — 동물상 테스트 결과 전용 페이지(서버 컴포넌트).
 *
 * 홈(`/`)은 정적으로 두고, 공유된 결과는 이 별도 라우트에서 렌더한다. 공유 버튼이
 * 복사한 링크(`/r?a={id}`)로 진입하면 카톡/트위터에 동적 OG 카드(`/r/og`)가 뜬다.
 *
 * 데이터는 lib/animalTest 의 ANIMALS/SWAN 을 import 만(수정 금지). 잘못된 a 는 홈으로.
 * 결과 URL 은 색인 방지(robots noindex). 디자인 톤은 AnimalTest 결과 카드 재사용.
 * ========================================================================== */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ANIMALS,
  SECTIONS,
  SWAN,
  TEST_COPY,
  type Animal,
  type AnimalId,
} from "@/lib/animalTest";
import { auraSpeakersByDayWith } from "@/lib/auraContent";
import { getAuraOverrides } from "@/lib/auraOverrides";
import CtaStrip from "./CtaStrip";
import styles from "./page.module.css";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** searchParams 의 a(동물 id) → 해당 Animal. 없거나 잘못되면 null. */
function resolveAnimal(a: string | string[] | undefined): Animal | null {
  const id = Array.isArray(a) ? a[0] : a;
  if (!id) return null;
  if (id === "swan") return SWAN;
  if (id in ANIMALS) return ANIMALS[id as Exclude<AnimalId, "swan">];
  return null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { a } = await searchParams;
  const animal = resolveAnimal(a);

  // a 없음/오류 → 홈 공통 OG 로 폴백(layout 의 기본 메타 상속). 색인만 막는다.
  if (!animal) {
    return {
      alternates: { canonical: "/r" },
      robots: { index: false, follow: true },
    };
  }

  const title = `내 작업 온도는 ${animal.tempLabel}°C · ${animal.name}`;
  const description = `“${animal.oneLiner}” — 디자이너 동물상 테스트로 나의 크리에이티브 온도를 측정해보세요.`;
  const ogImage = {
    url: `/r/og?a=${animal.id}`,
    width: 1200,
    height: 630,
    alt: `${animal.name} · ${animal.tempLabel}°C`,
  };

  return {
    title,
    description,
    alternates: { canonical: "/r" },
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { a } = await searchParams;
  const animal = resolveAnimal(a);
  if (!animal) redirect("/");

  /* 행사 요약 연사 명단 — 홈 라인업과 동일 소스(번들 + Firestore override 머지).
     day 1 → section A, day 2 → section B. 표시는 studio — name. */
  const ov = await getAuraOverrides();
  const LINEUP = [
    { ...SECTIONS.A, speakers: auraSpeakersByDayWith(1, ov) },
    { ...SECTIONS.B, speakers: auraSpeakersByDayWith(2, ov) },
  ] as const;

  return (
    <main className={styles.page}>
      <div className={`${styles.shell} shell`}>
        <Link href="/" className={styles.brandTop}>
          디자인 썸머 일산
        </Link>

        <article className={styles.result}>
          <div className={styles.resultMain}>
            <div className={styles.resultMedia}>
              <Image
                src={`/animals/${animal.id}.png`}
                alt={`${animal.name} (${animal.emoji})`}
                width={380}
                height={380}
                className={styles.animalImg}
                priority
              />
              <p className={styles.resultLead}>{animal.name}</p>
            </div>

            <div className={styles.resultText}>
              <p className={styles.temp}>
                {animal.tempLabel}
                <span>°C</span>
              </p>
              <p className={styles.oneLiner}>“{animal.oneLiner}”</p>
              <p className={styles.desc}>{animal.desc}</p>

              {animal.id === "swan" ? (
                <p className={styles.matchSwan}>
                  <span className={styles.matchKey}>숨은 자아</span>
                  <span className={styles.matchWhy}>
                    모든 디자이너 안에 한 마리쯤 있는 모습
                  </span>
                </p>
              ) : (
                <dl className={styles.match}>
                  <div className={styles.matchRow}>
                    <dt className={styles.matchKey}>찰떡</dt>
                    <dd className={styles.matchVal}>
                      <span className={styles.matchAnimal}>
                        {animal.good?.emoji} {animal.good?.animal}
                      </span>
                      <span className={styles.matchWhy}>{animal.good?.why}</span>
                    </dd>
                  </div>
                  <div className={styles.matchRow}>
                    <dt className={styles.matchKey}>상극</dt>
                    <dd className={styles.matchVal}>
                      <span className={styles.matchAnimal}>
                        {animal.worst?.emoji} {animal.worst?.animal}
                      </span>
                      <span className={styles.matchWhy}>{animal.worst?.why}</span>
                    </dd>
                  </div>
                </dl>
              )}

              {/* ② 나도 측정하기(재진입) — 궁합 바로 아래 작은 텍스트 CTA. */}
              <div className={styles.minorActions}>
                <Link href="/#animaltest" className={styles.retryLink}>
                  {TEST_COPY.retryCta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ① "부족한 1%"(핵심 전환) — 아이브로우 + 결핍 문구 + 추천 섹션 신청.
              섹션은 animal.section 직접 사용(결핍을 채워줄 곳). */}
          {(() => {
            const rec = SECTIONS[animal.section]; // 추천 섹션 A/B
            return (
              <div className={styles.gapBlock}>
                <p className={styles.gapTitle}>
                  <span aria-hidden="true">🎟️</span> {TEST_COPY.gapTitle}
                </p>
                <p className={styles.gapText}>{animal.gap}</p>
                <CtaStrip
                  className={styles.gapCta}
                  href={rec.url}
                  animalId={animal.id}
                  section={animal.section}
                >
                  {rec.date} · {rec.key} · {rec.title} {TEST_COPY.gapCta}{" "}
                  <span aria-hidden="true">→</span>
                </CtaStrip>
              </div>
            );
          })()}
        </article>

        <section className={styles.event}>
          <h2 className={styles.eventTitle}>디자인 썸머 일산</h2>
          <p className={styles.eventDesc}>
            디자인과 인쇄 산업의 접점에서 새로운 비즈니스 가능성을 탐구하는 디자이너
            세미나. 실무 최전선의 스페셜리스트 8인이 이틀에 걸쳐 인사이트를 나눕니다.
          </p>
          <dl className={styles.eventInfo}>
            <div>
              <dt>일시</dt>
              <dd>2026.08.20(목)–08.21(금)</dd>
            </div>
            <div>
              <dt>장소</dt>
              <dd>KINTEX 제2전시장 3층 301호</dd>
            </div>
            <div>
              <dt>section A</dt>
              <dd>디자인의 새로운 관점</dd>
            </div>
            <div>
              <dt>section B</dt>
              <dd>디자인 실무의 확장</dd>
            </div>
          </dl>

          {/* ── 연사 명단 — 누가 오는지(소속 — 이름). section A(day1) / B(day2). ── */}
          <div className={styles.lineup}>
            {LINEUP.map((sec) => (
              <div key={sec.key} className={styles.lineupCol}>
                <p className={styles.lineupLabel}>
                  {sec.key} · {sec.title}
                </p>
                <ul className={styles.lineupList}>
                  {sec.speakers.map((sp) => (
                    <li key={sp.id} className={styles.lineupItem}>
                      <span className={styles.lineupStudio}>{sp.studio}</span>
                      <span className={styles.lineupDash} aria-hidden="true">
                        —
                      </span>
                      <span className={styles.lineupName}>{sp.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
