"use client";

import { useRef } from "react";
import Hero from "../Hero";
import PostHeroAura from "../PostHeroAura";
import Timetable from "../Timetable";
import Directions from "../Directions";
import Apply from "../Apply";
import Footer from "../Footer";
import { speakers, speakersByDay } from "@/lib/content";
import { imageUrl } from "@/lib/images";
import { conference } from "../conference";
import { antonDisplay, archivoLabel } from "./risoFont";
import Halftone from "./Halftone";
import styles from "./RisoPage.module.css";

/* ──────────────────────────────────────────────────────────────────────────
 * Concept 03 — RISOGRAPH POSTER (KV-PRESERVING, FULL conference.ts content)
 *
 * The KV is KEPT IDENTICAL: the develop <Hero/> (warm heat-field hero) is
 * reused unchanged, and the SAME continuous warm Aura ground (<PostHeroAura/>)
 * runs behind EVERYTHING below it. The riso "print" identity is expressed ONLY
 * through FONT / LAYOUT / EFFECT applied as OVERLAYS on top of that warm aura.
 *
 * This page now renders the FULL official Design Summer 2026 content from
 * ../conference.ts — verbatim facts — in the riso poster register:
 *   Hero → About → Audience → riso LINEUP tiles → shared Timetable →
 *   Benefits → shared Directions → FAQ → shared Apply → shared Footer.
 *
 * The shared Timetable / Directions / Apply / Footer stay transparent and float
 * on the same aura. About / Audience / Benefits / FAQ are built HERE in riso
 * style (condensed poster font, halftone/misregistration overlays, print/press
 * voice) — NOT imported from the shared About/Audience/Benefits/Faq.
 * ────────────────────────────────────────────────────────────────────────── */

const CONCEPT_DESC =
  "리소그래프 포스터 — 8인의 세션을 두 번의 인쇄로 찍어내는 에디션";

/* RISO PRINT-SHOP COPY — this concept's OWN press register (editions, passes,
 * plates). No facts invented: the only number borrowed is the real per-day
 * capacity (150 → "EDITION OF 150") and the real 2-day run. All speaker /
 * date / venue / session facts stay verbatim from ../conference.ts. */
const RISO_COPY = {
  kicker: ["K-PRINT 2026 PRESS", "EDITION OF 150"],
  pressLine: "2-DAY PRINT RUN · 8 SESSIONS · ONE PRESS",
  lineupTitle: "PRINT RUN",
  lineupSub: "EDITION OF 150 · 8 SESSIONS · 2 PASSES",
  d1: { pass: "FIRST PASS", plate: "ORANGE PLATE" },
  d2: { pass: "SECOND PASS", plate: "BLUE PLATE" },
} as const;

const TONE_BY_DAY = { 1: "orange", 2: "blue" } as const;

