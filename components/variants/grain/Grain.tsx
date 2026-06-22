"use client";

import type { ReactNode } from "react";
import { Archivo } from "next/font/google";
import {
  siteContent,
  speakers,
  speakersByDay,
  formatDate,
  type Speaker,
} from "@/lib/content";
import { imageUrl } from "@/lib/images";
import styles from "./Grain.module.css";
import HeatGlow from "./HeatGlow";
import GradientStar from "./GradientStar";
import Speckle from "./Speckle";

/**
 * GRAIN variant — a warm CREAM designer-freebie / zine poster, modelled
 * faithfully on a "GRADIENT MAPS VOL.02" resource poster.
 *
 * Identity:
 *  · CREAM off-white paper ground (#ece7da), covered everywhere in fine
 *    scattered DUST/SPECKLE grain (<Speckle/>, Canvas2D).
 *  · DARK near-black HEAVY GROTESQUE display type whose letters sit on a
 *    GRADIENT-MAP HEAT FIELD — a soft airbrushed chromatic glow (blue →
 *    magenta/red → orange) bleeds out from behind every letter (<HeatGlow/>,
 *    Canvas2D). This glow is the whole signature.
 *  · A big, heavily-blurred multi-point GRADIENT STAR heat-map smudge anchors
 *    the lower hero and is reused small as a section accent (<GradientStar/>).
 *
 * Self-contained, no props, normal document flow. All facts come from
 * @/lib/content. Scoped display font is Archivo (heavy grotesque). Motion is
 * limited to slow star drift, gated by prefers-reduced-motion inside the
 * canvas components / stylesheet.
 */
const display = Archivo({
  subsets: ["latin"],
  weight: ["600", "800", "900"],
  variable: "--grain-display",
  display: "swap",
});

const d1 = speakersByDay(1);
const d2 = speakersByDay(2);

function dateParts(iso: string) {
  const { md, dow } = formatDate(iso);
  const en = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
    new Date(`${iso}T00:00:00`).getDay()
  ];
  return { md, dow, en };
}
const dA = dateParts(siteContent.dates[0]);
const dB = dateParts(siteContent.dates[1]);
const yy = siteContent.edition.slice(2);

/**
 * The reference's signature mark: a solid BLACK rectangle holding "+N" in bold
 * WHITE, immediately followed by a small bold tracked dark label (".TALKS",
 * ".SESSIONS" …). Hard, inky, no rounding — mirrors the ref's "+20 .PSD FILE".
 */
function PlusTag({ num, label }: { num: string; label: string }) {
  return (
    <span className={styles.plusTag}>
      <span className={styles.plusBox}>{num}</span>
      <span className={styles.plusLabel}>{label}</span>
    </span>
  );
}

/** small bold tracked micro-label (no black box) */
function Kick({ children }: { children: ReactNode }) {
  return <span className={styles.kick}>{children}</span>;
}

