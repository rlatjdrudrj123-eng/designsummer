"use client";

import { useRef } from "react";
import { speakers } from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { conference, type TimetableRow } from "../conference";
import Hero from "../Hero";
import PostHeroAura from "../PostHeroAura";
import Timetable from "../Timetable";
import Directions from "../Directions";
import Apply from "../Apply";
import Footer from "../Footer";
import ScrollCue from "../ScrollCue";
import { fraunces, inter } from "./serifFont";
import SerifPhoto from "./SerifPhoto";
import styles from "./SerifPage.module.css";

/* ──────────────────────────────────────────────────────────────────────────
   Concept 04 — SOFT SERIF EDITORIAL

   IMPORTANT: the KV is KEPT IDENTICAL. We reuse the develop warm heat-field
   <Hero/> unchanged, and the ONE continuous warm <PostHeroAura/> ground for
   everything below the hero (red-orange Day 1 → golden-yellow Day 2 drift),
   exactly mirroring develop/PostHeroRegion. The variety is expressed ONLY
   through FONT + LAYOUT + 배치 + EFFECT:

     · a large expressive Fraunces serif display (scoped variable font with
       SOFT/WONK/opsz axes) paired with a quiet Inter sans for meta
     · an airy, asymmetric EDITORIAL layout — generous whitespace, fine rules,
       italic session pull-quotes, very large serif studio names

   All surfaces are transparent so the warm aura shows through continuously;
   the ink is a dark warm tone that stays legible on the light warm field.
   Shared develop sections (Timetable / Directions / Apply / Footer) are reused
   verbatim. NO cream/ivory sheet is painted over the aura.

   CONTENT: every fact is verbatim from ../conference (the single official
   Design Summer 2026 copy). About / Audience / Lineup / Benefits / FAQ are all
   built locally in this serif-editorial style from `conference`; only the
   connective literary framing (EDITORIAL below) is concept copy.
   ────────────────────────────────────────────────────────────────────────── */

const CONCEPT_DESC =
  "잔잔하고 정제된 하이엔드 에디토리얼 — 큰 세리프와 여백의 호흡 (KV는 그대로, 폰트·레이아웃만 세리프)";

/* ──────────────────────────────────────────────────────────────────────────
   EDITORIAL-JOURNAL COPY (this concept only)

   SerifPage speaks in a literary editorial-journal voice — calm, essayistic,
   framed as a printed volume rather than a conference. None of this overwrites
   facts: every studio/name/role/session/credential/date/venue/host/applyUrl
   and all About/Audience/Benefits/FAQ text come verbatim from ../conference.
   This block only reframes the connective prose & headers, and deliberately
   frames the two days as journal volumes (Volume 01 / 02).
   ────────────────────────────────────────────────────────────────────────── */
const EDITORIAL = {
  introLabel: "편집자의 글",
  lede: "한 권으로 엮은 작업실의 여름.",
  aboutLabel: "행사 개요",
  audienceLabel: "이 글이 닿기를 바라는 독자",
  audienceTitle: "추천 대상",
  lineupLabel: "목소리들",
  lineupTitle: "여덟 개의 목소리",
  benefitsLabel: "곁들이는 페이지",
  benefitsTitle: "연계 이벤트 및 참가 혜택",
  faqLabel: "여백의 주석",
  faqTitle: "자주 묻는 질문",
  volumes: ["Volume 01", "Volume 02"] as const,
  chapterKo: ["첫째 날", "둘째 날"] as const,
} as const;

/* speaker lookup (studioEn / imageKey / credentials) keyed by Korean studio
   name — identical strings in conference.ts timetable rows and speakers.json,
   so the join is exact. Session title/desc/speaker/time stay verbatim from
   conference.ts. */
const speakerByStudio = new Map(speakers.map((s) => [s.studio, s]));

type SessionRow = TimetableRow & { kind?: "session" };

function sessionsOf(rows: readonly TimetableRow[]) {
  return rows.filter((r) => (r.kind ?? "session") === "session") as SessionRow[];
}

