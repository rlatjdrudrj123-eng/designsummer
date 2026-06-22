"use client";

import { useMemo } from "react";
import { speakers } from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { conference, type TimetableRow } from "../conference";
import { archivoBlack, spaceGrotesk } from "./kineticFont";
import KineticPhoto from "./KineticPhoto";
import Marquee from "./Marquee";
import Hero from "../Hero";
import PostHeroRegion from "../PostHeroRegion";
import Timetable from "../Timetable";
import Directions from "../Directions";
import Apply from "../Apply";
import Footer from "../Footer";
import styles from "./Kinetic.module.css";

/* =============================================================================
   CONCEPT 05 — KINETIC (REBALANCED)
   -----------------------------------------------------------------------------
   Renders the FULL official Design Summer 2026 content (components/develop/
   conference.ts) in the KINETIC register, layered OVER the shared warm ground:

     • <Hero/>            — the warm heat-field KV (HeatBlob), unchanged.
     • <PostHeroRegion/>  — the ONE continuous warm Aura ground (PostHeroAura),
                            unchanged; every section inside is transparent so the
                            same warm field shows through continuously.
     • ../Timetable, ../Directions, ../Apply, ../Footer reused VERBATIM.

   REBALANCED per client feedback. A previous pass over-corrected and gutted the
   concept; this restores the Kinetic IDENTITY while keeping the good B2B edits:

     RESTORED (Kinetic identity):
       • Heavy display face (Archivo Black) drives the section titles, day tags
         and the signature marquee — bold + confident again.
       • TWO tasteful kinetic accents: (1) a signature scrolling event-title
         marquee under the hero, (2) a studio/keyword ticker as the lineup
         divider. Both are scroll-velocity reactive (Marquee + useScrollVelocity)
         and FREEZE under prefers-reduced-motion.

     KEPT (good B2B edits — NOT undone):
       • Formal, objective section copy (기획 배경 / 참석 대상 / 연사 라인업 /
         오프라인 참석자 혜택 / 자주 묻는 질문), neutral DAY 01/02 labels — no hype.
       • Thin hairline .rule dividers + generous whitespace between sections.
       • NO return of the five loud full-width black/yellow/red color bands.

   ORDER: Hero → title MARQUEE → About(기획 배경) → Audience(참석 대상) →
          LINEUP(연사 라인업) [studio ticker divider] → ../Timetable →
          Benefits(오프라인 참석자 혜택) → ../Directions → FAQ(자주 묻는 질문) →
          ../Apply → ../Footer.

   No animation libraries — CSS + rAF only. prefers-reduced-motion respected.
   ========================================================================== */

const CONCEPT_DESC = "키네틱 — 볼드 디스플레이 + 시그니처 마퀴";

/* Calm, professional day labels (no momentum/hype). All FACTS come from
   conference.ts; these are neutral section descriptors only. */
const KIN = {
  d1: { en: "DAY 01", ko: "첫째 날" },
  d2: { en: "DAY 02", ko: "둘째 날" },
};

/* sessions only (drops reg / break rows) */
const sessions = (rows: readonly TimetableRow[]) =>
  rows.filter((r) => (r.kind ?? "session") === "session");

/* photo + credential enrichment for a lineup row, matched by studio against the
   speaker records (conference.ts carries no imageKey/credentials). */
function enrich(studio?: string | null) {
  const s = speakers.find((sp) => sp.studio === studio);
  return {
    img: s ? imageUrl(s.imageKey) : null,
    studioEn: s?.studioEn ?? "",
    creds: s?.credentials ?? [],
  };
}