export default function RisoPage() {
  const regionRef = useRef<HTMLDivElement | null>(null);

  const d1 = speakersByDay(1);
  const d2 = speakersByDay(2);

  const { about, audience, benefits, faq, hero } = conference;

  return (
    <main
      className={`${styles.page} ${antonDisplay.variable} ${archivoLabel.variable}`}
    >
      {/* concept chip — kept (Concept 03 · Risograph Poster) */}
      <aside className={styles.conceptChip} aria-label="concept">
        <span className={styles.chipNo}>Concept 03</span>
        <span className={styles.chipName}>Risograph Poster</span>
        <span className={styles.chipDesc}>{CONCEPT_DESC}</span>
      </aside>

      {/* ── KV : reused develop Hero, UNCHANGED ───────────────────────── */}
      <Hero />

      {/* ── BELOW-HERO REGION : the ONE continuous warm Aura ground ───── */}
      <div ref={regionRef} className={styles.region}>
        <PostHeroAura targetRef={regionRef} />

        <div className={styles.regionInner}>
          {/* ── ABOUT (행사 개요) : riso display type ON the warm aura ── */}
          <section className={styles.intro} aria-labelledby="riso-intro-h">
            {/* misregistered ghost word — transparent overlay */}
            <div className={styles.misreg} aria-hidden="true">
              <span className={styles.misOrange}>SUMMER</span>
              <span className={styles.misBlue}>SUMMER</span>
            </div>

            <p className={styles.introKicker}>
              {RISO_COPY.kicker.map((k) => (
                <span key={k}>{k}</span>
              ))}
            </p>
            <h2 id="riso-intro-h" className={styles.introTitle}>
              {hero.title}
            </h2>
            <p className={styles.pressLine}>{RISO_COPY.pressLine}</p>
            <p className={styles.introLead}>{hero.subtitle}</p>
            <p className={styles.introBody}>{about.intro}</p>

            <p className={styles.runMeta}>
              <span>{hero.date}</span>
              <span>{hero.venue}</span>
            </p>

            {/* two day blocks — reframed as press passes / plates */}
            <div className={styles.conceptDuo}>
              {about.days.map((day) => {
                const tone = TONE_BY_DAY[day.day as 1 | 2];
                const press = day.day === 1 ? RISO_COPY.d1 : RISO_COPY.d2;
                return (
                  <AboutPanel
                    key={day.day}
                    day={day.day}
                    pass={press.pass}
                    plate={press.plate}
                    date={day.date}
                    title={day.title}
                    body={day.body}
                    tone={tone}
                  />
                );
              })}
            </div>
          </section>

          {/* ── AUDIENCE (추천 대상) : two press-target columns ───────── */}
          <section className={styles.audience} aria-labelledby="riso-aud-h">
            <div className={styles.bandHead}>
              <h2
                id="riso-aud-h"
                className={styles.bandTitle}
                data-text="WHO SHOULD PRINT"
              >
                WHO SHOULD PRINT
              </h2>
              <p className={styles.bandSub}>추천 대상 · TWO PASSES, TWO READERS</p>
            </div>
            <div className={styles.audGrid}>
              <AudienceCard
                day={1}
                pass={RISO_COPY.d1.pass}
                plate={RISO_COPY.d1.plate}
                heading={audience.day1.heading}
                items={audience.day1.items}
                tone="orange"
              />
              <AudienceCard
                day={2}
                pass={RISO_COPY.d2.pass}
                plate={RISO_COPY.d2.plate}
                heading={audience.day2.heading}
                items={audience.day2.items}
                tone="blue"
              />
            </div>
          </section>

          {/* ── LINEUP : poster / postage-stamp tiles ON the warm aura ── */}
          <section className={styles.lineup} aria-labelledby="riso-lineup-h">
            <div className={styles.bandHead}>
              <h2
                id="riso-lineup-h"
                className={styles.bandTitle}
                data-text={RISO_COPY.lineupTitle}
              >
                {RISO_COPY.lineupTitle}
              </h2>
              <p className={styles.bandSub}>{RISO_COPY.lineupSub}</p>
            </div>

            <DayRow
              label="DAY 01"
              en={`${RISO_COPY.d1.pass} · ${RISO_COPY.d1.plate}`}
              list={d1}
              tone="orange"
            />
            <DayRow
              label="DAY 02"
              en={`${RISO_COPY.d2.pass} · ${RISO_COPY.d2.plate}`}
              list={d2}
              tone="blue"
            />
          </section>

          {/* ── SCHEDULE : shared transparent section ──────────────────── */}
          <Timetable />

          {/* ── BENEFITS (혜택) : riso "INSERTS" stamp list ────────────── */}
          <section className={styles.benefits} aria-labelledby="riso-ben-h">
            <div className={styles.bandHead}>
              <h2
                id="riso-ben-h"
                className={styles.bandTitle}
                data-text="INSERTS"
              >
                INSERTS
              </h2>
              <p className={styles.bandSub}>참가 혜택 · FREE WITH EVERY EDITION</p>
            </div>
            <div className={styles.benGroups}>
              {benefits.groups.map((g, gi) => (
                <article
                  key={g.heading}
                  className={`${styles.benGroup} ${
                    gi % 2 === 0 ? styles.orange : styles.blue
                  }`}
                >
                  <Halftone
                    color={
                      gi % 2 === 0
                        ? "rgba(214,72,30,0.34)"
                        : "rgba(20,30,90,0.3)"
                    }
                    from="top"
                    spacing={11}
                    className={styles.halftoneOverlay}
                  />
                  <div className={styles.benInner}>
                    <p className={styles.benIndex}>
                      No.{String(gi + 1).padStart(2, "0")}
                    </p>
                    <h3 className={styles.benHeading}>{g.heading}</h3>
                    <ul className={styles.benList}>
                      {g.items.map((it) => (
                        <li key={it.title} className={styles.benItem}>
                          <p className={styles.benItemTitle}>{it.title}</p>
                          <p className={styles.benItemBody}>{it.body}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── VENUE : shared transparent section ─────────────────────── */}
          <Directions />

          {/* ── FAQ : riso "COLOPHON" Q&A ─────────────────────────────── */}
          <section className={styles.faq} aria-labelledby="riso-faq-h">
            <div className={styles.bandHead}>
              <h2
                id="riso-faq-h"
                className={styles.bandTitle}
                data-text="COLOPHON"
              >
                COLOPHON
              </h2>
              <p className={styles.bandSub}>자주 묻는 질문 · PRESS NOTES</p>
            </div>
            <ol className={styles.faqList}>
              {faq.map((item, i) => (
                <li key={item.q} className={styles.faqItem}>
                  <span className={styles.faqNo} aria-hidden="true">
                    Q{String(i + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.faqQa}>
                    <p className={styles.faqQ}>{item.q}</p>
                    <p className={styles.faqA}>{item.a}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ── APPLY / FOOTER : shared transparent sections ───────────── */}
          <Apply />
          <Footer />
        </div>
      </div>
    </main>
  );
}

/* ── sub-components ───────────────────────────────────────────────────── */

function AboutPanel({
  day,
  pass,
  plate,
  date,
  title,
  body,
  tone,
}: {
  day: number;
  pass: string;
  plate: string;
  date: string;
  title: string;
  body: string;
  tone: "orange" | "blue";
}) {
  return (
    <article className={`${styles.conceptPanel} ${styles[tone]}`}>
      <Halftone
        color={tone === "orange" ? "rgba(214,72,30,0.4)" : "rgba(20,30,90,0.36)"}
        from="top"
        spacing={12}
        className={styles.halftoneOverlay}
      />
      <div className={styles.conceptInner}>
        <p className={styles.conceptDay}>
          PASS {day} · {plate} · {date}
        </p>
        <h3 className={styles.conceptEn} data-text={pass}>
          {pass}
        </h3>
        <p className={styles.conceptTitle}>{title}</p>
        <p className={styles.conceptBody}>{body}</p>
      </div>
    </article>
  );
}

function AudienceCard({
  day,
  pass,
  plate,
  heading,
  items,
  tone,
}: {
  day: number;
  pass: string;
  plate: string;
  heading: string;
  items: readonly string[];
  tone: "orange" | "blue";
}) {
  return (
    <article className={`${styles.audCard} ${styles[tone]}`}>
      <p className={styles.audKicker}>
        <span className={styles.audPass}>{pass}</span>
        <span>
          DAY {String(day).padStart(2, "0")} · {plate}
        </span>
      </p>
      <h3 className={styles.audHeading}>{heading}</h3>
      <ul className={styles.audList}>
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </article>
  );
}

function DayRow({
  label,
  en,
  list,
  tone,
}: {
  label: string;
  en: string;
  list: typeof speakers;
  tone: "orange" | "blue";
}) {
  return (
    <div className={`${styles.dayRow} ${styles[tone]}`}>
      <div className={styles.dayRowHead}>
        <span className={styles.dayRowLabel}>{label}</span>
        <span className={styles.dayRowEn}>{en}</span>
      </div>
      <div className={styles.stampGrid}>
        {list.map((s) => (
          <SpeakerStamp key={s.id} s={s} tone={tone} />
        ))}
      </div>
    </div>
  );
}

function SpeakerStamp({
  s,
  tone,
}: {
  s: (typeof speakers)[number];
  tone: "orange" | "blue";
}) {
  const photo = imageUrl(`speaker-${s.id}`);
  const titleLines = s.sessionTitle.split("\n");
  return (
    <article className={`${styles.stamp} ${styles[tone]}`}>
      <div className={styles.stampPerf} aria-hidden="true" />

      <div className={styles.stampPhoto}>
        <Halftone
          color={
            tone === "orange" ? "rgba(214,72,30,0.55)" : "rgba(20,30,90,0.55)"
          }
          from="bottom"
          spacing={6}
          className={styles.halftoneOverlay}
        />
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.stampImg}
            src={photo}
            alt={`${s.studio} ${s.name}`}
            loading="lazy"
          />
        ) : (
          <span className={styles.stampInitial} aria-hidden="true">
            {s.studioEn.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className={styles.stampBody}>
        <p className={styles.stampTime}>{s.time}</p>
        <p className={styles.stampStudioEn}>{s.studioEn}</p>
        <h4 className={styles.stampStudio}>
          {s.studio}
          <span className={styles.stampName}>
            {s.name} · {s.role}
          </span>
        </h4>
        <p className={styles.stampSession}>
          {titleLines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </p>
        <p className={styles.stampDesc}>{s.sessionDesc}</p>
        {s.credentials.length > 0 && (
          <ul className={styles.stampCreds}>
            {s.credentials.slice(0, 3).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