function SpeakerCard({ s }: { s: Speaker }) {
  const portrait = imageUrl(`speaker-${s.id}`);
  const titleLines = s.sessionTitle.split("\n");
  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.cardPortrait}
            src={portrait}
            alt={`${s.studio} ${s.name}`}
            loading="lazy"
          />
        ) : (
          <div className={styles.cardPortraitPh} aria-hidden="true">
            {s.studioEn.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={styles.cardId}>
          <span className={styles.cardNo}>
            D{s.day}/{String(s.order).padStart(2, "0")}
          </span>
          <span className={styles.cardTime}>{s.time}</span>
        </div>
      </header>

      <div className={styles.cardStudioRow}>
        <span className={styles.cardStudio}>{s.studio}</span>
        <span className={styles.cardStudioEn}>{s.studioEn}</span>
      </div>

      <h3 className={styles.cardSession}>
        {titleLines.map((ln, i) => (
          <span key={i} className={styles.cardSessionLine}>
            {ln}
          </span>
        ))}
      </h3>
      <p className={styles.cardDesc}>{s.sessionDesc}</p>

      <p className={styles.cardName}>
        <b>{s.name}</b>
        <span>{s.role}</span>
      </p>

      {s.credentials.length > 0 && (
        <ul className={styles.creds}>
          {s.credentials.slice(0, 3).map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

function DayGroup({
  day,
  list,
  en,
  date,
}: {
  day: number;
  list: Speaker[];
  en: string;
  date: { md: string; en: string; dow: string };
}) {
  return (
    <div className={styles.dayGroup}>
      <div className={styles.dayBar}>
        <span className={styles.dayNo}>DAY {day}</span>
        <span className={styles.dayEn}>{en}</span>
        <span className={styles.dayDate}>
          {date.md}.{yy} · {date.en}
        </span>
      </div>
      <div className={styles.cardGrid}>
        {list.map((s) => (
          <SpeakerCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}

function TimeRow({ s }: { s: Speaker }) {
  const title = s.sessionTitle.replace(/\n/g, " ");
  return (
    <div className={styles.ttRow}>
      <span className={styles.ttTime}>{s.time}</span>
      <span className={styles.ttTitle}>{title}</span>
      <span className={styles.ttWho}>
        {s.studio} · {s.name}
      </span>
    </div>
  );
}

export default function Grain() {
  return (
    <div className={`${styles.wrap} ${display.variable}`}>
      {/* page-wide dust speckle over the cream paper (fixed, behind content) */}
      <Speckle />

      {/* ===================== HERO ===================== */}
      <header className={styles.hero}>
        {/* big blurry heat-map gradient star, lower-right (reference anchor) */}
        <GradientStar className={styles.heroStar} points={8} />

        {/* top-left black "+8 .SESSIONS" tag + edition handle */}
        <div className={styles.heroTop}>
          <PlusTag num={`+${speakers.length}`} label=".SESSIONS" />
          <span className={styles.heroEdition}>VOL.{siteContent.edition}</span>
        </div>

        {/* signature masthead: dark heavy grotesque DESIGN / SUMMER with the
            chromatic heat-gradient glow bleeding past the letters */}
        <HeatGlow
          as="h1"
          lines={["DESIGN", "SUMMER"]}
          className={styles.heroTitle}
          weight={900}
          intensity={1.25}
          lineGap={0.78}
          label={siteContent.title}
        />

        <div className={styles.heroMeta}>
          <span className={styles.heroVol}>VOL.{siteContent.edition}</span>
          <span className={styles.heroDot} aria-hidden="true">·</span>
          <span className={styles.heroKr}>{siteContent.title}</span>
        </div>

        <div className={styles.heroFoot}>
          <span className={styles.heroHandle}>@DESIGNSUMMER</span>
          <a
            className={styles.heroApply}
            href={siteContent.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            apply↗
          </a>
        </div>

        <div className={styles.heroStrip}>
          <span>{dA.md}({dA.dow})–{dB.md}({dB.dow}), {siteContent.edition}</span>
          <span>{siteContent.venue}</span>
          <span>{siteContent.capacity}석 한정</span>
        </div>
      </header>

      {/* ===================== INTRO / CONCEPT ===================== */}
      <section className={styles.intro} aria-labelledby="grain-intro">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <PlusTag num="01" label=".INTRO" />
            <HeatGlow
              as="h2"
              id="grain-intro"
              lines={["HEATWAVE"]}
              className={styles.sectionTitle}
              weight={900}
              intensity={0.9}
              label="THE CREATIVE HEATWAVE"
            />
          </div>
          <p className={styles.introLead}>{siteContent.intro.lead}</p>
          <p className={styles.introBody}>{siteContent.intro.body}</p>

          <div className={styles.conceptRow}>
            <div className={styles.conceptCard}>
              <Kick>DAY 1</Kick>
              <p className={styles.conceptEn}>{siteContent.concept.d1.en}</p>
              <h3 className={styles.conceptTitle}>{siteContent.concept.d1.title}</h3>
              <p className={styles.conceptBody}>{siteContent.concept.d1.body}</p>
              <ul className={styles.chips}>
                {siteContent.concept.d1.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.conceptCard} ${styles.conceptCardAlt}`}>
              <Kick>DAY 2</Kick>
              <p className={styles.conceptEn}>{siteContent.concept.d2.en}</p>
              <h3 className={styles.conceptTitle}>{siteContent.concept.d2.title}</h3>
              <p className={styles.conceptBody}>{siteContent.concept.d2.body}</p>
              <ul className={styles.chips}>
                {siteContent.concept.d2.modules.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LINEUP ===================== */}
      <section className={styles.lineup} aria-labelledby="grain-lineup">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <PlusTag num={`+${speakers.length}`} label=".SPEAKERS" />
            <HeatGlow
              as="h2"
              id="grain-lineup"
              lines={["LINEUP"]}
              className={styles.sectionTitle}
              weight={900}
              intensity={0.9}
              label="LINEUP"
            />
          </div>
          <DayGroup day={1} list={d1} en={siteContent.concept.d1.en} date={dA} />
          <DayGroup day={2} list={d2} en={siteContent.concept.d2.en} date={dB} />
        </div>
      </section>

      {/* ===================== TIMETABLE ===================== */}
      <section className={styles.timetable} aria-labelledby="grain-tt">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <PlusTag num="2D" label=".SCHEDULE" />
            <HeatGlow
              as="h2"
              id="grain-tt"
              lines={["TIMETABLE"]}
              className={styles.sectionTitle}
              weight={900}
              intensity={0.85}
              label="TIMETABLE"
            />
          </div>
          <div className={styles.ttGrid}>
            <div className={styles.ttCol}>
              <div className={styles.ttColHead}>
                <span className={styles.ttColDay}>DAY 1</span>
                <span className={styles.ttColMeta}>
                  {dA.md}.{yy} {dA.en} · {siteContent.concept.d1.en}
                </span>
              </div>
              {d1.map((s) => (
                <TimeRow key={s.id} s={s} />
              ))}
            </div>
            <div className={styles.ttCol}>
              <div className={styles.ttColHead}>
                <span className={styles.ttColDay}>DAY 2</span>
                <span className={styles.ttColMeta}>
                  {dB.md}.{yy} {dB.en} · {siteContent.concept.d2.en}
                </span>
              </div>
              {d2.map((s) => (
                <TimeRow key={s.id} s={s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== VENUE / INFO ===================== */}
      <section className={styles.venue} aria-labelledby="grain-venue">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <PlusTag num="↘" label=".VENUE" />
            <HeatGlow
              as="h2"
              id="grain-venue"
              lines={["KINTEX"]}
              className={styles.sectionTitle}
              weight={900}
              intensity={0.85}
              label="KINTEX"
            />
          </div>
          <dl className={styles.venueFacts}>
            <div className={styles.fact}>
              <dt>DATES</dt>
              <dd>
                {dA.md}({dA.dow}) – {dB.md}({dB.dow}), {siteContent.edition}
              </dd>
            </div>
            <div className={styles.fact}>
              <dt>VENUE</dt>
              <dd>{siteContent.venue}</dd>
            </div>
            <div className={styles.fact}>
              <dt>SEATS</dt>
              <dd>{siteContent.capacity}명 한정</dd>
            </div>
            <div className={styles.fact}>
              <dt>HOST</dt>
              <dd>{siteContent.host}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ===================== APPLY CTA ===================== */}
      <section className={styles.apply} aria-labelledby="grain-apply">
        <GradientStar className={styles.applyStar} points={8} spin={false} />
        <div className={styles.inner}>
          <PlusTag num={`${siteContent.capacity}`} label=".LAST CALL" />
          <HeatGlow
            as="h2"
            id="grain-apply"
            lines={["APPLY", "NOW"]}
            className={styles.applyTitle}
            weight={900}
            intensity={1.1}
            lineGap={0.8}
            label="APPLY NOW"
          />
          <p className={styles.applySub}>
            {siteContent.capacity}명 한정 · 선착순 신청. K-PRINT 공식 홈페이지에서 참가
            신청을 진행하세요.
          </p>
          <a
            className={styles.applyBtn}
            href={siteContent.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            신청하러 가기 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.footRow}>
            <span className={styles.footMark}>{siteContent.title}</span>
            <div className={styles.footMeta}>
              <span>{siteContent.host}</span>
              <a href={`mailto:${siteContent.contact}`}>{siteContent.contact}</a>
              <span>
                {siteContent.venue} · {dA.md}–{dB.md.split(".")[1]}, {siteContent.edition}
              </span>
            </div>
          </div>
          <div className={styles.footTags}>
            <Kick>@DESIGNSUMMER</Kick>
            <Kick>VOL.{siteContent.edition}</Kick>
            <Kick>{siteContent.tagline.toUpperCase()}</Kick>
          </div>
        </div>
      </footer>
    </div>
  );
}