function SpeakerEntry({
  index,
  row,
  day,
  flip,
}: {
  index: number;
  row: SessionRow;
  day: 1 | 2;
  flip: boolean;
}) {
  const num = String(index).padStart(2, "0");
  const studio = row.studio ?? "";
  const meta = speakerByStudio.get(studio);
  const credentials = meta?.credentials ?? [];
  const studioEn = meta?.studioEn ?? "";
  const src = meta ? imageUrl(meta.imageKey) : null;

  // session titles may carry a manual line break (none today) — keep first
  // line as the pull-quote, fold the rest into a subline.
  const [quote, ...rest] = row.title.split("\n");

  return (
    <article className={`${styles.entry} ${flip ? styles.entryFlip : ""}`}>
      <header className={styles.entryHead}>
        <span className={`${fraunces.className} ${styles.entryNum}`}>{num}</span>
        <span className={styles.entryMeta}>
          Day {day} · {row.time}
        </span>
      </header>

      <div className={styles.entryGrid}>
        <div className={styles.entryFigure}>
          <SerifPhoto
            src={src}
            alt={`${studio} ${row.speaker ?? ""}`}
            initial={studio.charAt(0)}
          />
        </div>

        <div className={styles.entryBody}>
          <h3 className={`${fraunces.className} ${styles.entryStudio}`}>
            {studio}
          </h3>
          <p className={styles.entryWho}>
            {studioEn && (
              <>
                <span className={`${fraunces.className} ${styles.entryEn}`}>
                  {studioEn}
                </span>
                <span className={styles.dot}>·</span>
              </>
            )}
            {row.speaker}
          </p>

          <p className={`${fraunces.className} ${styles.entryQuote}`}>
            <span aria-hidden className={styles.quoteMark}>
              &ldquo;
            </span>
            {quote}
            <span aria-hidden className={styles.quoteMark}>
              &rdquo;
            </span>
          </p>
          {rest.length > 0 && (
            <p className={`${fraunces.className} ${styles.entrySubtitle}`}>
              {rest.join(" ")}
            </p>
          )}

          {row.desc && <p className={styles.entryDesc}>{row.desc}</p>}

          {credentials.length > 0 && (
            <ul className={styles.creds}>
              {credentials.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

export default function SerifPage() {
  const { hero, about, audience, benefits, faq, info } = conference;
  const day1Sessions = sessionsOf(conference.timetable.day1.rows);
  const day2Sessions = sessionsOf(conference.timetable.day2.rows);
  const sessionCount = day1Sessions.length + day2Sessions.length;

  // wrapper whose scroll travel drives PostHeroAura's warmth (red-orange → gold).
  const regionRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={`${fraunces.variable} ${inter.variable} ${styles.page}`}>
      {/* fixed concept chip — required */}
      <aside className={styles.chip} aria-label="concept">
        <span className={styles.chipNo}>Concept 04</span>
        <span className={`${fraunces.className} ${styles.chipName}`}>
          Soft Serif Editorial
        </span>
        <span className={styles.chipDesc}>{CONCEPT_DESC}</span>
      </aside>

      {/* ── KV — reused develop heat-field hero, UNCHANGED ───── */}
      <Hero />

      {/* ── below-hero region on the ONE continuous warm aura ──
          mirrors develop/PostHeroRegion: PostHeroAura at z-index 0, the
          (transparent) serif-editorial content floating above at z-index 1. */}
      <div ref={regionRef} className={styles.region}>
        <PostHeroAura targetRef={regionRef} />
        <div className={styles.content}>
          {/* ── ABOUT (행사 개요) — serif editorial opener on the aura ── */}
          <section className={`${styles.section} shell`} aria-labelledby="about-h">
            <div className={styles.introLead}>
              <p className={styles.kicker}>
                {EDITORIAL.introLabel}
                <span className={styles.dot}>·</span>
                {info.host}
              </p>
              <h2 id="about-h" className={`${fraunces.className} ${styles.introTitle}`}>
                <span className={styles.introTitleLine}>{hero.title}</span>
                <span className={`${styles.introTitleSub} ${styles.italic}`}>
                  {hero.subtitle}
                </span>
              </h2>
              <p className={`${fraunces.className} ${styles.lead}`}>
                {EDITORIAL.lede}
              </p>
              <p className={styles.introBody}>{hero.desc}</p>
              <p className={styles.introBody}>{about.intro}</p>
              <p className={styles.introNote}>{hero.note}</p>
            </div>

            {/* two day blocks — chapter cards framed as journal volumes */}
            <div className={styles.aboutGrid}>
              {about.days.map((d, i) => (
                <article key={d.day} className={styles.aboutDay}>
                  <div className={styles.aboutDayHead}>
                    <span className={styles.aboutVolume}>
                      {EDITORIAL.volumes[i]}
                    </span>
                    <span className={`${fraunces.className} ${styles.aboutDate}`}>
                      {d.date}
                    </span>
                  </div>
                  <h3 className={`${fraunces.className} ${styles.aboutDayTitle}`}>
                    {d.title}
                  </h3>
                  <p className={styles.aboutDayBody}>{d.body}</p>
                </article>
              ))}
            </div>

            <dl className={styles.facts}>
              <div>
                <dt>일정</dt>
                <dd>{hero.date}</dd>
              </div>
              <div>
                <dt>장소</dt>
                <dd>{hero.venue}</dd>
              </div>
              <div>
                <dt>참가비</dt>
                <dd>{info.price}</dd>
              </div>
              <div>
                <dt>정원</dt>
                <dd>{info.capacity}</dd>
              </div>
              <div>
                <dt>구성</dt>
                <dd>2일 · 세션 {sessionCount}개</dd>
              </div>
            </dl>
          </section>

          {/* ── AUDIENCE (추천 대상) ───────────────────────────── */}
          <section className={`${styles.section} shell`} aria-labelledby="audience-h">
            <div className={styles.sectionHead}>
              <span className={styles.secLabel}>{EDITORIAL.audienceLabel}</span>
              <h2 id="audience-h" className={`${fraunces.className} ${styles.secTitle}`}>
                {EDITORIAL.audienceTitle}
              </h2>
            </div>
            <div className={styles.audienceGrid}>
              {[
                { vol: EDITORIAL.volumes[0], a: audience.day1 },
                { vol: EDITORIAL.volumes[1], a: audience.day2 },
              ].map(({ vol, a }) => (
                <article key={vol} className={styles.audience}>
                  <span className={styles.audienceVolume}>{vol}</span>
                  <h3 className={`${fraunces.className} ${styles.audienceHeading}`}>
                    {a.heading}
                  </h3>
                  <ul className={styles.audienceList}>
                    {a.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* ── LINEUP — large serif studio names, italic pull-quotes ── */}
          <section className={`${styles.section} shell`} aria-labelledby="lineup-h">
            <div className={styles.sectionHead}>
              <span className={styles.secLabel}>{EDITORIAL.lineupLabel}</span>
              <h2 id="lineup-h" className={`${fraunces.className} ${styles.secTitle}`}>
                {EDITORIAL.lineupTitle}
              </h2>
            </div>

            <div id="day1" className={styles.dayBlock}>
              <p className={styles.dayRule}>
                <span className={`${fraunces.className} ${styles.italic}`}>
                  {EDITORIAL.volumes[0]}
                </span>
                <span className={styles.dayRuleKo}>
                  {EDITORIAL.chapterKo[0]} · {conference.timetable.day1.title}
                </span>
              </p>
              {day1Sessions.map((row, i) => (
                <SpeakerEntry
                  key={row.title}
                  index={i + 1}
                  row={row}
                  day={1}
                  flip={i % 2 === 1}
                />
              ))}
            </div>

            <div id="day2" className={styles.dayBlock}>
              <p className={styles.dayRule}>
                <span className={`${fraunces.className} ${styles.italic}`}>
                  {EDITORIAL.volumes[1]}
                </span>
                <span className={styles.dayRuleKo}>
                  {EDITORIAL.chapterKo[1]} · {conference.timetable.day2.title}
                </span>
              </p>
              {day2Sessions.map((row, i) => (
                <SpeakerEntry
                  key={row.title}
                  index={i + 1 + day1Sessions.length}
                  row={row}
                  day={2}
                  flip={i % 2 === 1}
                />
              ))}
            </div>
          </section>

          {/* ── shared develop TIMETABLE — reused verbatim on the aura ── */}
          <Timetable />

          {/* ── BENEFITS (혜택) ────────────────────────────────── */}
          <section className={`${styles.section} shell`} aria-labelledby="benefits-h">
            <div className={styles.sectionHead}>
              <span className={styles.secLabel}>{EDITORIAL.benefitsLabel}</span>
              <h2 id="benefits-h" className={`${fraunces.className} ${styles.secTitle}`}>
                {EDITORIAL.benefitsTitle}
              </h2>
            </div>
            <div className={styles.benefitsGroups}>
              {benefits.groups.map((g) => (
                <div key={g.heading} className={styles.benefitGroup}>
                  <h3 className={`${fraunces.className} ${styles.benefitHeading}`}>
                    {g.heading}
                  </h3>
                  <div className={styles.benefitItems}>
                    {g.items.map((it) => (
                      <article key={it.title} className={styles.benefit}>
                        <h4 className={`${fraunces.className} ${styles.benefitTitle}`}>
                          {it.title}
                        </h4>
                        <p className={styles.benefitBody}>{it.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── shared develop DIRECTIONS — reused verbatim on the aura ── */}
          <Directions />

          {/* ── FAQ ─────────────────────────────────────────────── */}
          <section className={`${styles.section} shell`} aria-labelledby="faq-h">
            <div className={styles.sectionHead}>
              <span className={styles.secLabel}>{EDITORIAL.faqLabel}</span>
              <h2 id="faq-h" className={`${fraunces.className} ${styles.secTitle}`}>
                {EDITORIAL.faqTitle}
              </h2>
            </div>
            <ul className={styles.faqList}>
              {faq.map((item, i) => (
                <li key={item.q} className={styles.faqItem}>
                  <p className={styles.faqQ}>
                    <span className={`${fraunces.className} ${styles.faqNum}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`${fraunces.className} ${styles.faqQText}`}>
                      {item.q}
                    </span>
                  </p>
                  <p className={styles.faqA}>{item.a}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* ── shared develop APPLY / FOOTER — reused verbatim ── */}
          <Apply />
          <Footer />
        </div>
      </div>

      <ScrollCue />
    </div>
  );
}