export default function KineticPage() {
  const cf = conference;
  const d1Rows = useMemo(() => sessions(cf.timetable.day1.rows), [cf]);
  const d2Rows = useMemo(() => sessions(cf.timetable.day2.rows), [cf]);

  /* Signature title ticker (under the hero): the event title + subtitle as a
     repeating phrase. Facts only, from conference.ts. */
  const titleTicker = useMemo(
    () => [
      cf.hero.title,
      cf.hero.subtitle,
      "K-PRINT 2026",
      cf.hero.title,
      cf.hero.subtitle,
      "KINTEX",
    ],
    [cf]
  );

  /* Lineup divider ticker: the eight studios (KR + EN where known), pulled from
     the timetable session rows + speaker enrichment — names only, no hype. */
  const studioTicker = useMemo(() => {
    const rows = [...d1Rows, ...d2Rows];
    const out: string[] = [];
    for (const r of rows) {
      if (!r.studio) continue;
      const { studioEn } = enrich(r.studio);
      out.push(studioEn ? `${r.studio} ${studioEn}` : r.studio);
    }
    return out;
  }, [d1Rows, d2Rows]);

  return (
    <div
      className={`${styles.root} ${archivoBlack.variable} ${spaceGrotesk.variable}`}
    >
      {/* concept chip ----------------------------------------------------- */}
      <div className={styles.conceptChip} aria-label="concept">
        <strong>Concept 05 — Kinetic</strong>
        <span>{CONCEPT_DESC}</span>
      </div>

      {/* ================= HERO (KEPT IDENTICAL — develop warm heat-field KV) */}
      <Hero />

      {/* ================= BELOW HERO — ONE continuous warm Aura ground ===== */}
      <PostHeroRegion>
        {/* ===== SIGNATURE KINETIC MARQUEE (accent 1 of 2) — event title
                ticker riding the aura, bold display, scroll-reactive ===== */}
        <Marquee
          items={titleTicker}
          baseDuration={34}
          direction={1}
          separator="✳"
          className={styles.marqueeTitle}
          ariaLabel="Design Summer 2026"
        />

        <div className={styles.kinetic}>
          {/* ===================== ABOUT (기획 배경) ===================== */}
          <section className={styles.about} aria-label="기획 배경">
            <div className={styles.aboutHead}>
              <p className={styles.kicker}>ABOUT · 기획 배경</p>
              <h2 className={styles.sectionTitle}>기획 배경</h2>
              <p className={styles.aboutIntro}>{cf.about.intro}</p>
            </div>
            <div className={styles.dayBlocks}>
              {cf.about.days.map((d) => (
                <article
                  key={d.day}
                  className={`${styles.dayBlock} ${styles[`d${d.day}` as "d1" | "d2"]}`}
                >
                  <p className={styles.dayBlockTag}>
                    {(d.day === 1 ? KIN.d1 : KIN.d2).en}
                    <span> · {(d.day === 1 ? KIN.d1 : KIN.d2).ko}</span>
                  </p>
                  <p className={styles.dayBlockMeta}>{d.date}</p>
                  <h3 className={styles.dayBlockTitle}>{d.title}</h3>
                  <p className={styles.dayBlockBody}>{d.body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* hairline divider + whitespace between ABOUT and AUDIENCE */}
          <div className={styles.rule} role="presentation" />

          {/* =================== AUDIENCE (참석 대상) =================== */}
          <section className={styles.audience} aria-label="참석 대상">
            <div className={styles.audienceHead}>
              <p className={styles.kicker}>AUDIENCE · 참석 대상</p>
              <h2 className={styles.sectionTitle}>참석 대상</h2>
            </div>
            <div className={styles.audienceGrid}>
              {[
                { day: 1, ...cf.audience.day1 },
                { day: 2, ...cf.audience.day2 },
              ].map((a) => (
                <article
                  key={a.day}
                  className={`${styles.audienceCol} ${styles[`d${a.day}` as "d1" | "d2"]}`}
                >
                  <p className={styles.audienceDay}>DAY 0{a.day}</p>
                  <h3 className={styles.audienceHeading}>{a.heading}</h3>
                  <ul className={styles.audienceList}>
                    {a.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* hairline divider + whitespace before the lineup */}
          <div className={styles.rule} role="presentation" />

          {/* ===================== LINEUP (연사 라인업) ===================== */}
          <section className={styles.lineup} aria-label="연사 라인업">
            <div className={styles.lineupHead}>
              <p className={styles.kicker}>LINEUP · 연사 라인업</p>
              <h2 className={styles.sectionTitle}>연사 라인업</h2>
              <p className={styles.sectionSub}>
                이틀에 걸쳐 여덟 명의 연사가 세션을 진행합니다.
              </p>
            </div>

            {/* ===== KINETIC ACCENT (2 of 2) — studio ticker as the lineup
                    divider. Scroll-reactive, freezes under reduced-motion ===== */}
            <Marquee
              items={studioTicker}
              baseDuration={28}
              direction={-1}
              separator="·"
              className={styles.marqueeStudios}
              ariaLabel="연사 스튜디오"
            />

            <DayGroup
              label="DAY 01"
              date={cf.timetable.day1.date}
              tone="d1"
              rows={d1Rows}
            />
            <DayGroup
              label="DAY 02"
              date={cf.timetable.day2.date}
              tone="d2"
              rows={d2Rows}
            />
          </section>
        </div>

        {/* ===== SHARED SCHEDULE (reused verbatim, on the same aura) ===== */}
        <Timetable />

        {/* =================== BENEFITS (오프라인 참석자 혜택) =================== */}
        <section className={`${styles.kinetic} ${styles.benefitsWrap}`} aria-label="오프라인 참석자 혜택">
          <div className={styles.rule} role="presentation" />
          <div className={styles.benefits}>
            <div className={styles.benefitsHead}>
              <p className={styles.kicker}>BENEFITS · 참석자 혜택</p>
              <h2 className={styles.sectionTitle}>오프라인 참석자 혜택</h2>
            </div>
            {cf.benefits.groups.map((g) => (
              <div key={g.heading} className={styles.benefitGroup}>
                <h3 className={styles.benefitGroupHead}>{g.heading}</h3>
                <ul className={styles.benefitList}>
                  {g.items.map((it) => (
                    <li key={it.title} className={styles.benefitItem}>
                      <h4 className={styles.benefitTitle}>{it.title}</h4>
                      <p className={styles.benefitBody}>{it.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SHARED VENUE (reused verbatim, on the same aura) ===== */}
        <Directions />

        {/* =================== FAQ (자주 묻는 질문) =================== */}
        <section className={`${styles.kinetic} ${styles.faqWrap}`} aria-label="자주 묻는 질문">
          <div className={styles.rule} role="presentation" />
          <div className={styles.faq}>
            <div className={styles.faqHead}>
              <p className={styles.kicker}>FAQ · 자주 묻는 질문</p>
              <h2 className={styles.sectionTitle}>자주 묻는 질문</h2>
            </div>
            <ul className={styles.faqList}>
              {cf.faq.map((f, i) => (
                <li key={f.q} className={styles.faqItem}>
                  <p className={styles.faqQ}>
                    <span className={styles.faqNum}>
                      Q{String(i + 1).padStart(2, "0")}
                    </span>
                    {f.q}
                  </p>
                  <p className={styles.faqA}>{f.a}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===== SHARED APPLY + FOOTER (reused verbatim, on the same aura) ===== */}
        <Apply />
        <Footer />
      </PostHeroRegion>
    </div>
  );
}

/* ----------------------------- sub-components ----------------------------- */

function DayGroup({
  label,
  date,
  tone,
  rows,
}: {
  label: string;
  date: string;
  tone: "d1" | "d2";
  rows: TimetableRow[];
}) {
  return (
    <div className={`${styles.dayGroup} ${styles[tone]}`}>
      <h3 className={styles.dayLabel}>
        {label} <span className={styles.dayLabelDate}>{date}</span>
      </h3>
      <div className={styles.cards}>
        {rows.map((r) => (
          <SpeakerCard key={`${r.studio}-${r.time}`} row={r} />
        ))}
      </div>
    </div>
  );
}

function SpeakerCard({ row }: { row: TimetableRow }) {
  const { img, studioEn, creds } = enrich(row.studio);
  const titleLines = row.title.split("\n");
  return (
    <article className={styles.card}>
      <div className={styles.cardMedia}>
        <KineticPhoto src={img} alt={`${row.speaker ?? row.studio} 사진`} />
        <span className={styles.cardTime}>{row.time}</span>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardStudio}>
          {row.studio} {studioEn && <span>{studioEn}</span>}
        </p>
        {row.speaker && <p className={styles.cardName}>{row.speaker}</p>}
        <h4 className={styles.cardTitle}>
          {titleLines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </h4>
        {row.desc && <p className={styles.cardDesc}>{row.desc}</p>}
        {creds.length > 0 && (
          <ul className={styles.cardCreds}>
            {creds.map((cr) => (
              <li key={cr}>{cr}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
